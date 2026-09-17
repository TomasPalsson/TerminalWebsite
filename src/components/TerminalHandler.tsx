'use client'

import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { KeyPressContext, type TerminalShortcut } from "../context/KeypressedContext";
import { commandMap } from "./commands/CommandMap";
import { extractText } from "../utils/textExtraction";
import { loadPersistedColor } from "../utils/colorPersistence";
import { fileSystem } from "../services/filesystem";
import { aliasService } from "../services/alias";
import { envService } from "../services/env";
import {
  TerminalOutput,
  TerminalPrompt,
  TerminalSuggestions,
  ReverseSearchPrompt,
} from "./terminal";
import { completeInput, type TabState } from "./terminal/tabCompletion";

// Commands that accept filesystem paths as arguments
// Used to enable filesystem path completion instead of command completion
const fsCommands = ['cd', 'ls', 'cat', 'touch', 'mkdir', 'rm', 'rmdir', 'cp', 'mv', 'find', 'grep', 'vim'];

type Props = {
  onBufferChange?: (lines: string[]) => void;
  headless?: boolean;
};

const PROMPT = "$ ";

const TerminalHandler = ({ onBufferChange, headless = false }: Props) => {
  const context = useContext(KeyPressContext);
  const router = useRouter();

  if (!context)
    throw new Error("TerminalHandler must be used within KeyPressProvider");

  const { text, clearText, cursorPos, setText, setCursorPos, subscribeInput } = context;

  const [output, setOutput] = useState<ReactNode[]>([]);
  type PlainLine = { text: string; command: boolean };
  const [plainLines, setPlainLines] = useState<PlainLine[]>([]);
  const [lastCommandTokens, setLastCommandTokens] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [tabState, setTabState] = useState<TabState | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const colorPersistedRef = useRef(false);

  useEffect(() => {
    if (colorPersistedRef.current) return;
    loadPersistedColor();
    colorPersistedRef.current = true;
  }, []);

  /* helper to push a React line + its text twin */
  const pushLine = (node: ReactNode) => {
    setOutput((prev) => [...prev, node]);

    const extracted = extractText(node);
    const split = extracted
      .split(/\r?\n/) // break on \n
      .filter(Boolean); // toss empties
    // All output lines from pushLine are command output, not command prompts
    // The actual command prompt is added in the buffer effect with PROMPT prefix
    setPlainLines((prev) => [
      ...prev,
      ...split.map((t) => ({ text: t, command: false })),
    ]);

    // Scroll to bottom after state updates
    requestAnimationFrame(() => {
      const container = containerRef.current || bottomRef.current?.closest('.overflow-y-auto');
      if (container) {
        containerRef.current = container as HTMLElement;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    });
  };

  /** Silent inline expansion of !!, !$ and !* against the last command (errors surface on submit) */
  const expandInline = (current: string): string => {
    if (!lastCommandTokens.length) return current;
    const hasPrevArgs = lastCommandTokens.length > 1;
    return current
      .split(/\s+/)
      .map((tok) => {
        if (tok === "!!") return lastCommandTokens.join(" ");
        if (tok === "!$" && hasPrevArgs) return lastCommandTokens[lastCommandTokens.length - 1];
        if (tok === "!*" && hasPrevArgs) return lastCommandTokens.slice(1).join(" ");
        return tok;
      })
      .join(" ");
  };

  /* Accept reverse search result on Enter
     Ctrl+R search is case-insensitive and searches from most recent to oldest */
  const acceptReverseSearch = (query: string) => {
    const match = [...commandHistory].reverse().find((cmd) =>
      cmd.toLowerCase().includes(query.toLowerCase())
    );
    // Fall back to the query itself if no match found
    const resolved = match ?? query;
    setSearchMode(false);
    setText(resolved);
    setCursorPos(resolved.length);
  };

  /* User typed, pasted, deleted or pressed Enter: drop completions, expand history refs */
  const handleInput = (nextText: string) => {
    setSuggestions(null);
    setTabState(null);

    const current = nextText.replace(/\n$/, "");
    if (searchMode) {
      if (nextText.endsWith("\n")) acceptReverseSearch(current);
      return;
    }

    const expanded = expandInline(current);
    if (expanded !== current) {
      const trailingNewline = nextText.endsWith("\n") ? "\n" : "";
      const cursorOffset = expanded.length - current.length;
      setText(expanded + trailingNewline);
      setCursorPos((prev) => Math.min(Math.max(0, prev + cursorOffset), expanded.length));
    }
  };

  const setLine = (line: string) => {
    setText(line);
    setCursorPos(line.length);
  };

  const navigateHistory = (direction: "up" | "down") => {
    if (direction === "up" && !commandHistory.length) return;
    if (direction === "down" && historyIndex === null) return;
    const nextIndex =
      direction === "up"
        ? historyIndex === null
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1)
        : historyIndex! >= commandHistory.length - 1
          ? null
          : historyIndex! + 1;
    setSuggestions(null);
    setTabState(null);
    setHistoryIndex(nextIndex);
    setLine(nextIndex === null ? "" : commandHistory[nextIndex]);
  };

  const completeTab = () => {
    const result = completeInput(text.replace(/\n$/, ""), tabState, {
      fsCommands,
      commandNames: ["clear", ...Array.from(commandMap.keys())],
      getPathCompletions: (prefix) => {
        fileSystem.initialize();
        return fileSystem.getCompletions(prefix);
      },
    });
    if (!result) {
      setSuggestions(null);
      return;
    }
    setLine(result.text);
    setSuggestions(result.suggestions);
    setTabState(result.tabState);
  };

  const handleShortcut = (name: TerminalShortcut) => {
    if (name === "ctrl+r") {
      setSearchMode(true);
      setHistoryIndex(null);
      setSuggestions(null);
      setTabState(null);
      setLine("");
      return;
    }
    if (searchMode) return;
    if (name === "history-up") navigateHistory("up");
    else if (name === "history-down") navigateHistory("down");
    else if (name === "tab") completeTab();
  };

  /* Keyboard input arrives as events from the provider; resubscribe so the handler sees fresh state */
  useEffect(() =>
    subscribeInput((event) => {
      if (event.type === "shortcut") handleShortcut(event.name);
      else handleInput(event.text);
    })
  );

  /* command processing */
  useEffect(() => {
    const processCommand = async () => {
      if (searchMode) return;
      if (!text.endsWith("\n")) return;

      const cmd = text.trim();
      if (!cmd) {
        clearText();
        return;
      }

      const rawTokens = cmd.split(/\s+/);

      const expandedTokens: string[] = [];
      let expansionError: React.ReactNode | null = null;

      rawTokens.forEach((token) => {
        if (token === "!!") {
          if (!lastCommandTokens.length) {
            expansionError = <span className="text-red-500">No previous command to repeat.</span>;
            return;
          }
          expandedTokens.push(...lastCommandTokens);
          return;
        }
        if (token === "!$") {
          if (lastCommandTokens.length < 2) {
            expansionError = <span className="text-red-500">No previous argument to use.</span>;
            return;
          }
          expandedTokens.push(lastCommandTokens[lastCommandTokens.length - 1]);
          return;
        }
        if (token === "!*") {
          if (lastCommandTokens.length < 2) {
            expansionError = <span className="text-red-500">No previous arguments to use.</span>;
            return;
          }
          expandedTokens.push(...lastCommandTokens.slice(1));
          return;
        }
        expandedTokens.push(token);
      });

      // Expand aliases
      aliasService.initialize();
      const expandedCommand = aliasService.expand(expandedTokens.join(' '));
      const aliasExpandedTokens = expandedCommand.split(/\s+/);

      // Expand environment variables in each token
      envService.initialize();
      const finalTokens = aliasExpandedTokens.map(token => envService.expand(token));

      if (expansionError) {
        pushLine(
          <div key={crypto.randomUUID()} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-terminal">❯</span>{" "}
              <span className="font-medium text-white">{cmd}</span>
            </div>
            <div className="ml-4">
              {expansionError}
            </div>
          </div>
        );
        clearText();
        return;
      }

      const [base, ...args] = finalTokens;
      const command = commandMap.get(base);

      if (base === "clear") {
        setOutput([]);
        setPlainLines([]);
        clearText();
        setLastCommandTokens([]);
        setHistoryIndex(null);
        setSuggestions(null);
        setTabState(null);

        // Scroll to the top after clearing
        const container = bottomRef.current?.parentElement;
        if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      if (command) {

        const result = await command.run(args, context);
        if (command.name === "exit") setTimeout(() => router.push("/"), 1000);
        if (result) {
          pushLine(
            <div key={crypto.randomUUID()} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-terminal">❯</span>{" "}
                <span className="font-medium text-white">{base}</span>
                {args.length > 0 && (
                  <span className="text-gray-500"> {args.join(" ")}</span>
                )}
              </div>
              <div className="ml-4">
                {result}
              </div>
            </div>
          );
        }
        setLastCommandTokens(finalTokens);
        setCommandHistory((prev) => {
          const next = [...prev, expandedTokens.join(" ")];
          return next.slice(-50);
        });
      } else {
        pushLine(
          <div key={crypto.randomUUID()} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-terminal">❯</span>{" "}
              <span className="font-medium text-white">{base}</span>
              {args.length > 0 && (
                <span className="text-gray-500"> {args.join(" ")}</span>
              )}
            </div>
            <div className="ml-4">
              <p className="text-red-400">
                Command not found: <span className="font-medium">{cmd}</span>
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Type <span className="text-terminal">help</span> to see available commands
              </p>
            </div>
          </div>
        );
        setLastCommandTokens(finalTokens);
        setCommandHistory((prev) => {
          const next = [...prev, expandedTokens.join(" ")];
          return next.slice(-50);
        });
      }

      clearText();
    };

    processCommand();
  }, [text]);

  /* Sync terminal buffer to 3D CRT canvas for headless mode */
  useEffect(() => {
    if (!onBufferChange) return;
    const live = text.replace(/\n$/, ""); // Strip trailing newline while typing
    // Normalize prompt characters for 3D mode (❯ -> $)
    const mapped = plainLines.map((l) =>
      l.text.startsWith('❯ ') ? PROMPT + l.text.slice(2) : l.text
    );
    const liveWithPrompt = PROMPT + live;
    onBufferChange([...mapped, liveWithPrompt]);
  }, [plainLines, text]);

  /* Ensure scrolling when output changes */
  useEffect(() => {
    requestAnimationFrame(() => {
      const container = containerRef.current || bottomRef.current?.closest('.overflow-y-auto');
      if (container) {
        containerRef.current = container as HTMLElement;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    });
  }, [output]);

  /* -------- HTML terminal (hidden in headless mode) -------- */
  if (headless) return null;

  const liveText = text.replace(/\n$/, "");

  if (searchMode) {
    const query = liveText;
    const match = [...commandHistory].reverse().find((cmd) =>
      cmd.toLowerCase().includes(query.toLowerCase())
    );
    return (
      <>
        <TerminalOutput output={output} prompt={PROMPT} />
        <ReverseSearchPrompt query={query} matchedCommand={match ?? null} />
        <div ref={bottomRef} className="h-8" />
      </>
    );
  }

  return (
    <>
      <TerminalOutput output={output} prompt={PROMPT} />
      <TerminalPrompt prompt={PROMPT} text={text} cursorPos={cursorPos} />
      <TerminalSuggestions suggestions={suggestions} />
      <div ref={bottomRef} className="h-8" />
    </>
  );
};

export default TerminalHandler;

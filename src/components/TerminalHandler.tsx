import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { KeyPressContext } from "../context/KeypressedContext";
import { commandMap } from "./commands/CommandMap";
import { useNavigate } from "react-router";
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

// Commands that accept filesystem paths as arguments
const fsCommands = ['cd', 'ls', 'cat', 'touch', 'mkdir', 'rm', 'rmdir', 'cp', 'mv', 'find', 'grep'];

type Props = {
  onBufferChange?: (lines: string[]) => void;
  headless?: boolean;
};

const PROMPT = "$ ";

const TerminalHandler = ({ onBufferChange, headless = false }: Props) => {
  const context = useContext(KeyPressContext);
  const navigate = useNavigate();

  if (!context)
    throw new Error("TerminalHandler must be used within KeyPressProvider");

  const { text, clearText, cursorPos, setText, setCursorPos, shortcut, clearShortcut } = context;

  const [output, setOutput] = useState<ReactNode[]>([]);
  type PlainLine = { text: string; command: boolean };
  const [plainLines, setPlainLines] = useState<PlainLine[]>([]);
  const [lastCommandTokens, setLastCommandTokens] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [tabState, setTabState] = useState<{ prefix: string; candidates: string[]; index: number } | null>(null);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const expandingRef = useRef(false);
  const tabEditRef = useRef(false);
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
    setPlainLines((prev) => [
      ...prev,
      ...split.map((t, idx) => ({ text: t, command: idx === 0 })),
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

  /* inline history expansion (!!, !$, !*) */
  useEffect(() => {
    if (!tabEditRef.current) {
      setSuggestions(null);
      if (tabState) setTabState(null);
    }
    tabEditRef.current = false;
    if (expandingRef.current) {
      expandingRef.current = false;
      return;
    }

    const hasHistory = lastCommandTokens.length > 0;
    if (!hasHistory) return;

    const hasPrevArgs = lastCommandTokens.length > 1;
    const current = text.replace(/\n$/, "");
    const tokens = current.split(/\s+/);

    if (!tokens.length) return;

    const expandedTokens = tokens.map((tok) => {
      if (tok === "!!") return lastCommandTokens.join(" ");
      if (tok === "!$" && hasPrevArgs) return lastCommandTokens[lastCommandTokens.length - 1];
      if (tok === "!*" && hasPrevArgs) return lastCommandTokens.slice(1).join(" ");
      return tok;
    });

    const expanded = expandedTokens.join(" ");

    if (expanded !== current) {
      expandingRef.current = true;
      const trailingNewline = text.endsWith("\n") ? "\n" : "";
      const cursorOffset = expanded.length - current.length;
      setText(expanded + trailingNewline);
      setCursorPos((prev) => {
        const newPos = prev + cursorOffset;
        return Math.min(Math.max(0, newPos), expanded.length);
      });
    }
  }, [text, lastCommandTokens, setCursorPos, setText]);

  /* handle ctrl+r reverse search trigger */
  useEffect(() => {
    if (shortcut === "ctrl+r") {
      setSearchMode(true);
      setHistoryIndex(null);
      setText("");
      setCursorPos(0);
      clearShortcut();
      return;
    }

    if (shortcut === "history-up" && !searchMode) {
      if (!commandHistory.length) {
        clearShortcut();
        return;
      }
      const nextIndex =
        historyIndex === null
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
      const cmd = commandHistory[nextIndex];
      setSuggestions(null);
      setHistoryIndex(nextIndex);
      setText(cmd);
      setCursorPos(cmd.length);
      clearShortcut();
      return;
    }

    if (shortcut === "history-down" && !searchMode) {
      if (historyIndex === null) {
        clearShortcut();
        return;
      }
      const nextIndex =
        historyIndex >= commandHistory.length - 1 ? null : historyIndex + 1;
      const cmd = nextIndex === null ? "" : commandHistory[nextIndex];
      setSuggestions(null);
      setHistoryIndex(nextIndex);
      setText(cmd);
      setCursorPos(cmd.length);
      clearShortcut();
      return;
    }

    if (shortcut === "tab" && !searchMode) {
      const current = text.replace(/\n$/, "");
      if (!current) {
        setSuggestions(null);
        clearShortcut();
        return;
      }
      const tokens = current.split(/\s+/);
      const [first, ...rest] = tokens;
      if (!first) {
        setSuggestions(null);
        clearShortcut();
        return;
      }

      // Check if we should do filesystem completion (command is fs command and has args)
      const isFsCommand = fsCommands.includes(first);
      const lastArg = rest[rest.length - 1] || '';
      const shouldCompletePath = isFsCommand && rest.length > 0;

      if (shouldCompletePath) {
        // Filesystem path completion
        fileSystem.initialize();
        const basePrefix = tabState?.prefix ?? lastArg;
        let candidates =
          tabState && tabState.prefix === basePrefix ? tabState.candidates : null;

        if (!candidates) {
          candidates = fileSystem.getCompletions(basePrefix);
        }

        if (!candidates.length) {
          setSuggestions(null);
          clearShortcut();
          return;
        }

        // First tab for this prefix
        if (!tabState || tabState.prefix !== basePrefix) {
          const lcp = candidates.reduce((prev, curr) => {
            let p = prev;
            while (p && !curr.startsWith(p)) {
              p = p.slice(0, -1);
            }
            return p;
          }, candidates[0]);

          const completion = lcp && lcp.length > basePrefix.length ? lcp : candidates[0];
          const newArgs = [...rest.slice(0, -1), completion];
          const newText = [first, ...newArgs].join(" ");
          tabEditRef.current = true;
          setText(newText);
          setCursorPos(newText.length);
          setSuggestions(candidates.length > 1 ? candidates : null);
          setTabState({
            prefix: basePrefix,
            candidates,
            index: candidates.length === 1 ? 0 : -1,
          });
          clearShortcut();
          return;
        }

        // Subsequent tabs: cycle through candidates
        const nextIndex =
          tabState.index === -1
            ? 0
            : (tabState.index + 1) % tabState.candidates.length;
        const completion = tabState.candidates[nextIndex];
        const newArgs = [...rest.slice(0, -1), completion];
        const newText = [first, ...newArgs].join(" ");
        tabEditRef.current = true;
        setText(newText);
        setCursorPos(newText.length);
        setSuggestions(tabState.candidates);
        setTabState({ ...tabState, index: nextIndex });
        clearShortcut();
        return;
      }

      // Command name completion (original logic)
      const basePrefix = tabState?.prefix ?? first;
      let candidates =
        tabState && tabState.prefix === basePrefix ? tabState.candidates : null;

      if (!candidates) {
        candidates = ["clear", ...Array.from(commandMap.keys())].filter((c) =>
          c.startsWith(basePrefix)
        );
      }
      if (!candidates.length) {
        setSuggestions(null);
        clearShortcut();
        return;
      }

      // First tab for this prefix: extend to longest common prefix, no suggestions yet
      if (!tabState || tabState.prefix !== basePrefix) {
        const lcp = candidates.reduce((prev, curr) => {
          let p = prev;
          while (p && !curr.startsWith(p)) {
            p = p.slice(0, -1);
          }
          return p;
        }, candidates[0]);

        const completion = lcp && lcp.length > basePrefix.length ? lcp : candidates[0];
        const newText = [completion, ...rest].join(" ");
        tabEditRef.current = true;
        setText(newText);
        setCursorPos(newText.length);
        setSuggestions(candidates.length > 1 ? candidates : null);
        setTabState({
          prefix: basePrefix,
          candidates,
          index: candidates.length === 1 ? 0 : -1,
        });
        clearShortcut();
        return;
      }

      // Subsequent tabs: show suggestions and cycle
      const nextIndex =
        tabState.index === -1
          ? 0
          : (tabState.index + 1) % tabState.candidates.length;
      const completion = tabState.candidates[nextIndex];
      const newText = [completion, ...rest].join(" ");
      tabEditRef.current = true;
      setText(newText);
      setCursorPos(newText.length);
      setSuggestions(tabState.candidates);
      setTabState({ ...tabState, index: nextIndex });

      clearShortcut();
      return;
    }

    if (shortcut) clearShortcut();
  }, [
    shortcut,
    clearShortcut,
    commandHistory,
    historyIndex,
    searchMode,
    setCursorPos,
    setText,
    tabState,
  ]);

  /* accept reverse search result on Enter (newline) */
  useEffect(() => {
    if (!searchMode) return;
    if (!text.endsWith("\n")) return;
    const query = text.replace(/\n$/, "");
    const match = [...commandHistory].reverse().find((cmd) =>
      cmd.toLowerCase().includes(query.toLowerCase())
    );
    const resolved = match ?? query;
    setSearchMode(false);
    setText(resolved);
    setCursorPos(resolved.length);
  }, [commandHistory, searchMode, setCursorPos, setText, text]);

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
              <span className="text-terminal">❯</span>
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
        if (command.name === "exit") setTimeout(() => navigate("/"), 1000);
        if (result) {
          pushLine(
            <div key={crypto.randomUUID()} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-terminal">❯</span>
                <span className="font-medium text-white">{base}</span>
                {args.length > 0 && (
                  <span className="text-gray-500">{args.join(" ")}</span>
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
              <span className="text-terminal">❯</span>
              <span className="font-medium text-white">{base}</span>
              {args.length > 0 && (
                <span className="text-gray-500">{args.join(" ")}</span>
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

  /* ship plain lines (plus live typing) to the CRT canvas */
  useEffect(() => {
    if (!onBufferChange) return;
    const live = text.replace(/\n$/, ""); // strip trailing newline while typing
    const mapped = plainLines.map((l) =>
      l.command ? PROMPT + l.text : l.text
    );
    const liveWithPrompt = PROMPT + live;
    onBufferChange([...mapped, liveWithPrompt]);
  }, [plainLines, text]);

  /* -------- HTML terminal (hidden in headless mode) -------- */
  if (headless) return null;

  const liveText = text.replace(/\n$/, "");

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

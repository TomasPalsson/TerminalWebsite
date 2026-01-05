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
import {
  TerminalOutput,
  TerminalPrompt,
  TerminalSuggestions,
  ReverseSearchPrompt,
} from "./terminal";

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

    // Check if the content is overflowing and scroll only if necessary
    const container = bottomRef.current?.parentElement;
    if (container && container.scrollHeight > container.clientHeight) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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

      if (expansionError) {
        pushLine(
          <span key={crypto.randomUUID()} className="font-mono text-lg">
            <span className="font-bold text-terminal">{cmd}</span>
            <br />
            {expansionError}
          </span>
        );
        clearText();
        return;
      }

      const [base, ...args] = expandedTokens;
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
            <span key={crypto.randomUUID()} className="font-mono text-lg">
              <span className="font-bold text-terminal">{base}</span>
              <span className="text-white">
                {args.length ? " " + args.join(" ") : ""}
              </span>
              <br />
              {result}
            </span>
          );
        }
        setLastCommandTokens(expandedTokens);
        setCommandHistory((prev) => {
          const next = [...prev, expandedTokens.join(" ")];
          return next.slice(-50);
        });
      } else {
        pushLine(
          <span key={crypto.randomUUID()} className="font-mono text-lg">
            <span className="font-bold text-terminal">{base}</span>
            <span className="text-white">
              {args.length ? " " + args.join(" ") : ""}
            </span>
            <br />
            <span>
              Command not found: <span className="text-red-600">{cmd}</span>
            </span>
            <br />
            <span>
              Type <span className="text-orange-500">help</span> to see all
              available commands
            </span>
          </span>
        );
        setLastCommandTokens(expandedTokens);
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
    const container = bottomRef.current?.parentElement;
    if (container && container.scrollHeight > container.clientHeight) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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
        <div ref={bottomRef} />
      </>
    );
  }

  return (
    <>
      <TerminalOutput output={output} prompt={PROMPT} />
      <TerminalPrompt prompt={PROMPT} text={text} cursorPos={cursorPos} />
      <TerminalSuggestions suggestions={suggestions} />
      <div ref={bottomRef} />
    </>
  );
};

export default TerminalHandler;

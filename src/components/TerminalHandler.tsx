import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { KeyPressContext } from "../context/KeypressedContext";
import { commandMap } from "./commands/CommandMap";
import Cursor from "./Cursor";
import { useNavigate } from "react-router";

type Props = {
  onBufferChange?: (lines: string[]) => void;
  headless?: boolean;
};

/* -- turn any React node into plain text, preserving layout -- */
function extractText(node: React.ReactNode): string {
  if (node == null) return "";

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<any>;
    const blockTags = new Set([
      "div",
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "li",
      "ul",
      "ol",
    ]);

    const children = React.Children.map(element.props.children, extractText)?.join(
      ""
    ) ?? "";

    // <br> ⇒ newline
    if (node.type === "br") return "\n";

    if (node.type === "button") return `${children}\n`;

    // <li> ⇒ bullet + newline
    if (node.type === "li") return `• ${children}\n`;

    // <a>
    if (node.type === "a") {
      const children = React.Children.map(element.props.children, extractText)?.join("") ?? "";
      return `${children} (${element.props.href})`;
    }
    
    // any other block element ⇒ newline at end
    if (typeof node.type === "string" && blockTags.has(node.type)) {
      return `${children}\n`;
    }

    // inline element ⇒ just return its children's text
    return children;
  }

  return "";
}

const PROMPT = "$ ";

const TerminalHandler = ({ onBufferChange, headless = false }: Props) => {
  const context = useContext(KeyPressContext);
  const navigate = useNavigate();

  if (!context)
    throw new Error("TerminalHandler must be used within KeyPressProvider");

  const { text, clearText, cursorPos, setText, setCursorPos } = context;

  const [output, setOutput] = useState<ReactNode[]>([]);
  type PlainLine = { text: string; command: boolean };
  const [plainLines, setPlainLines] = useState<PlainLine[]>([]);
  const [lastCommandTokens, setLastCommandTokens] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const expandingRef = useRef(false);

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

  /* command processing */
  useEffect(() => {
    const processCommand = async () => {
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

  const prompt = PROMPT;
  const liveText = text.replace(/\n$/, "");
  const boundary = liveText.indexOf(" ") === -1 ? liveText.length : liveText.indexOf(" ");

  const renderSegment = (segment: string, start: number) => {
    if (!segment) return null;
    const end = start + segment.length;
    if (end <= boundary) {
      return <span className="font-bold text-terminal">{segment}</span>;
    }
    if (start >= boundary) {
      return <span className="text-white">{segment}</span>;
    }
    const firstPart = segment.slice(0, boundary - start);
    const secondPart = segment.slice(boundary - start);
    return (
      <>
        <span className="font-bold text-terminal">{firstPart}</span>
        <span className="text-white">{secondPart}</span>
      </>
    );
  };

  /* Ensure scrolling when output changes */
  useEffect(() => {
    const container = bottomRef.current?.parentElement;
    if (container && container.scrollHeight > container.clientHeight) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  return (
    <>
      {output.map((line, i) => (
        <div key={i}>
          <span className="font-mono text-lg text-terminal">{prompt}</span>
          <span className="font-mono text-lg whitespace-pre-wrap">{line}</span>
        </div>
      ))}
      <div>
        <span className="font-mono text-lg text-terminal">{prompt}</span>
        <span className="font-mono text-lg whitespace-pre-wrap">
          {renderSegment(liveText.slice(0, cursorPos), 0)}
        </span>
        <Cursor cursor="_" />
        <span className="font-mono text-lg whitespace-pre-wrap">
          {renderSegment(liveText.slice(cursorPos), cursorPos)}
        </span>
      </div>
      <div ref={bottomRef} />
    </>
  );
};

export default TerminalHandler;

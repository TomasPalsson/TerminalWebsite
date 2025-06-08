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

    const children = React.Children.map(node.props.children, extractText)?.join(
      ""
    ) ?? "";

    // <br> ⇒ newline
    if (node.type === "br") return "\n";

    // <li> ⇒ bullet + newline
    if (node.type === "li") return `• ${children}\n`;

    // <a>
    if (node.type === "a") {
      const children = React.Children.map(node.props.children, extractText)?.join("") ?? "";
      return `${children} (${node.props.href})`;
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
  if (!context)
    throw new Error("TerminalHandler must be used within KeyPressProvider");

  const { text, clearText } = context;

  const [output, setOutput] = useState<ReactNode[]>([]);
  type PlainLine = { text: string; command: boolean };
  const [plainLines, setPlainLines] = useState<PlainLine[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  /* command processing */
  useEffect(() => {
    const processCommand = async () => {
      if (!text.endsWith("\n")) return;

      const cmd = text.trim();
      const [base, ...args] = cmd.split(" ");
      const command = commandMap.get(base);

      if (base === "clear") {
        setOutput([]);
        setPlainLines([]);
        clearText();

        // Scroll to the top after clearing
        const container = bottomRef.current?.parentElement;
        if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      if (command) {
        const result = await command.run(args, context);
        if (command.name === "exit") window.location.href = "/";
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
  const renderText = () => {
    if (!text) return null;
    const [first, ...rest] = text.split(" ");
    return (
      <>
        <span className="font-bold text-terminal">{first}</span>
        <span className="text-white">
          {rest.length ? " " + rest.join(" ") : ""}
        </span>
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
          {renderText()}
        </span>
        <Cursor cursor="_" />
      </div>
      <div ref={bottomRef} />
    </>
  );
};

export default TerminalHandler;

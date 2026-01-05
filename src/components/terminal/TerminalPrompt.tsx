import React from "react";
import Cursor from "../Cursor";

interface TerminalPromptProps {
  prompt: string;
  text: string;
  cursorPos: number;
}

export function TerminalPrompt({ prompt, text, cursorPos }: TerminalPromptProps) {
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

  return (
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
  );
}

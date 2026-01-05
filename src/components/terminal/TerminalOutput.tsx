import React, { ReactNode } from "react";

interface TerminalOutputProps {
  output: ReactNode[];
  prompt: string;
}

export function TerminalOutput({ output, prompt }: TerminalOutputProps) {
  return (
    <>
      {output.map((line, i) => (
        <div key={i}>
          <span className="font-mono text-lg text-terminal">{prompt}</span>
          <span className="font-mono text-lg whitespace-pre-wrap">{line}</span>
        </div>
      ))}
    </>
  );
}

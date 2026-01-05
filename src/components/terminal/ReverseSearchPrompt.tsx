import React from "react";
import Cursor from "../Cursor";

interface ReverseSearchPromptProps {
  query: string;
  matchedCommand: string | null;
}

export function ReverseSearchPrompt({ query, matchedCommand }: ReverseSearchPromptProps) {
  return (
    <div className="font-mono text-lg text-gray-300">
      <span className="text-terminal">(reverse-i-search)</span>
      <span>{` \`${query}\`: `}</span>
      <span className="text-white">{matchedCommand ?? ""}</span>
      <Cursor cursor="_" />
    </div>
  );
}

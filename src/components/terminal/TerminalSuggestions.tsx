import React from "react";

interface TerminalSuggestionsProps {
  suggestions: string[] | null;
}

export function TerminalSuggestions({ suggestions }: TerminalSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-1 font-mono text-sm text-terminal whitespace-pre-wrap">
      {suggestions.join("  ")}
    </div>
  );
}

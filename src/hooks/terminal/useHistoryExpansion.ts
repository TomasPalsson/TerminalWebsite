import { useCallback, useRef } from "react";

export interface UseHistoryExpansionResult {
  expandHistory: (text: string, lastCommandTokens: string[]) => {
    expanded: string;
    changed: boolean;
    cursorOffset: number;
  };
  isExpanding: () => boolean;
  setExpanding: (value: boolean) => void;
}

export function useHistoryExpansion(): UseHistoryExpansionResult {
  const expandingRef = useRef(false);

  const expandHistory = useCallback(
    (
      text: string,
      lastCommandTokens: string[]
    ): { expanded: string; changed: boolean; cursorOffset: number } => {
      const hasHistory = lastCommandTokens.length > 0;
      if (!hasHistory) {
        return { expanded: text, changed: false, cursorOffset: 0 };
      }

      const hasPrevArgs = lastCommandTokens.length > 1;
      const current = text.replace(/\n$/, "");
      const tokens = current.split(/\s+/);

      if (!tokens.length) {
        return { expanded: text, changed: false, cursorOffset: 0 };
      }

      const expandedTokens = tokens.map((tok) => {
        if (tok === "!!") return lastCommandTokens.join(" ");
        if (tok === "!$" && hasPrevArgs)
          return lastCommandTokens[lastCommandTokens.length - 1];
        if (tok === "!*" && hasPrevArgs)
          return lastCommandTokens.slice(1).join(" ");
        return tok;
      });

      const expanded = expandedTokens.join(" ");

      if (expanded !== current) {
        const trailingNewline = text.endsWith("\n") ? "\n" : "";
        const cursorOffset = expanded.length - current.length;
        return {
          expanded: expanded + trailingNewline,
          changed: true,
          cursorOffset,
        };
      }

      return { expanded: text, changed: false, cursorOffset: 0 };
    },
    []
  );

  const isExpanding = useCallback(() => expandingRef.current, []);

  const setExpanding = useCallback((value: boolean) => {
    expandingRef.current = value;
  }, []);

  return {
    expandHistory,
    isExpanding,
    setExpanding,
  };
}

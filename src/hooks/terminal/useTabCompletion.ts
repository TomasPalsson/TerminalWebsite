import { useState, useCallback } from "react";
import { commandMap } from "../../components/commands/CommandMap";

interface TabState {
  prefix: string;
  candidates: string[];
  index: number;
}

export interface UseTabCompletionResult {
  suggestions: string[] | null;
  tabState: TabState | null;
  handleTab: (currentText: string) => { newText: string; cursorPos: number } | null;
  clearSuggestions: () => void;
  resetTabState: () => void;
}

export function useTabCompletion(): UseTabCompletionResult {
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [tabState, setTabState] = useState<TabState | null>(null);

  const clearSuggestions = useCallback(() => {
    setSuggestions(null);
  }, []);

  const resetTabState = useCallback(() => {
    setTabState(null);
    setSuggestions(null);
  }, []);

  const handleTab = useCallback(
    (currentText: string): { newText: string; cursorPos: number } | null => {
      const text = currentText.replace(/\n$/, "");
      if (!text) {
        clearSuggestions();
        return null;
      }

      const tokens = text.split(/\s+/);
      const [first, ...rest] = tokens;
      if (!first) {
        clearSuggestions();
        return null;
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
        clearSuggestions();
        return null;
      }

      // First tab for this prefix: extend to longest common prefix
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

        setSuggestions(candidates.length > 1 ? candidates : null);
        setTabState({
          prefix: basePrefix,
          candidates,
          index: candidates.length === 1 ? 0 : -1,
        });

        return { newText, cursorPos: newText.length };
      }

      // Subsequent tabs: cycle through candidates
      const nextIndex =
        tabState.index === -1
          ? 0
          : (tabState.index + 1) % tabState.candidates.length;
      const completion = tabState.candidates[nextIndex];
      const newText = [completion, ...rest].join(" ");

      setSuggestions(tabState.candidates);
      setTabState({ ...tabState, index: nextIndex });

      return { newText, cursorPos: newText.length };
    },
    [tabState, clearSuggestions]
  );

  return {
    suggestions,
    tabState,
    handleTab,
    clearSuggestions,
    resetTabState,
  };
}

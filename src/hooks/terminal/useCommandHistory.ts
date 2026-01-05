import { useState, useCallback } from "react";

const MAX_HISTORY_SIZE = 50;

export interface UseCommandHistoryResult {
  commandHistory: string[];
  historyIndex: number | null;
  addToHistory: (command: string) => void;
  navigateUp: () => string | null;
  navigateDown: () => string | null;
  resetNavigation: () => void;
}

export function useCommandHistory(): UseCommandHistoryResult {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const addToHistory = useCallback((command: string) => {
    setCommandHistory((prev) => {
      const next = [...prev, command];
      return next.slice(-MAX_HISTORY_SIZE);
    });
    setHistoryIndex(null);
  }, []);

  const navigateUp = useCallback((): string | null => {
    if (!commandHistory.length) return null;

    const nextIndex =
      historyIndex === null
        ? commandHistory.length - 1
        : Math.max(0, historyIndex - 1);

    setHistoryIndex(nextIndex);
    return commandHistory[nextIndex];
  }, [commandHistory, historyIndex]);

  const navigateDown = useCallback((): string | null => {
    if (historyIndex === null) return null;

    const nextIndex =
      historyIndex >= commandHistory.length - 1 ? null : historyIndex + 1;

    setHistoryIndex(nextIndex);
    return nextIndex === null ? "" : commandHistory[nextIndex];
  }, [commandHistory, historyIndex]);

  const resetNavigation = useCallback(() => {
    setHistoryIndex(null);
  }, []);

  return {
    commandHistory,
    historyIndex,
    addToHistory,
    navigateUp,
    navigateDown,
    resetNavigation,
  };
}

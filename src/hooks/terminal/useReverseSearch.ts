import { useState, useCallback, useMemo } from "react";

export interface UseReverseSearchResult {
  searchMode: boolean;
  searchQuery: string;
  matchedCommand: string | null;
  startSearch: () => void;
  updateQuery: (query: string) => void;
  acceptSearch: () => string;
  cancelSearch: () => void;
}

export function useReverseSearch(
  commandHistory: string[]
): UseReverseSearchResult {
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const matchedCommand = useMemo(() => {
    if (!searchMode || !searchQuery) return null;
    return (
      [...commandHistory]
        .reverse()
        .find((cmd) => cmd.toLowerCase().includes(searchQuery.toLowerCase())) ??
      null
    );
  }, [searchMode, searchQuery, commandHistory]);

  const startSearch = useCallback(() => {
    setSearchMode(true);
    setSearchQuery("");
  }, []);

  const updateQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const acceptSearch = useCallback((): string => {
    const result = matchedCommand ?? searchQuery;
    setSearchMode(false);
    setSearchQuery("");
    return result;
  }, [matchedCommand, searchQuery]);

  const cancelSearch = useCallback(() => {
    setSearchMode(false);
    setSearchQuery("");
  }, []);

  return {
    searchMode,
    searchQuery,
    matchedCommand,
    startSearch,
    updateQuery,
    acceptSearch,
    cancelSearch,
  };
}

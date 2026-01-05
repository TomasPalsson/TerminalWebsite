import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReverseSearch } from './useReverseSearch';

describe('useReverseSearch', () => {
  const mockHistory = ['ls -la', 'cd documents', 'git status', 'git commit -m "test"'];

  it('starts in non-search mode', () => {
    const { result } = renderHook(() => useReverseSearch(mockHistory));

    expect(result.current.searchMode).toBe(false);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.matchedCommand).toBeNull();
  });

  it('enters search mode', () => {
    const { result } = renderHook(() => useReverseSearch(mockHistory));

    act(() => {
      result.current.startSearch();
    });

    expect(result.current.searchMode).toBe(true);
    expect(result.current.searchQuery).toBe('');
  });

  it('updates query and finds matches', () => {
    const { result } = renderHook(() => useReverseSearch(mockHistory));

    act(() => {
      result.current.startSearch();
    });

    act(() => {
      result.current.updateQuery('git');
    });

    expect(result.current.searchQuery).toBe('git');
    // Should match the most recent 'git' command
    expect(result.current.matchedCommand).toBe('git commit -m "test"');
  });

  it('finds case-insensitive matches', () => {
    const { result } = renderHook(() => useReverseSearch(mockHistory));

    act(() => {
      result.current.startSearch();
      result.current.updateQuery('GIT');
    });

    expect(result.current.matchedCommand).toBe('git commit -m "test"');
  });

  it('returns null for no matches', () => {
    const { result } = renderHook(() => useReverseSearch(mockHistory));

    act(() => {
      result.current.startSearch();
      result.current.updateQuery('xyz123');
    });

    expect(result.current.matchedCommand).toBeNull();
  });

  it('accepts search and returns matched command', () => {
    const { result } = renderHook(() => useReverseSearch(mockHistory));

    act(() => {
      result.current.startSearch();
      result.current.updateQuery('status');
    });

    let accepted: string;
    act(() => {
      accepted = result.current.acceptSearch();
    });

    expect(accepted!).toBe('git status');
    expect(result.current.searchMode).toBe(false);
    expect(result.current.searchQuery).toBe('');
  });

  it('accepts search returns query when no match', () => {
    const { result } = renderHook(() => useReverseSearch(mockHistory));

    act(() => {
      result.current.startSearch();
      result.current.updateQuery('nonexistent');
    });

    let accepted: string;
    act(() => {
      accepted = result.current.acceptSearch();
    });

    expect(accepted!).toBe('nonexistent');
  });

  it('cancels search', () => {
    const { result } = renderHook(() => useReverseSearch(mockHistory));

    act(() => {
      result.current.startSearch();
      result.current.updateQuery('test');
    });

    act(() => {
      result.current.cancelSearch();
    });

    expect(result.current.searchMode).toBe(false);
    expect(result.current.searchQuery).toBe('');
  });

  it('updates matched command when history changes', () => {
    const { result, rerender } = renderHook(
      ({ history }) => useReverseSearch(history),
      { initialProps: { history: mockHistory } }
    );

    act(() => {
      result.current.startSearch();
      result.current.updateQuery('git');
    });

    expect(result.current.matchedCommand).toBe('git commit -m "test"');

    // Add new git command
    const newHistory = [...mockHistory, 'git push origin main'];
    rerender({ history: newHistory });

    expect(result.current.matchedCommand).toBe('git push origin main');
  });
});

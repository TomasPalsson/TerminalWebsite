import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabCompletion } from './useTabCompletion';

describe('useTabCompletion', () => {
  it('starts with no suggestions', () => {
    const { result } = renderHook(() => useTabCompletion());

    expect(result.current.suggestions).toBeNull();
    expect(result.current.tabState).toBeNull();
  });

  it('returns null for empty input', () => {
    const { result } = renderHook(() => useTabCompletion());

    let completion: { newText: string; cursorPos: number } | null;
    act(() => {
      completion = result.current.handleTab('');
    });

    expect(completion!).toBeNull();
  });

  it('completes command with single match', () => {
    const { result } = renderHook(() => useTabCompletion());

    let completion: { newText: string; cursorPos: number } | null;
    act(() => {
      completion = result.current.handleTab('cle');
    });

    expect(completion!).not.toBeNull();
    expect(completion!.newText).toBe('clear');
    expect(completion!.cursorPos).toBe(5);
  });

  it('shows suggestions for multiple matches', () => {
    const { result } = renderHook(() => useTabCompletion());

    // First tab - complete to longest common prefix
    act(() => {
      result.current.handleTab('he');
    });

    // Should have suggestions for commands starting with 'he'
    // (depends on what commands exist in commandMap)
    expect(result.current.tabState).not.toBeNull();
  });

  it('cycles through candidates on subsequent tabs', () => {
    const { result } = renderHook(() => useTabCompletion());

    // First tab
    let first: { newText: string; cursorPos: number } | null;
    act(() => {
      first = result.current.handleTab('c');
    });

    // Second tab - should cycle
    let second: { newText: string; cursorPos: number } | null;
    act(() => {
      second = result.current.handleTab(first!.newText);
    });

    // The results may be different as it cycles
    expect(second).not.toBeNull();
  });

  it('clears suggestions', () => {
    const { result } = renderHook(() => useTabCompletion());

    act(() => {
      result.current.handleTab('c');
    });

    act(() => {
      result.current.clearSuggestions();
    });

    expect(result.current.suggestions).toBeNull();
  });

  it('resets tab state', () => {
    const { result } = renderHook(() => useTabCompletion());

    act(() => {
      result.current.handleTab('c');
    });

    act(() => {
      result.current.resetTabState();
    });

    expect(result.current.tabState).toBeNull();
    expect(result.current.suggestions).toBeNull();
  });

  it('preserves arguments after command', () => {
    const { result } = renderHook(() => useTabCompletion());

    let completion: { newText: string; cursorPos: number } | null;
    act(() => {
      completion = result.current.handleTab('cle arg1 arg2');
    });

    expect(completion!.newText).toBe('clear arg1 arg2');
  });
});

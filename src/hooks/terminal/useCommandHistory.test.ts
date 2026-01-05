import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCommandHistory } from './useCommandHistory';

describe('useCommandHistory', () => {
  it('starts with empty history', () => {
    const { result } = renderHook(() => useCommandHistory());

    expect(result.current.commandHistory).toEqual([]);
    expect(result.current.historyIndex).toBeNull();
  });

  it('adds commands to history', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('ls');
    });

    expect(result.current.commandHistory).toEqual(['ls']);

    act(() => {
      result.current.addToHistory('cd ..');
    });

    expect(result.current.commandHistory).toEqual(['ls', 'cd ..']);
  });

  it('navigates up through history', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('first');
      result.current.addToHistory('second');
      result.current.addToHistory('third');
    });

    let cmd: string | null;

    act(() => {
      cmd = result.current.navigateUp();
    });
    expect(cmd!).toBe('third');

    act(() => {
      cmd = result.current.navigateUp();
    });
    expect(cmd!).toBe('second');

    act(() => {
      cmd = result.current.navigateUp();
    });
    expect(cmd!).toBe('first');

    // At the beginning, stays at first
    act(() => {
      cmd = result.current.navigateUp();
    });
    expect(cmd!).toBe('first');
  });

  it('navigates down through history', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('first');
      result.current.addToHistory('second');
    });

    // Navigate up first (to 'second')
    let cmd: string | null;
    act(() => {
      cmd = result.current.navigateUp();
    });
    expect(cmd!).toBe('second');

    // Navigate up again (to 'first')
    act(() => {
      cmd = result.current.navigateUp();
    });
    expect(cmd!).toBe('first');

    // Navigate down (back to 'second')
    act(() => {
      cmd = result.current.navigateDown();
    });
    expect(cmd!).toBe('second');

    // At the end, returns empty string
    act(() => {
      cmd = result.current.navigateDown();
    });
    expect(cmd!).toBe('');
  });

  it('returns null when navigating up with empty history', () => {
    const { result } = renderHook(() => useCommandHistory());

    let cmd: string | null;
    act(() => {
      cmd = result.current.navigateUp();
    });

    expect(cmd!).toBeNull();
  });

  it('returns null when navigating down without first navigating up', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('test');
    });

    let cmd: string | null;
    act(() => {
      cmd = result.current.navigateDown();
    });

    expect(cmd!).toBeNull();
  });

  it('resets navigation index', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      result.current.addToHistory('test');
    });

    // Navigate up sets the history index
    act(() => {
      result.current.navigateUp();
    });

    expect(result.current.historyIndex).toBe(0);

    act(() => {
      result.current.resetNavigation();
    });

    expect(result.current.historyIndex).toBeNull();
  });

  it('limits history size to 50 entries', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.addToHistory(`cmd${i}`);
      }
    });

    expect(result.current.commandHistory.length).toBe(50);
    expect(result.current.commandHistory[0]).toBe('cmd10');
    expect(result.current.commandHistory[49]).toBe('cmd59');
  });
});

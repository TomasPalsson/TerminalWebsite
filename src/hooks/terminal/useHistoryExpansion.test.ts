import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHistoryExpansion } from './useHistoryExpansion'

describe('useHistoryExpansion', () => {
  describe('expandHistory', () => {
    it('returns unchanged text when no history available', () => {
      const { result } = renderHook(() => useHistoryExpansion())

      const output = result.current.expandHistory('echo hello', [])

      expect(output.expanded).toBe('echo hello')
      expect(output.changed).toBe(false)
      expect(output.cursorOffset).toBe(0)
    })

    it('expands !! to the last command', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['git', 'status']

      const output = result.current.expandHistory('!!', lastCommand)

      expect(output.expanded).toBe('git status')
      expect(output.changed).toBe(true)
    })

    it('expands !! within a command', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['echo', 'hello']

      const output = result.current.expandHistory('sudo !!', lastCommand)

      expect(output.expanded).toBe('sudo echo hello')
      expect(output.changed).toBe(true)
    })

    it('expands !$ to the last argument', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['cat', '/home/user/file.txt']

      const output = result.current.expandHistory('vim !$', lastCommand)

      expect(output.expanded).toBe('vim /home/user/file.txt')
      expect(output.changed).toBe(true)
    })

    it('does not expand !$ when there are no arguments', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['ls'] // Single token, no args

      const output = result.current.expandHistory('echo !$', lastCommand)

      // !$ stays unchanged because there's no previous argument
      expect(output.expanded).toBe('echo !$')
      expect(output.changed).toBe(false)
    })

    it('expands !* to all arguments', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['mv', 'file1.txt', 'file2.txt', '/home/user/']

      const output = result.current.expandHistory('cp !*', lastCommand)

      expect(output.expanded).toBe('cp file1.txt file2.txt /home/user/')
      expect(output.changed).toBe(true)
    })

    it('does not expand !* when there are no arguments', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['pwd'] // Single token, no args

      const output = result.current.expandHistory('echo !*', lastCommand)

      expect(output.expanded).toBe('echo !*')
      expect(output.changed).toBe(false)
    })

    it('returns unchanged text when no expansion sequences present', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['git', 'status']

      const output = result.current.expandHistory('ls -la', lastCommand)

      expect(output.expanded).toBe('ls -la')
      expect(output.changed).toBe(false)
    })

    it('handles multiple expansion sequences', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['echo', 'hello', 'world']

      const output = result.current.expandHistory('!! !$', lastCommand)

      expect(output.expanded).toBe('echo hello world world')
      expect(output.changed).toBe(true)
    })

    it('preserves trailing newline', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['git', 'status']

      const output = result.current.expandHistory('!!\n', lastCommand)

      expect(output.expanded).toBe('git status\n')
      expect(output.changed).toBe(true)
    })

    it('handles empty input', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['git', 'status']

      const output = result.current.expandHistory('', lastCommand)

      expect(output.expanded).toBe('')
      expect(output.changed).toBe(false)
    })

    it('handles whitespace-only input', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['git', 'status']

      const output = result.current.expandHistory('   ', lastCommand)

      // Whitespace gets trimmed and split resulting in empty token array
      // join('') produces a single space between zero elements
      // The text is considered "unchanged" since no expansion sequences found
      expect(output.expanded).toBe(' ')
    })

    it('calculates cursor offset correctly', () => {
      const { result } = renderHook(() => useHistoryExpansion())
      const lastCommand = ['git', 'status', '--short']

      const output = result.current.expandHistory('!!', lastCommand)

      // Original: '!!' (2 chars), Expanded: 'git status --short' (18 chars)
      expect(output.cursorOffset).toBe(18 - 2)
    })
  })

  describe('isExpanding', () => {
    it('returns false initially', () => {
      const { result } = renderHook(() => useHistoryExpansion())

      expect(result.current.isExpanding()).toBe(false)
    })

    it('returns the value set by setExpanding', () => {
      const { result } = renderHook(() => useHistoryExpansion())

      act(() => {
        result.current.setExpanding(true)
      })

      expect(result.current.isExpanding()).toBe(true)

      act(() => {
        result.current.setExpanding(false)
      })

      expect(result.current.isExpanding()).toBe(false)
    })
  })

  describe('setExpanding', () => {
    it('sets expanding state', () => {
      const { result } = renderHook(() => useHistoryExpansion())

      act(() => {
        result.current.setExpanding(true)
      })

      expect(result.current.isExpanding()).toBe(true)
    })
  })
})

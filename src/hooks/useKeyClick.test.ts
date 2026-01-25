import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useKeyClick from './useKeyClick'

describe('useKeyClick', () => {
  let mockPlay: ReturnType<typeof vi.fn>
  let originalAudio: typeof Audio

  beforeEach(() => {
    // Save original Audio
    originalAudio = global.Audio

    mockPlay = vi.fn().mockResolvedValue(undefined)

    // Create a proper constructor mock using a class
    class MockAudio {
      src: string
      currentTime = 0
      playbackRate = 1
      play = mockPlay

      constructor(src: string) {
        this.src = src
      }
    }

    // @ts-expect-error - Mocking Audio constructor
    global.Audio = MockAudio
  })

  afterEach(() => {
    // Restore original Audio
    global.Audio = originalAudio
  })

  it('returns a play function', () => {
    const { result } = renderHook(() => useKeyClick())

    expect(typeof result.current).toBe('function')
  })

  it('creates Audio element on first play', () => {
    const audioSpy = vi.spyOn(global, 'Audio')

    const { result } = renderHook(() => useKeyClick())

    act(() => {
      result.current()
    })

    expect(audioSpy).toHaveBeenCalledWith('/spacebar-click-keyboard-199448.mp3')
  })

  it('reuses Audio element on subsequent plays', () => {
    const audioSpy = vi.spyOn(global, 'Audio')

    const { result } = renderHook(() => useKeyClick())

    act(() => {
      result.current()
      result.current()
      result.current()
    })

    // Audio constructor should only be called once
    expect(audioSpy).toHaveBeenCalledTimes(1)
  })

  it('calls play on the audio element', () => {
    const { result } = renderHook(() => useKeyClick())

    act(() => {
      result.current()
    })

    expect(mockPlay).toHaveBeenCalled()
  })

  it('handles play errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const playError = new Error('Play failed')
    mockPlay.mockRejectedValue(playError)

    const { result } = renderHook(() => useKeyClick())

    await act(async () => {
      result.current()
      // Wait for the promise rejection to be handled
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(consoleSpy).toHaveBeenCalledWith('Error playing sound:', playError)
    consoleSpy.mockRestore()
  })

  it('returns stable function reference', () => {
    const { result, rerender } = renderHook(() => useKeyClick())

    const firstRef = result.current
    rerender()
    const secondRef = result.current

    expect(firstRef).toBe(secondRef)
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useKeyClick from './useKeyClick'
import { resetAudioForTests } from '../utils/audio'

class MockAudioContext {
  state = 'suspended'
  currentTime = 0
  destination = {}
  resume = vi.fn().mockResolvedValue(undefined)
  decodeAudioData = vi.fn().mockResolvedValue({ duration: 1.5 })

  createBufferSource = vi.fn(() => ({
    buffer: null,
    playbackRate: { value: 1 },
    connect: vi.fn(),
    start: vi.fn(),
  }))

  createGain = vi.fn(() => ({
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  }))

  createOscillator = vi.fn(() => ({
    type: 'sine',
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }))
}

describe('useKeyClick', () => {
  let originalAudioContext: typeof window.AudioContext | undefined

  beforeEach(() => {
    originalAudioContext = window.AudioContext
    // @ts-expect-error - Mocking AudioContext constructor
    global.AudioContext = MockAudioContext
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    }) as unknown as typeof fetch
    resetAudioForTests()
  })

  afterEach(() => {
    // @ts-expect-error - Restoring AudioContext constructor
    global.AudioContext = originalAudioContext
    resetAudioForTests()
    vi.restoreAllMocks()
  })

  it('returns a play function', () => {
    const { result } = renderHook(() => useKeyClick())

    expect(typeof result.current).toBe('function')
  })

  it('returns stable function reference across rerenders', () => {
    const { result, rerender } = renderHook(() => useKeyClick())

    const firstRef = result.current
    rerender()
    const secondRef = result.current

    expect(firstRef).toBe(secondRef)
  })

  it('warms up on mount, fetching the sample before any keypress', async () => {
    renderHook(() => useKeyClick())

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  it('plays a click when called', async () => {
    const { result } = renderHook(() => useKeyClick())

    act(() => {
      result.current('a')
    })

    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('does not warm up or play when disabled', async () => {
    const { result } = renderHook(() => useKeyClick(false))

    act(() => {
      result.current('a')
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(global.fetch).not.toHaveBeenCalled()
  })
})

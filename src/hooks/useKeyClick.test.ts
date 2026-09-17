import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useKeyClick from './useKeyClick'
import { resetAudioForTests } from '../utils/audio'

class MockAudioContext {
  static instances: MockAudioContext[] = []

  state = 'suspended'
  currentTime = 0
  destination = {}
  resume = vi.fn().mockResolvedValue(undefined)

  constructor() {
    MockAudioContext.instances.push(this)
  }

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

  sampleRate = 48000

  createBuffer = vi.fn((_channels: number, length: number) => ({
    getChannelData: () => new Float32Array(length),
  }))

  createBiquadFilter = vi.fn(() => ({
    type: 'lowpass',
    frequency: { value: 0 },
    Q: { value: 1 },
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
    MockAudioContext.instances = []
    // @ts-expect-error - Mocking AudioContext constructor
    global.AudioContext = MockAudioContext
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

  it('warms up on mount, building the audio context before any keypress', () => {
    renderHook(() => useKeyClick())
    expect(MockAudioContext.instances).toHaveLength(1)
    expect(MockAudioContext.instances[0].createBuffer).toHaveBeenCalledTimes(1)
  })

  it('plays a click when called', () => {
    const { result } = renderHook(() => useKeyClick())

    act(() => {
      result.current('a')
    })

    // press + release noise bursts
    expect(MockAudioContext.instances[0].createBufferSource).toHaveBeenCalledTimes(2)
  })

  it('does not warm up or play when disabled', () => {
    const { result } = renderHook(() => useKeyClick(false))

    act(() => {
      result.current('a')
    })

    expect(MockAudioContext.instances).toHaveLength(0)
  })
})

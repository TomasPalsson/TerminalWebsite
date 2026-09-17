import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  shouldClick,
  clickRateFor,
  clickVoiceFor,
  warmUp,
  playClick,
  playPowerOn,
  playQuack,
  playFanfare,
  startParty,
  stopParty,
  isPartyPlaying,
  isAudioSupported,
  resetAudioForTests,
} from './audio'

type MockBufferSource = {
  buffer: unknown
  playbackRate: { value: number }
  connect: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
}

class MockAudioContext {
  static instances: MockAudioContext[] = []

  state = 'suspended'
  currentTime = 0
  destination = {}
  resume = vi.fn().mockResolvedValue(undefined)
  sources: MockBufferSource[] = []

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

  constructor() {
    MockAudioContext.instances.push(this)
  }

  createBufferSource = vi.fn((): MockBufferSource => {
    const source: MockBufferSource = {
      buffer: null,
      playbackRate: { value: 1 },
      connect: vi.fn(),
      start: vi.fn(),
    }
    this.sources.push(source)
    return source
  })

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

describe('audio', () => {
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

  describe('shouldClick', () => {
    it('returns true for undefined', () => {
      expect(shouldClick(undefined)).toBe(true)
    })

    it('returns true for single characters', () => {
      expect(shouldClick('a')).toBe(true)
      expect(shouldClick(' ')).toBe(true)
    })

    it('returns true for sounded special keys', () => {
      expect(shouldClick('Enter')).toBe(true)
    })

    it('returns false for modifier keys', () => {
      expect(shouldClick('Shift')).toBe(false)
      expect(shouldClick('Control')).toBe(false)
      expect(shouldClick('ArrowUp')).toBe(false)
    })
  })

  describe('clickRateFor', () => {
    it('returns 0.8 for Enter', () => {
      expect(clickRateFor('Enter')).toBe(0.8)
    })

    it('returns 1.15 for Backspace', () => {
      expect(clickRateFor('Backspace')).toBe(1.15)
    })

    it('returns 0.9 for space', () => {
      expect(clickRateFor(' ')).toBe(0.9)
    })

    it('returns a value within [0.95, 1.1] for letters', () => {
      const rate = clickRateFor('a')
      expect(rate).toBeGreaterThanOrEqual(0.95)
      expect(rate).toBeLessThanOrEqual(1.1)
    })
  })

  describe('playClick', () => {
    it('synthesises five filtered noise strikes per call, with no oscillators', () => {
      playClick('a')
      playClick('a')
      playClick('a')

      const ctx = MockAudioContext.instances[0]
      expect(ctx.resume).toHaveBeenCalled()
      // 3 down-stroke + 2 up-stroke strikes per click, the noise buffer built once
      expect(ctx.sources).toHaveLength(15)
      expect(ctx.createBiquadFilter).toHaveBeenCalledTimes(15)
      expect(ctx.createBuffer).toHaveBeenCalledTimes(1)
      expect(ctx.createOscillator).not.toHaveBeenCalled()
      for (const source of ctx.sources) expect(source.start).toHaveBeenCalled()
    })

    it('creates nothing for modifier keys', () => {
      playClick('Shift')
      expect(MockAudioContext.instances).toHaveLength(0)
    })

    it('gives Enter and Space a lower, heavier voice than a letter', () => {
      expect(clickVoiceFor('Enter').click).toBeLessThan(clickVoiceFor('a').click)
      expect(clickVoiceFor('Enter').level).toBeGreaterThan(clickVoiceFor('a').level)
      expect(clickVoiceFor(' ').thud).toBeLessThan(clickVoiceFor('a').thud)
    })

    it('logs and survives a broken node graph', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      class BrokenContext extends MockAudioContext {
        constructor() {
          super()
          this.createBiquadFilter = vi.fn(() => {
            throw new Error('no filters here')
          })
        }
      }
      // @ts-expect-error - Mocking AudioContext constructor
      global.AudioContext = BrokenContext
      playClick('a')
      expect(consoleSpy).toHaveBeenCalledWith('Error playing sound:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('warmUp builds the context and noise before any keypress', () => {
      warmUp()
      expect(MockAudioContext.instances).toHaveLength(1)
      expect(MockAudioContext.instances[0].createBuffer).toHaveBeenCalledTimes(1)
    })
  })

  describe('playPowerOn', () => {
    it('creates an oscillator and calls start and stop', () => {
      playPowerOn()

      const ctx = MockAudioContext.instances[0]
      expect(ctx.createOscillator).toHaveBeenCalled()
      const oscillator = ctx.createOscillator.mock.results[0].value
      expect(oscillator.start).toHaveBeenCalled()
      expect(oscillator.stop).toHaveBeenCalled()
    })
  })

  describe('room sounds', () => {
    it('quack and fanfare each schedule oscillators', () => {
      playQuack()
      playFanfare()
      const ctx = MockAudioContext.instances[0]
      // 2 + 4 notes
      expect(ctx.createOscillator).toHaveBeenCalledTimes(6)
      expect(ctx.resume).toHaveBeenCalled()
    })

    it('party loop schedules notes ahead and stops cleanly', () => {
      vi.useFakeTimers()
      startParty()
      expect(isPartyPlaying()).toBe(true)
      const ctx = MockAudioContext.instances[0]
      const scheduled = ctx.createOscillator.mock.calls.length
      expect(scheduled).toBeGreaterThan(0)
      startParty()
      expect(MockAudioContext.instances).toHaveLength(1)
      ctx.currentTime = 0.5
      vi.advanceTimersByTime(200)
      expect(ctx.createOscillator.mock.calls.length).toBeGreaterThan(scheduled)
      stopParty()
      expect(isPartyPlaying()).toBe(false)
      const after = ctx.createOscillator.mock.calls.length
      vi.advanceTimersByTime(500)
      expect(ctx.createOscillator.mock.calls.length).toBe(after)
      vi.useRealTimers()
    })
  })

  describe('isAudioSupported', () => {
    it('returns true when AudioContext exists', () => {
      expect(isAudioSupported()).toBe(true)
    })

    it('returns false and functions no-op when AudioContext is undefined', async () => {
      // @ts-expect-error - Removing AudioContext constructor
      delete global.AudioContext
      resetAudioForTests()

      expect(isAudioSupported()).toBe(false)

      playClick('a')
      playPowerOn()
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(MockAudioContext.instances).toHaveLength(0)
    })
  })
})

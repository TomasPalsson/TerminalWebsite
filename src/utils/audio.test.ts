import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  shouldClick,
  clickRateFor,
  playClick,
  playPowerOn,
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
  decodeAudioData = vi.fn().mockResolvedValue({ duration: 1.5 })
  sources: MockBufferSource[] = []

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
    it('fetches the sample once, creates a source per call, and resumes a suspended context', async () => {
      playClick('a')
      playClick('a')
      playClick('a')

      await vi.waitFor(() => {
        const ctx = MockAudioContext.instances[0]
        expect(ctx.sources).toHaveLength(3)
      })

      const ctx = MockAudioContext.instances[0]
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(ctx.resume).toHaveBeenCalled()
      for (const source of ctx.sources) {
        expect(source.start).toHaveBeenCalledWith(0, 0, 0.3)
      }
    })

    it('creates no source for modifier keys', async () => {
      playClick('Shift')
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('retries fetch after a decode failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      class FailingOnceContext extends MockAudioContext {
        constructor() {
          super()
          this.decodeAudioData = vi
            .fn()
            .mockRejectedValueOnce(new Error('decode failed'))
            .mockResolvedValue({ duration: 1.5 })
        }
      }
      // @ts-expect-error - Mocking AudioContext constructor
      global.AudioContext = FailingOnceContext

      playClick('a')
      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error playing sound:', expect.any(Error))
      })

      playClick('a')
      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })

      consoleSpy.mockRestore()
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
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})

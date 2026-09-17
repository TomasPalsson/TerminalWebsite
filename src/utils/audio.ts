export const CLICK_SAMPLE_URL = '/spacebar-click-keyboard-199448.mp3'
export const CLICK_DURATION = 0.3 // seconds of the sample to play

/** Keys longer than one character that still make a click (modifiers do not) */
export const SOUNDED_SPECIAL_KEYS: ReadonlySet<string> = new Set([
  'Enter',
  'Backspace',
  'Tab',
  'Delete',
  'Escape',
])

let context: AudioContext | null = null
let clickBuffer: Promise<AudioBuffer> | null = null

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && !!(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
}

export function getAudioContext(): AudioContext | null {
  if (!isAudioSupported()) return null

  if (!context) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    context = new Ctor()
  }

  return context
}

function loadClickBuffer(ctx: AudioContext): Promise<AudioBuffer> {
  if (!clickBuffer) {
    clickBuffer = fetch(CLICK_SAMPLE_URL)
      .then(response => response.arrayBuffer())
      .then(data => ctx.decodeAudioData(data))
      .catch(err => {
        clickBuffer = null
        throw err
      })
  }

  return clickBuffer
}

export function warmUp(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    loadClickBuffer(ctx).catch(() => {})
  } catch {
    // ignore
  }
}

export function shouldClick(key?: string): boolean {
  if (key === undefined) return true
  if (key.length === 1) return true
  return SOUNDED_SPECIAL_KEYS.has(key)
}

export function clickRateFor(key?: string): number {
  if (key === 'Enter') return 0.8
  if (key === 'Backspace') return 1.15
  if (key === ' ') return 0.9
  return 0.95 + Math.random() * 0.15
}

export function playClick(key?: string): void {
  if (!shouldClick(key)) return

  const ctx = getAudioContext()
  if (!ctx) return

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  loadClickBuffer(ctx)
    .then(buffer => {
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.playbackRate.value = clickRateFor(key)

      const gain = ctx.createGain()
      gain.gain.value = 0.6

      source.connect(gain)
      gain.connect(ctx.destination)
      source.start(0, 0, CLICK_DURATION)
    })
    .catch(err => {
      console.error('Error playing sound:', err)
    })
}

export function playPowerOn(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(70, t)
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.9)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(t)
    osc.stop(t + 1.35)
  } catch {
    // ignore
  }
}

export function resetAudioForTests(): void {
  context = null
  clickBuffer = null
}

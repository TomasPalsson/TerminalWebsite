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

/** Short synthesized note: oscillator → gain envelope → destination */
function tone(ctx: AudioContext, opts: { type: OscillatorType; from: number; to?: number; at: number; duration: number; peak: number }) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = opts.type
  osc.frequency.setValueAtTime(opts.from, opts.at)
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, opts.at + opts.duration)
  gain.gain.setValueAtTime(0.0001, opts.at)
  gain.gain.exponentialRampToValueAtTime(opts.peak, opts.at + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(opts.at)
  osc.stop(opts.at + opts.duration + 0.05)
}

/** Resumes a suspended context (must follow a user gesture) and returns it */
function liveContext(): AudioContext | null {
  const ctx = getAudioContext()
  if (!ctx) return null
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

/** Rubber duck: two nasal squawks */
export function playQuack(): void {
  try {
    const ctx = liveContext()
    if (!ctx) return
    const t = ctx.currentTime
    tone(ctx, { type: 'sawtooth', from: 520, to: 380, at: t, duration: 0.16, peak: 0.12 })
    tone(ctx, { type: 'sawtooth', from: 480, to: 340, at: t + 0.2, duration: 0.2, peak: 0.1 })
  } catch {
    // ignore
  }
}

/** Sleepy cat: a soft rising-falling mew */
export function playMeow(): void {
  try {
    const ctx = liveContext()
    if (!ctx) return
    const t = ctx.currentTime
    tone(ctx, { type: 'triangle', from: 600, to: 900, at: t, duration: 0.22, peak: 0.09 })
    tone(ctx, { type: 'triangle', from: 900, to: 520, at: t + 0.22, duration: 0.3, peak: 0.08 })
  } catch {
    // ignore
  }
}

/** "You found everything" fanfare */
export function playFanfare(): void {
  try {
    const ctx = liveContext()
    if (!ctx) return
    const t = ctx.currentTime
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      tone(ctx, { type: 'square', from: freq, at: t + i * 0.12, duration: i === 3 ? 0.5 : 0.14, peak: 0.06 })
    })
  } catch {
    // ignore
  }
}

/** Four-bar chiptune loop in C minor-ish, scheduled ahead in small chunks */
const PARTY_MELODY = [262, 311, 392, 466, 392, 311, 262, 233, 262, 311, 392, 523, 466, 392, 311, 262]
const PARTY_BASS = [131, 131, 98, 98, 117, 117, 131, 131]
const PARTY_STEP = 0.16

let partyTimer: ReturnType<typeof setInterval> | null = null

/** Starts the party loop; a no-op if already playing */
export function startParty(): void {
  if (partyTimer) return
  const ctx = liveContext()
  if (!ctx) return
  let step = 0
  let nextAt = ctx.currentTime + 0.05
  const schedule = () => {
    while (nextAt < ctx.currentTime + 0.4) {
      const lead = PARTY_MELODY[step % PARTY_MELODY.length]
      tone(ctx, { type: 'square', from: lead, at: nextAt, duration: PARTY_STEP * 0.8, peak: 0.045 })
      if (step % 2 === 0) {
        tone(ctx, { type: 'triangle', from: PARTY_BASS[(step / 2) % PARTY_BASS.length], at: nextAt, duration: PARTY_STEP * 1.6, peak: 0.07 })
      }
      if (step % 4 === 0) tone(ctx, { type: 'sawtooth', from: 90, to: 40, at: nextAt, duration: 0.1, peak: 0.08 })
      nextAt += PARTY_STEP
      step += 1
    }
  }
  schedule()
  partyTimer = setInterval(schedule, 150)
}

export function stopParty(): void {
  if (!partyTimer) return
  clearInterval(partyTimer)
  partyTimer = null
}

export function isPartyPlaying(): boolean {
  return partyTimer !== null
}

export function resetAudioForTests(): void {
  stopParty()
  context = null
  clickBuffer = null
}

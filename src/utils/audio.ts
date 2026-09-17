/** Keys longer than one character that still make a click (modifiers do not) */
export const SOUNDED_SPECIAL_KEYS: ReadonlySet<string> = new Set([
  'Enter',
  'Backspace',
  'Tab',
  'Delete',
  'Escape',
])

let context: AudioContext | null = null
let noiseBuffer: AudioBuffer | null = null

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

/** 60 ms of white noise, built once; the raw material for every click transient */
function getNoise(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const length = Math.floor(ctx.sampleRate * 0.06)
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

/** Creates the context and the noise buffer ahead of the first keypress; swallows all errors */
export function warmUp(): void {
  try {
    const ctx = getAudioContext()
    if (ctx) getNoise(ctx)
  } catch {
    // ignore
  }
}

export function shouldClick(key?: string): boolean {
  if (key === undefined) return true
  if (key.length === 1) return true
  return SOUNDED_SPECIAL_KEYS.has(key)
}

/** Per-key pitch variation so a run of keystrokes does not sound like one sample on repeat */
export function clickRateFor(key?: string): number {
  if (key === 'Enter') return 0.8
  if (key === 'Backspace') return 1.15
  if (key === ' ') return 0.9
  return 0.95 + Math.random() * 0.15
}

type ClickVoice = {
  /** Centre of the click resonance in Hz (the "tick") */
  click: number
  /** Centre of the case resonance in Hz (the "tock") */
  body: number
  /** Cut-off of the bottom-out thud in Hz */
  thud: number
  /** Overall loudness */
  level: number
}

/** Keyboard character per key: Enter and Space are bigger keys — lower, more thud; letters are tight ticks */
export function clickVoiceFor(key?: string): ClickVoice {
  if (key === 'Enter') return { click: 2600, body: 900, thud: 220, level: 1.15 }
  if (key === ' ') return { click: 2400, body: 800, thud: 190, level: 1.05 }
  if (key === 'Backspace') return { click: 3600, body: 1300, thud: 260, level: 0.8 }
  return { click: 3300, body: 1150, thud: 250, level: 0.85 }
}

/** ±spread random multiplier so no two presses ring identically */
const vary = (spread: number) => 1 + (Math.random() * 2 - 1) * spread

/**
 * One impulse of noise sent through a resonant filter that rings and decays — the whole
 * sound of a keypress is a few of these in parallel (plastic tick, case tock, desk thud).
 */
function strike(
  ctx: AudioContext,
  out: AudioNode,
  at: number,
  opts: { type: BiquadFilterType; freq: number; q: number; gain: number; decay: number; impulse: number }
) {
  const source = ctx.createBufferSource()
  source.buffer = getNoise(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = opts.type
  filter.frequency.value = opts.freq
  filter.Q.value = opts.q
  const env = ctx.createGain()
  env.gain.setValueAtTime(opts.gain, at)
  env.gain.exponentialRampToValueAtTime(0.001, at + opts.decay)
  source.connect(filter)
  filter.connect(env)
  env.connect(out)
  source.start(at, 0, opts.impulse)
}

/**
 * Synthesised keypress built only from noise impulses ringing through resonant filters —
 * no oscillators, so it reads as plastic and metal rather than a synth. Down-stroke: click
 * leaf + case + bottom-out thud; up-stroke: a lighter click a few dozen ms later.
 */
export function playClick(key?: string): void {
  if (!shouldClick(key)) return
  const ctx = liveContext()
  if (!ctx) return
  try {
    const t = ctx.currentTime
    const rate = clickRateFor(key)
    const voice = clickVoiceFor(key)
    const master = ctx.createGain()
    master.gain.value = 0.55 * voice.level
    master.connect(ctx.destination)

    // Down-stroke
    strike(ctx, master, t, { type: 'bandpass', freq: voice.click * rate * vary(0.08), q: 6, gain: 1.4, decay: 0.035, impulse: 0.004 })
    strike(ctx, master, t, { type: 'bandpass', freq: voice.body * rate * vary(0.1), q: 3, gain: 0.9, decay: 0.05, impulse: 0.006 })
    strike(ctx, master, t + 0.003, { type: 'lowpass', freq: voice.thud, q: 1.2, gain: 1.1, decay: 0.06, impulse: 0.012 })

    // Up-stroke: the switch springing back, quieter and a touch higher
    const up = t + 0.06 + Math.random() * 0.03
    strike(ctx, master, up, { type: 'bandpass', freq: voice.click * rate * 1.15 * vary(0.08), q: 6, gain: 0.6, decay: 0.025, impulse: 0.003 })
    strike(ctx, master, up, { type: 'bandpass', freq: voice.body * rate * vary(0.1), q: 3, gain: 0.35, decay: 0.03, impulse: 0.004 })
  } catch (err) {
    console.error('Error playing sound:', err)
  }
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
  noiseBuffer = null
}

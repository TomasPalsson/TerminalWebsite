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
  /** Fundamental of the "thock" body in Hz */
  body: number
  /** How long the body rings, seconds */
  ring: number
  /** How long the noise transient lasts, seconds */
  snap: number
  /** Overall loudness */
  level: number
}

/** Mechanical keyboard character per key: Enter is a deep stabiliser thunk, Space a wide one, letters a crisp tap */
export function clickVoiceFor(key?: string): ClickVoice {
  if (key === 'Enter') return { body: 150, ring: 0.1, snap: 0.035, level: 1 }
  if (key === ' ') return { body: 175, ring: 0.085, snap: 0.045, level: 0.9 }
  if (key === 'Backspace') return { body: 250, ring: 0.05, snap: 0.02, level: 0.7 }
  return { body: 215, ring: 0.055, snap: 0.02, level: 0.75 }
}

/**
 * Synthesised key click: a filtered noise snap (the switch), a short tuned body (the case
 * resonance) and a tiny bright tick (the keycap). Every call is its own set of nodes, so
 * fast typing overlaps naturally.
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
    master.gain.value = 0.32 * voice.level
    master.connect(ctx.destination)

    // Switch: bandpassed noise with a very fast decay
    const snap = ctx.createBufferSource()
    snap.buffer = getNoise(ctx)
    const snapFilter = ctx.createBiquadFilter()
    snapFilter.type = 'bandpass'
    snapFilter.frequency.value = 2600 * rate
    snapFilter.Q.value = 0.9
    const snapGain = ctx.createGain()
    snapGain.gain.setValueAtTime(1, t)
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + voice.snap)
    snap.connect(snapFilter)
    snapFilter.connect(snapGain)
    snapGain.connect(master)
    snap.start(t, 0, voice.snap + 0.01)

    // Body: triangle that drops in pitch as it dies, low-passed so it thumps rather than buzzes
    const body = ctx.createOscillator()
    body.type = 'triangle'
    body.frequency.setValueAtTime(voice.body * rate, t)
    body.frequency.exponentialRampToValueAtTime(voice.body * rate * 0.7, t + voice.ring)
    const bodyFilter = ctx.createBiquadFilter()
    bodyFilter.type = 'lowpass'
    bodyFilter.frequency.value = 900
    const bodyGain = ctx.createGain()
    bodyGain.gain.setValueAtTime(0.0001, t)
    bodyGain.gain.exponentialRampToValueAtTime(0.9, t + 0.004)
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + voice.ring)
    body.connect(bodyFilter)
    bodyFilter.connect(bodyGain)
    bodyGain.connect(master)
    body.start(t)
    body.stop(t + voice.ring + 0.02)

    // Keycap: a whisper of high sine so the click reads as plastic, not wood
    const tick = ctx.createOscillator()
    tick.type = 'sine'
    tick.frequency.setValueAtTime(4200 * rate, t)
    const tickGain = ctx.createGain()
    tickGain.gain.setValueAtTime(0.12, t)
    tickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.012)
    tick.connect(tickGain)
    tickGain.connect(master)
    tick.start(t)
    tick.stop(t + 0.02)
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

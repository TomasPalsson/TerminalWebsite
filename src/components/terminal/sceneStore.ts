import { useSyncExternalStore } from 'react'
import type { Exhibit } from './exhibits'

/** Named camera views; each is a position + look-at target in world units */
export type CameraPreset = 'default' | 'close' | 'side' | 'top' | 'wide'

export const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; target: [number, number, number] }> = {
  default: { position: [0.05, 0.62, 1.25], target: [0, 0.3, 0.2] },
  close: { position: [0, 0.42, 0.66], target: [0, 0.41, 0.21] },
  side: { position: [1.2, 0.5, 1.0], target: [0, 0.27, 0.15] },
  top: { position: [0, 1.9, 0.55], target: [0, 0, 0.2] },
  wide: { position: [0.3, 0.75, 1.9], target: [0, 0.25, 0.1] },
}

export const CAMERA_PRESET_NAMES = Object.keys(CAMERA_PRESETS) as CameraPreset[]

export type CameraGoal = { position: [number, number, number]; target: [number, number, number] }

/** What the CRT shows instead of the shell */
export type Screensaver = 'off' | 'matrix' | 'dvd'
export const SCREENSAVERS: Screensaver[] = ['off', 'matrix', 'dvd']

export type SceneState = {
  /** Preset the camera last flew to, or null when framing an exhibit; `cameraNonce` bumps so re-selecting re-animates */
  cameraPreset: CameraPreset | null
  cameraGoal: CameraGoal
  cameraNonce: number
  /** First-person walk mode (pointer lock + WASD) */
  walk: boolean
  /** Whether the browser currently has the mouse captured for looking around */
  pointerLocked: boolean
  /** Ceiling light so the room is visible while walking */
  roomLights: boolean
  /** Disco lights + chiptune */
  party: boolean
  /** When false the desk clutter floats away */
  gravity: boolean
  screensaver: Screensaver
  /** Everything drawn as wireframe */
  xray: boolean
  /** Things hung around the room, set once the profile has loaded */
  exhibits: Exhibit[]
  /** Exhibit the player is standing in front of (walk mode) */
  nearExhibit: string | null
  /** Exhibit whose info card is open */
  focusedExhibit: string | null
  /** Ids of exhibits the visitor has inspected (persisted) */
  discovered: string[]
  /** Bumps to fire a confetti burst */
  celebrateNonce: number
  /** Monitor power — off blanks the screen and kills its glow */
  power: boolean
  lampOn: boolean
  /** CRT post-processing (bloom, scanlines…) */
  effects: boolean
  sound: boolean
  /** Slow orbit around the desk */
  spin: boolean
  /** Desk clutter (mug, floppies, lamp, note) */
  props: boolean
  /** Frames per second, sampled by the scene */
  fps: number
}

const STORAGE_KEY = 'terminal3d-scene'
/** Pre-revamp key; `true` meant effects off */
const LEGACY_PERFORMANCE_KEY = 'terminal3d-performance-mode'

const PERSISTED_KEYS = ['lampOn', 'effects', 'sound', 'props'] as const
const PERSISTED_LISTS = ['discovered'] as const

export const DEFAULT_SCENE_STATE: SceneState = {
  cameraPreset: 'default',
  cameraGoal: CAMERA_PRESETS.default,
  cameraNonce: 0,
  walk: false,
  pointerLocked: false,
  roomLights: false,
  party: false,
  gravity: true,
  screensaver: 'off',
  xray: false,
  exhibits: [],
  nearExhibit: null,
  focusedExhibit: null,
  discovered: [],
  celebrateNonce: 0,
  power: true,
  lampOn: true,
  effects: true,
  sound: true,
  spin: false,
  props: true,
  fps: 0,
}

type Listener = () => void

export type SceneToggle = 'power' | 'lampOn' | 'effects' | 'sound' | 'spin' | 'props' | 'walk' | 'roomLights' | 'party' | 'gravity' | 'xray'

let state: SceneState = DEFAULT_SCENE_STATE
let hydrated = false
const listeners = new Set<Listener>()

const readPersisted = (): Partial<SceneState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SceneState>
      const out: Partial<SceneState> = {}
      PERSISTED_KEYS.forEach((key) => {
        if (typeof parsed[key] === 'boolean') out[key] = parsed[key]
      })
      PERSISTED_LISTS.forEach((key) => {
        if (Array.isArray(parsed[key])) out[key] = parsed[key].filter((v): v is string => typeof v === 'string')
      })
      return out
    }
    const legacy = localStorage.getItem(LEGACY_PERFORMANCE_KEY)
    if (legacy !== null) return { effects: legacy !== 'true' }
  } catch {
    // Storage unavailable (private mode, SSR)
  }
  return {}
}

const writePersisted = () => {
  try {
    const out: Partial<SceneState> = {}
    PERSISTED_KEYS.forEach((key) => {
      out[key] = state[key]
    })
    PERSISTED_LISTS.forEach((key) => {
      out[key] = state[key]
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
  } catch {
    // Ignore storage errors
  }
}

/** Loads persisted prefs once on the client; a no-op on the server */
const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  state = { ...state, ...readPersisted() }
}

export const sceneStore = {
  getState(): SceneState {
    hydrate()
    return state
  },
  setState(partial: Partial<SceneState>) {
    hydrate()
    const next = { ...state, ...partial }
    const changed = (Object.keys(partial) as (keyof SceneState)[]).some((key) => next[key] !== state[key])
    if (!changed) return
    state = next
    if ([...PERSISTED_KEYS, ...PERSISTED_LISTS].some((key) => key in partial)) writePersisted()
    listeners.forEach((listener) => listener())
  },
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  /** Flies the camera to a preset, even if it is already selected */
  setCamera(preset: CameraPreset) {
    sceneStore.setState({ cameraPreset: preset, cameraGoal: CAMERA_PRESETS[preset], cameraNonce: state.cameraNonce + 1, walk: false })
  },
  /** Flies the camera to an arbitrary view (used to frame exhibits) */
  flyTo(goal: CameraGoal) {
    sceneStore.setState({ cameraPreset: null, cameraGoal: goal, cameraNonce: state.cameraNonce + 1, walk: false })
  },
  toggle(key: SceneToggle) {
    sceneStore.setState({ [key]: !sceneStore.getState()[key] })
  },
  /** Opens an exhibit's card and records it as discovered; fires confetti when the last one is found */
  inspect(id: string | null) {
    if (!id) {
      sceneStore.setState({ focusedExhibit: null })
      return
    }
    const current = sceneStore.getState()
    const discovered = current.discovered.includes(id) ? current.discovered : [...current.discovered, id]
    const total = current.exhibits.length
    const completed = total > 0 && discovered.length >= total && current.discovered.length < total
    sceneStore.setState({
      focusedExhibit: id,
      discovered,
      celebrateNonce: completed ? current.celebrateNonce + 1 : current.celebrateNonce,
    })
  },
  celebrate() {
    sceneStore.setState({ celebrateNonce: state.celebrateNonce + 1 })
  },
  reset() {
    sceneStore.setState({
      ...DEFAULT_SCENE_STATE,
      cameraNonce: state.cameraNonce + 1,
      fps: state.fps,
      exhibits: state.exhibits,
      discovered: state.discovered,
    })
  },
  /** Test hook: drops state and persistence back to defaults */
  resetForTests() {
    state = DEFAULT_SCENE_STATE
    hydrated = false
    listeners.clear()
  },
}

const getServerSnapshot = () => DEFAULT_SCENE_STATE

/** Reads a slice of the scene store; the selector must return a stable primitive or reference */
export function useSceneStore<T>(selector: (s: SceneState) => T): T {
  return useSyncExternalStore(
    sceneStore.subscribe,
    () => selector(sceneStore.getState()),
    () => selector(getServerSnapshot())
  )
}

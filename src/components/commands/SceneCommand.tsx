import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { Box, AlertCircle, Check } from 'lucide-react'
import { sceneStore, CAMERA_PRESET_NAMES, type CameraPreset, type SceneState } from '../terminal/sceneStore'

type ToggleKey = 'power' | 'lampOn' | 'effects' | 'sound' | 'spin' | 'props'

/** Subcommand → store key for the on/off toggles */
const TOGGLES: Record<string, ToggleKey> = {
  power: 'power',
  lamp: 'lampOn',
  fx: 'effects',
  effects: 'effects',
  sound: 'sound',
  spin: 'spin',
  props: 'props',
}

const CAMERA_ALIASES = ['cam', 'camera', 'view']

const onOff = (value: boolean) => (value ? 'on' : 'off')

/** Parses on/off/toggle; returns null for anything else */
export const parseSwitch = (arg: string | undefined, current: boolean): boolean | null => {
  if (arg === undefined || arg === 'toggle') return !current
  if (arg === 'on' || arg === '1' || arg === 'true') return true
  if (arg === 'off' || arg === '0' || arg === 'false') return false
  return null
}

const Ok = ({ children }: { children: React.ReactNode }) => (
  <div className="font-mono text-sm">
    <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <Check size={14} className="text-terminal" />
      <span className="text-gray-200">{children}</span>
    </div>
  </div>
)

const Fail = ({ children }: { children: React.ReactNode }) => (
  <div className="font-mono text-sm">
    <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
      <AlertCircle size={14} className="text-red-400" />
      <span className="text-red-400">{children}</span>
    </div>
  </div>
)

const Status = ({ state, headless }: { state: SceneState; headless: boolean }) => {
  const rows: [string, string][] = [
    ['camera', state.cameraPreset],
    ['power', onOff(state.power)],
    ['lamp', onOff(state.lampOn)],
    ['fx', onOff(state.effects)],
    ['sound', onOff(state.sound)],
    ['spin', onOff(state.spin)],
    ['props', onOff(state.props)],
  ]
  if (headless && state.fps > 0) rows.push(['fps', String(state.fps)])
  return (
    <div className="font-mono text-sm">
      <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-800">
          <Box size={14} className="text-terminal" />
          <span className="text-white">3d scene</span>
        </div>
        <div className="space-y-1">
          {rows.map(([key, value]) => (
            <p key={key}>
              <span className="text-gray-500">{key.padEnd(8)}</span>
              <span className="text-terminal">{value}</span>
            </p>
          ))}
        </div>
        {!headless && (
          <p className="text-gray-500 text-xs mt-3">
            Settings apply to the 3D terminal — open <span className="text-terminal">/blob</span> to see them.
          </p>
        )}
      </div>
    </div>
  )
}

export const SceneCommand: Command = {
  name: 'scene',
  description: 'Control the 3D terminal scene (camera, lamp, effects, sound…)',
  usage: (
    <div className="font-mono text-sm">
      <p className="text-terminal mb-2">Usage:</p>
      <p className="text-gray-400 mb-3">scene [command] [value]</p>
      <p className="text-terminal mb-2">Commands:</p>
      <div className="space-y-1 text-gray-400 mb-3">
        <p><span className="text-white">cam {CAMERA_PRESET_NAMES.join('|')}</span> — Fly the camera to a view</p>
        <p><span className="text-white">power on|off</span> — Switch the monitor on or off</p>
        <p><span className="text-white">lamp on|off</span> — Desk lamp</p>
        <p><span className="text-white">fx on|off</span> — CRT post-processing</p>
        <p><span className="text-white">sound on|off</span> — Key clicks</p>
        <p><span className="text-white">spin on|off</span> — Slowly orbit the desk</p>
        <p><span className="text-white">props on|off</span> — Desk clutter</p>
        <p><span className="text-white">reset</span> — Back to defaults</p>
      </div>
      <p className="text-gray-500 text-xs">Omit the value to toggle. Run <span className="text-terminal">scene</span> alone for the current state.</p>
    </div>
  ),
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    const headless = !!context.headless
    const [sub, value] = args
    const state = sceneStore.getState()

    if (!sub || sub === 'status') return <Status state={state} headless={headless} />

    if (sub === 'help') return SceneCommand.usage ?? null

    if (sub === 'reset') {
      sceneStore.reset()
      return <Ok>scene reset to defaults</Ok>
    }

    if (CAMERA_ALIASES.includes(sub)) {
      const preset = (value === 'reset' || value === undefined ? 'default' : value) as CameraPreset
      if (!CAMERA_PRESET_NAMES.includes(preset)) {
        return <Fail>Unknown view &quot;{value}&quot; — try {CAMERA_PRESET_NAMES.join(', ')}</Fail>
      }
      sceneStore.setCamera(preset)
      return <Ok>camera → {preset}</Ok>
    }

    const key = TOGGLES[sub]
    if (key) {
      const next = parseSwitch(value, state[key])
      if (next === null) return <Fail>Expected on, off or toggle — got &quot;{value}&quot;</Fail>
      sceneStore.setState({ [key]: next })
      return <Ok>{sub} {onOff(next)}</Ok>
    }

    return <Fail>Unknown scene command &quot;{sub}&quot; — try scene help</Fail>
  },
}

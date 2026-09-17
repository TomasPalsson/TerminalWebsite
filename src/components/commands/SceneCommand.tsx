import React from 'react'
import Command from './Command'
import { KeyPressContextType } from '../../context/KeypressedContext'
import { Box, AlertCircle, Check } from 'lucide-react'
import {
  sceneStore,
  CAMERA_PRESET_NAMES,
  SCREENSAVERS,
  type CameraPreset,
  type SceneState,
  type SceneToggle,
  type Screensaver,
} from '../terminal/sceneStore'
import { exhibitView } from '../terminal/exhibits'
import { activateExhibit } from '../terminal/exhibitActions'

/** Subcommand → store key for the on/off toggles */
const TOGGLES: Record<string, SceneToggle> = {
  power: 'power',
  lamp: 'lampOn',
  fx: 'effects',
  effects: 'effects',
  sound: 'sound',
  spin: 'spin',
  props: 'props',
  walk: 'walk',
  explore: 'walk',
  lights: 'roomLights',
  party: 'party',
  disco: 'party',
  gravity: 'gravity',
  xray: 'xray',
}

const CAMERA_ALIASES = ['cam', 'camera', 'view']
const GOTO_ALIASES = ['goto', 'go', 'inspect', 'open']

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

const Panel = ({ title, rows, footer }: { title: string; rows: [string, string][]; footer?: React.ReactNode }) => (
  <div className="font-mono text-sm">
    <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-800">
        <Box size={14} className="text-terminal" />
        <span className="text-white">{title}</span>
      </div>
      <div className="space-y-1">
        {rows.map(([key, value]) => (
          <p key={key}>
            <span className="text-gray-500">{key.padEnd(10)}</span>
            <span className="text-terminal">{value}</span>
          </p>
        ))}
      </div>
      {footer}
    </div>
  </div>
)

const Status = ({ state, headless }: { state: SceneState; headless: boolean }) => {
  const rows: [string, string][] = [
    ['camera', state.walk ? 'walking' : (state.cameraPreset ?? 'exhibit')],
    ['power', onOff(state.power)],
    ['lamp', onOff(state.lampOn)],
    ['lights', onOff(state.roomLights)],
    ['fx', onOff(state.effects)],
    ['sound', onOff(state.sound)],
    ['spin', onOff(state.spin)],
    ['props', onOff(state.props)],
    ['gravity', onOff(state.gravity)],
    ['party', onOff(state.party)],
    ['xray', onOff(state.xray)],
    ['saver', state.screensaver],
    ['found', `${state.exhibits.filter((e) => state.discovered.includes(e.id)).length}/${state.exhibits.length}`],
  ]
  if (headless && state.fps > 0) rows.push(['fps', String(state.fps)])
  return (
    <Panel
      title="3d scene"
      rows={rows}
      footer={
        !headless && (
          <p className="text-gray-500 text-xs mt-3">
            Settings apply to the 3D terminal — open <span className="text-terminal">/blob</span> to see them.
          </p>
        )
      }
    />
  )
}

/** `scene look`: everything in the room, ticked once inspected */
const Look = ({ state }: { state: SceneState }) => {
  if (state.exhibits.length === 0) return <Fail>The room is still loading — try again in a second.</Fail>
  const rows: [string, string][] = state.exhibits.map((e) => [e.id, `${state.discovered.includes(e.id) ? '✓ ' : '  '}${e.title}`])
  return <Panel title="in the room" rows={rows} footer={<p className="text-gray-500 text-xs mt-3">scene goto &lt;id&gt; flies to it and opens its card.</p>} />
}

const usage = (
  <div className="font-mono text-sm">
    <p className="text-terminal mb-2">Usage:</p>
    <p className="text-gray-400 mb-3">scene [command] [value]</p>
    <p className="text-terminal mb-2">Look around:</p>
    <div className="space-y-1 text-gray-400 mb-3">
      <p><span className="text-white">look</span> — List everything in the room</p>
      <p><span className="text-white">goto &lt;id&gt;</span> — Fly to a thing and open its card</p>
      <p><span className="text-white">walk on|off</span> — First-person mode (WASD, mouse, E, Esc)</p>
      <p><span className="text-white">cam {CAMERA_PRESET_NAMES.join('|')}</span> — Fly the camera to a view</p>
    </div>
    <p className="text-terminal mb-2">Room:</p>
    <div className="space-y-1 text-gray-400 mb-3">
      <p><span className="text-white">power · lamp · lights · fx · sound · spin · props</span> on|off</p>
      <p><span className="text-white">party on|off</span> — Disco lights and a chiptune</p>
      <p><span className="text-white">gravity on|off</span> — Off, and the desk floats away</p>
      <p><span className="text-white">xray on|off</span> — Wireframe everything</p>
      <p><span className="text-white">saver {SCREENSAVERS.join('|')}</span> — Screensaver on the CRT</p>
      <p><span className="text-white">reset</span> — Back to defaults</p>
    </div>
    <p className="text-gray-500 text-xs">Omit the value to toggle. Run <span className="text-terminal">scene</span> alone for the current state.</p>
  </div>
)

const runCamera = (value: string | undefined) => {
  const preset = (value === 'reset' || value === undefined ? 'default' : value) as CameraPreset
  if (!CAMERA_PRESET_NAMES.includes(preset)) {
    return <Fail>Unknown view &quot;{value}&quot; — try {CAMERA_PRESET_NAMES.join(', ')}</Fail>
  }
  sceneStore.setCamera(preset)
  return <Ok>camera → {preset}</Ok>
}

const runGoto = (value: string | undefined, state: SceneState) => {
  const exhibit = state.exhibits.find((e) => e.id === value || e.id === `project-${value}`)
  if (!exhibit) return <Fail>Nothing called &quot;{value}&quot; here — scene look lists the room.</Fail>
  sceneStore.flyTo(exhibitView(exhibit))
  activateExhibit(exhibit.id)
  return <Ok>looking at {exhibit.title}</Ok>
}

const runSaver = (value: string | undefined) => {
  const saver = (value ?? 'matrix') as Screensaver
  if (!SCREENSAVERS.includes(saver)) return <Fail>Unknown screensaver &quot;{value}&quot; — try {SCREENSAVERS.join(', ')}</Fail>
  sceneStore.setState({ screensaver: saver })
  return <Ok>screensaver {saver}</Ok>
}

export const SceneCommand: Command = {
  name: 'scene',
  description: 'Control the 3D room: walk around, fly to exhibits, lights, party mode…',
  usage,
  args: [],
  run: async (args: string[], context: KeyPressContextType) => {
    const headless = !!context.headless
    const [sub, value] = args
    const state = sceneStore.getState()

    if (!sub || sub === 'status') return <Status state={state} headless={headless} />
    if (sub === 'help') return usage
    if (sub === 'look' || sub === 'ls') return <Look state={state} />
    if (CAMERA_ALIASES.includes(sub)) return runCamera(value)
    if (GOTO_ALIASES.includes(sub)) return runGoto(value, state)
    if (sub === 'saver' || sub === 'screensaver') return runSaver(value)

    if (sub === 'reset') {
      sceneStore.reset()
      return <Ok>scene reset to defaults</Ok>
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

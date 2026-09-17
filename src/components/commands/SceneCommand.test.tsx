import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { SceneCommand, parseSwitch } from './SceneCommand'
import { sceneStore } from '../terminal/sceneStore'
import { buildExhibits } from '../terminal/exhibits'
import type { KeyPressContextType } from '../../context/KeypressedContext'

const context = (headless: boolean) => ({ headless }) as unknown as KeyPressContextType

const textOf = async (args: string[], headless = true) => {
  const node = await SceneCommand.run(args, context(headless))
  return render(<>{node}</>).container.textContent ?? ''
}

describe('parseSwitch', () => {
  it('toggles when no value is given', () => {
    expect(parseSwitch(undefined, true)).toBe(false)
    expect(parseSwitch('toggle', false)).toBe(true)
  })

  it('accepts on/off spellings', () => {
    expect(parseSwitch('on', false)).toBe(true)
    expect(parseSwitch('1', false)).toBe(true)
    expect(parseSwitch('off', true)).toBe(false)
    expect(parseSwitch('false', true)).toBe(false)
  })

  it('rejects anything else', () => {
    expect(parseSwitch('maybe', true)).toBeNull()
  })
})

describe('SceneCommand', () => {
  beforeEach(() => {
    localStorage.clear()
    sceneStore.resetForTests()
  })

  it('is registered under the name scene', () => {
    expect(SceneCommand.name).toBe('scene')
  })

  it('prints the current state with no args', async () => {
    const text = await textOf([])
    expect(text).toContain('camera')
    expect(text).toContain('default')
    expect(text).toContain('lamp')
  })

  it('points 2D users at the 3D page', async () => {
    const text = await textOf([], false)
    expect(text).toContain('/blob')
  })

  it('flies the camera to a preset', async () => {
    const text = await textOf(['cam', 'wide'])
    expect(text).toContain('camera → wide')
    expect(sceneStore.getState().cameraPreset).toBe('wide')
  })

  it('accepts camera aliases and reset', async () => {
    sceneStore.setCamera('top')
    await textOf(['view', 'reset'])
    expect(sceneStore.getState().cameraPreset).toBe('default')
  })

  it('rejects an unknown view', async () => {
    const text = await textOf(['cam', 'moon'])
    expect(text).toContain('Unknown view')
    expect(sceneStore.getState().cameraPreset).toBe('default')
  })

  it('toggles the lamp', async () => {
    await textOf(['lamp'])
    expect(sceneStore.getState().lampOn).toBe(false)
    await textOf(['lamp', 'on'])
    expect(sceneStore.getState().lampOn).toBe(true)
  })

  it('maps fx/effects, sound, spin, props and power', async () => {
    await textOf(['fx', 'off'])
    await textOf(['sound', 'off'])
    await textOf(['spin', 'on'])
    await textOf(['props', 'off'])
    await textOf(['power', 'off'])
    const state = sceneStore.getState()
    expect(state.effects).toBe(false)
    expect(state.sound).toBe(false)
    expect(state.spin).toBe(true)
    expect(state.props).toBe(false)
    expect(state.power).toBe(false)
    await textOf(['effects', 'on'])
    expect(sceneStore.getState().effects).toBe(true)
  })

  it('rejects a bad switch value', async () => {
    const text = await textOf(['lamp', 'dim'])
    expect(text).toContain('Expected on, off or toggle')
    expect(sceneStore.getState().lampOn).toBe(true)
  })

  it('resets everything', async () => {
    await textOf(['lamp', 'off'])
    await textOf(['cam', 'side'])
    const text = await textOf(['reset'])
    expect(text).toContain('reset')
    expect(sceneStore.getState().lampOn).toBe(true)
    expect(sceneStore.getState().cameraPreset).toBe('default')
  })

  it('lists the room and flies to an exhibit', async () => {
    expect(await textOf(['look'])).toContain('still loading')
    sceneStore.setState({ exhibits: buildExhibits(null) })
    const look = await textOf(['look'])
    expect(look).toContain('duck')
    expect(look).toContain('Debugging duck')
    const text = await textOf(['goto', 'duck'])
    expect(text).toContain('looking at Debugging duck')
    expect(sceneStore.getState().focusedExhibit).toBe('duck')
    expect(sceneStore.getState().cameraPreset).toBeNull()
    expect(await textOf(['look'])).toContain('✓ Debugging duck')
  })

  it('rejects an unknown exhibit', async () => {
    sceneStore.setState({ exhibits: buildExhibits(null) })
    expect(await textOf(['goto', 'fridge'])).toContain('Nothing called')
  })

  it('toggles walk, lights, party, gravity and xray', async () => {
    await textOf(['walk', 'on'])
    await textOf(['lights', 'off'])
    await textOf(['party', 'on'])
    await textOf(['gravity', 'off'])
    await textOf(['xray', 'on'])
    const state = sceneStore.getState()
    expect(state.walk).toBe(true)
    expect(state.roomLights).toBe(false)
    expect(state.party).toBe(true)
    expect(state.gravity).toBe(false)
    expect(state.xray).toBe(true)
  })

  it('sets the screensaver', async () => {
    expect(await textOf(['saver'])).toContain('screensaver matrix')
    expect(sceneStore.getState().screensaver).toBe('matrix')
    await textOf(['saver', 'dvd'])
    expect(sceneStore.getState().screensaver).toBe('dvd')
    expect(await textOf(['saver', 'toaster'])).toContain('Unknown screensaver')
    await textOf(['saver', 'off'])
    expect(sceneStore.getState().screensaver).toBe('off')
  })

  it('shows usage for help and errors for unknown subcommands', async () => {
    expect(await textOf(['help'])).toContain('Usage')
    expect(await textOf(['dance'])).toContain('Unknown scene command')
  })
})

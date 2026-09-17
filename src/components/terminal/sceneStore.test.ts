import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { sceneStore, useSceneStore, DEFAULT_SCENE_STATE, CAMERA_PRESET_NAMES } from './sceneStore'

describe('sceneStore', () => {
  beforeEach(() => {
    localStorage.clear()
    sceneStore.resetForTests()
  })

  it('starts from defaults', () => {
    expect(sceneStore.getState()).toEqual(DEFAULT_SCENE_STATE)
  })

  it('setState merges and notifies subscribers only on change', () => {
    const listener = vi.fn()
    sceneStore.subscribe(listener)
    sceneStore.setState({ lampOn: false })
    sceneStore.setState({ lampOn: false })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(sceneStore.getState().lampOn).toBe(false)
  })

  it('persists only the preference keys', () => {
    sceneStore.setState({ lampOn: false, spin: true, fps: 60 })
    expect(JSON.parse(localStorage.getItem('terminal3d-scene')!)).toEqual({
      lampOn: false,
      effects: true,
      sound: true,
      props: true,
    })
  })

  it('hydrates persisted prefs on first read', () => {
    localStorage.setItem('terminal3d-scene', JSON.stringify({ sound: false, effects: false, spin: true }))
    sceneStore.resetForTests()
    const state = sceneStore.getState()
    expect(state.sound).toBe(false)
    expect(state.effects).toBe(false)
    // spin is session-only and never hydrated
    expect(state.spin).toBe(false)
  })

  it('migrates the legacy performance-mode flag', () => {
    localStorage.setItem('terminal3d-performance-mode', 'true')
    sceneStore.resetForTests()
    expect(sceneStore.getState().effects).toBe(false)
  })

  it('setCamera bumps the nonce so the same preset re-animates', () => {
    sceneStore.setCamera('close')
    const first = sceneStore.getState().cameraNonce
    sceneStore.setCamera('close')
    expect(sceneStore.getState().cameraPreset).toBe('close')
    expect(sceneStore.getState().cameraNonce).toBe(first + 1)
  })

  it('toggle flips a boolean', () => {
    sceneStore.toggle('sound')
    expect(sceneStore.getState().sound).toBe(false)
    sceneStore.toggle('sound')
    expect(sceneStore.getState().sound).toBe(true)
  })

  it('reset restores defaults but keeps fps and re-flies the camera', () => {
    sceneStore.setState({ lampOn: false, spin: true, fps: 42 })
    sceneStore.setCamera('top')
    const nonce = sceneStore.getState().cameraNonce
    sceneStore.reset()
    const state = sceneStore.getState()
    expect(state.lampOn).toBe(true)
    expect(state.spin).toBe(false)
    expect(state.cameraPreset).toBe('default')
    expect(state.fps).toBe(42)
    expect(state.cameraNonce).toBe(nonce + 1)
  })

  it('exposes every preset name', () => {
    expect(CAMERA_PRESET_NAMES).toEqual(['default', 'close', 'side', 'top', 'wide'])
  })

  it('useSceneStore re-renders on the selected slice', () => {
    const { result } = renderHook(() => useSceneStore((s) => s.lampOn))
    expect(result.current).toBe(true)
    act(() => sceneStore.setState({ lampOn: false }))
    expect(result.current).toBe(false)
  })
})

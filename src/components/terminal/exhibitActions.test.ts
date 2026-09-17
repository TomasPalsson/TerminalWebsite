import { describe, it, expect, beforeEach, vi } from 'vitest'
import { sceneStore } from './sceneStore'
import { buildExhibits } from './exhibits'
import { activateExhibit, closeCard, openCardLink } from './exhibitActions'
import { reactions } from './reactions'

describe('exhibit actions', () => {
  beforeEach(() => {
    localStorage.clear()
    sceneStore.resetForTests()
    sceneStore.setState({ exhibits: buildExhibits(null), sound: false })
  })

  it('activating the duck opens its card and makes it hop', () => {
    const hops = reactions.duck
    activateExhibit('duck')
    expect(sceneStore.getState().focusedExhibit).toBe('duck')
    expect(reactions.duck).toBe(hops + 1)
  })

  it('closing a card flies back to the desk when the camera was parked at an exhibit', () => {
    sceneStore.flyTo({ position: [1, 1, 1], target: [0, 0, 0] })
    activateExhibit('sign')
    closeCard()
    expect(sceneStore.getState().focusedExhibit).toBeNull()
    expect(sceneStore.getState().cameraPreset).toBe('default')
  })

  it('closing a card while walking keeps walking', () => {
    sceneStore.setState({ walk: true })
    activateExhibit('sign')
    closeCard()
    expect(sceneStore.getState().walk).toBe(true)
    expect(sceneStore.getState().focusedExhibit).toBeNull()
  })

  it('opens the numbered link of the open card', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    sceneStore.setState({
      exhibits: [
        {
          id: 'x',
          kind: 'poster',
          title: 'X',
          lines: [],
          links: [
            { label: 'A', href: 'https://a' },
            { label: 'B', href: 'https://b' },
          ],
          position: [0, 0, 0],
          rotationY: 0,
          size: [1, 1],
        },
      ],
    })
    activateExhibit('x')
    openCardLink(2)
    expect(open).toHaveBeenCalledWith('https://b', '_blank', 'noopener')
    openCardLink(3)
    expect(open).toHaveBeenCalledTimes(1)
    open.mockRestore()
  })
})

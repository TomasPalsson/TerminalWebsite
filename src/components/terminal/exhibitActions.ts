import { playFanfare, playQuack } from '../../utils/audio'
import { sceneStore } from './sceneStore'
import { reactions } from './reactions'

/**
 * Opens an exhibit's card (and marks it discovered); the duck reacts with a sound.
 * Shared by clicks in orbit mode, the E key in walk mode and `scene inspect`.
 */
export function activateExhibit(id: string) {
  const before = sceneStore.getState().celebrateNonce
  const sound = sceneStore.getState().sound
  sceneStore.inspect(id)
  if (id === 'duck') {
    reactions.duck += 1
    if (sound) playQuack()
  }
  if (sound && sceneStore.getState().celebrateNonce !== before) playFanfare()
}

/** Closes the card; if the camera was parked at an exhibit (scene goto / click), flies back to the desk */
export function closeCard() {
  const { walk, cameraPreset } = sceneStore.getState()
  sceneStore.inspect(null)
  if (!walk && cameraPreset === null) sceneStore.setCamera('default')
}

/** Opens the n-th link (1-based) of the open card in a new tab; used by number keys in walk mode */
export function openCardLink(index: number) {
  const { focusedExhibit, exhibits } = sceneStore.getState()
  const link = exhibits.find((e) => e.id === focusedExhibit)?.links?.[index - 1]
  if (link) window.open(link.href, '_blank', 'noopener')
}

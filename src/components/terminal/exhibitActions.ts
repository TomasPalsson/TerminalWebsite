import { playFanfare, playMeow, playQuack } from '../../utils/audio'
import { sceneStore } from './sceneStore'

/** Bumps that other components animate on (duck bounce, cat tail flick) */
export const reactions = { duck: 0, cat: 0 }

/**
 * Opens an exhibit's card (and marks it discovered); living-room residents react with a sound.
 * Shared by clicks in orbit mode, the E key in walk mode and `scene inspect`.
 */
export function activateExhibit(id: string) {
  const before = sceneStore.getState().celebrateNonce
  const sound = sceneStore.getState().sound
  sceneStore.inspect(id)
  if (id === 'duck') {
    reactions.duck += 1
    if (sound) playQuack()
  } else if (id === 'cat') {
    reactions.cat += 1
    if (sound) playMeow()
  }
  if (sound && sceneStore.getState().celebrateNonce !== before) playFanfare()
}

/**
 * Pointer-lock plumbing shared by the walk controls (inside the canvas) and the HUD (outside it).
 * Browsers only grant pointer lock from inside a user-gesture handler, so the HUD's
 * "click to look around" button needs a direct line to the canvas element.
 */
let target: HTMLElement | null = null

export function setWalkLockTarget(el: HTMLElement | null) {
  target = el
}

/** Requests pointer lock on the canvas; silently ignores refusals (the HUD offers a click instead) */
export function requestWalkLock() {
  if (!target) return
  try {
    const result = (target.requestPointerLock as () => Promise<void> | void).call(target)
    if (result && typeof (result as Promise<void>).catch === 'function') (result as Promise<void>).catch(() => {})
  } catch {
    // Not available (e.g. iframe policy); the walk still works with the keyboard
  }
}

export function releaseWalkLock() {
  if (typeof document !== 'undefined' && document.pointerLockElement) document.exitPointerLock()
}

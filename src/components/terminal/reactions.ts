/**
 * Counters that animated components watch from useFrame: bump one and the matching
 * animation plays once (duck hop, screen glow pulse). Kept outside React state so
 * a keypress never re-renders the scene tree.
 */
export const reactions = { duck: 0, screen: 0 }

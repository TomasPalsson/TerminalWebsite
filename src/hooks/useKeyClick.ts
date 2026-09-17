import { useCallback, useEffect, useRef } from 'react'
import { playClick, warmUp } from '../utils/audio'

export default function useKeyClick(enabled = true) {
  const enabledRef = useRef(enabled)

  useEffect(() => {
    enabledRef.current = enabled
    if (enabled) warmUp()
  }, [enabled])

  const play = useCallback((key?: string) => {
    if (!enabledRef.current) return
    playClick(key)
  }, [])

  return play
}

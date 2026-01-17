import { useState, useEffect, useCallback } from 'react'
import type { UsePerformanceModeReturn } from '../types/terminal3d'

const STORAGE_KEY = 'terminal3d-performance-mode'

/**
 * Hook for managing performance mode preference with localStorage persistence
 * @returns Performance mode state and controls
 */
export function usePerformanceMode(): UsePerformanceModeReturn {
  const [performanceMode, setPerformanceModeState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored === 'true'
    } catch {
      return false
    }
  })

  // Persist to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(performanceMode))
    } catch {
      // Ignore storage errors
    }
  }, [performanceMode])

  const togglePerformanceMode = useCallback(() => {
    setPerformanceModeState((prev) => !prev)
  }, [])

  const setPerformanceMode = useCallback((enabled: boolean) => {
    setPerformanceModeState(enabled)
  }, [])

  return {
    performanceMode,
    togglePerformanceMode,
    setPerformanceMode,
  }
}

export default usePerformanceMode

import React, { useState, useEffect, useCallback } from 'react'
import type { BootSequenceProps, BootPhase } from '../../types/terminal3d'

/** Boot sequence timing configuration */
const BOOT_TIMING = {
  warmUp: 800,      // CRT warm-up duration
  bootText: 1200,   // Boot text display duration
  total: 2000,      // Total boot sequence duration
}

/** Boot text messages */
const BOOT_MESSAGES = [
  'INITIALIZING TERMINAL...',
  'LOADING SYSTEM...',
  'READY.',
]

/**
 * CRT power-on boot sequence animation
 * Displays warm-up effect and boot text before terminal appears
 */
export default function BootSequence({ onComplete, skip = false }: BootSequenceProps) {
  const [phase, setPhase] = useState<BootPhase>(skip ? 'ready' : 'off')
  const [brightness, setBrightness] = useState(skip ? 1 : 0)
  const [bootTextIndex, setBootTextIndex] = useState(0)

  // Handle skip mode
  useEffect(() => {
    if (skip) {
      setPhase('ready')
      setBrightness(1)
      onComplete()
    }
  }, [skip, onComplete])

  // Boot sequence progression
  useEffect(() => {
    if (skip) return

    // Start warm-up phase
    const warmUpTimer = setTimeout(() => {
      setPhase('warming')
    }, 100)

    // Transition to booting phase
    const bootingTimer = setTimeout(() => {
      setPhase('booting')
    }, BOOT_TIMING.warmUp)

    // Complete boot sequence
    const completeTimer = setTimeout(() => {
      setPhase('ready')
      onComplete()
    }, BOOT_TIMING.total)

    return () => {
      clearTimeout(warmUpTimer)
      clearTimeout(bootingTimer)
      clearTimeout(completeTimer)
    }
  }, [skip, onComplete])

  // Brightness animation during warm-up
  useEffect(() => {
    if (phase !== 'warming' && phase !== 'booting') return

    const interval = setInterval(() => {
      setBrightness((prev) => {
        const next = prev + 0.05
        return next >= 1 ? 1 : next
      })
    }, 50)

    return () => clearInterval(interval)
  }, [phase])

  // Boot text progression
  useEffect(() => {
    if (phase !== 'booting') return

    const interval = setInterval(() => {
      setBootTextIndex((prev) => {
        if (prev >= BOOT_MESSAGES.length - 1) return prev
        return prev + 1
      })
    }, 400)

    return () => clearInterval(interval)
  }, [phase])

  // Don't render overlay when ready
  if (phase === 'ready') return null

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300"
      style={{ opacity: phase === 'ready' ? 0 : 1 - brightness * 0.7 }}
    >
      {/* CRT warm-up glow */}
      {(phase === 'warming' || phase === 'booting') && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse at center, rgba(34, 197, 94, ${brightness * 0.15}) 0%, transparent 70%)`,
          }}
        >
          {/* Boot text */}
          {phase === 'booting' && (
            <div className="font-mono text-terminal text-sm animate-pulse">
              {BOOT_MESSAGES[bootTextIndex]}
            </div>
          )}
        </div>
      )}

      {/* Scanline effect during boot */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
          opacity: brightness * 0.5,
        }}
      />
    </div>
  )
}

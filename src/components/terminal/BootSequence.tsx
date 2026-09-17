'use client'

import React, { useState, useEffect } from 'react'
import type { BootSequenceProps, BootPhase } from '../../types/terminal3d'

/** Boot sequence timing configuration */
const BOOT_TIMING = {
  warmUp: 700,      // CRT warm-up before the POST text starts
  lineDelay: 320,   // Delay between POST lines
  hold: 450,        // Pause on the final line before the overlay lifts
}

/** POST lines, printed one after another */
const BOOT_MESSAGES = [
  'TOMASP RETRO SYSTEMS  BIOS v2.6',
  'MEMORY TEST ........ 640K OK',
  'PHOSPHOR WARM-UP .... OK',
  'MOUNTING /home/user . OK',
  'LOADING SHELL ....... OK',
  'READY.',
]

const BOOT_TOTAL = BOOT_TIMING.warmUp + BOOT_MESSAGES.length * BOOT_TIMING.lineDelay + BOOT_TIMING.hold

/**
 * CRT power-on boot sequence animation
 * Displays warm-up effect and POST text before the terminal appears
 */
export default function BootSequence({ onComplete, onStart, skip = false }: BootSequenceProps) {
  const [phase, setPhase] = useState<BootPhase>(skip ? 'ready' : 'off')
  const [brightness, setBrightness] = useState(skip ? 1 : 0)
  const [visibleLines, setVisibleLines] = useState(0)

  // Handle skip mode
  useEffect(() => {
    if (skip) onComplete()
  }, [skip, onComplete])

  // Boot sequence progression
  useEffect(() => {
    if (skip) return

    const warmUpTimer = setTimeout(() => {
      setPhase('warming')
      onStart?.()
    }, 100)

    const bootingTimer = setTimeout(() => {
      setPhase('booting')
    }, BOOT_TIMING.warmUp)

    const completeTimer = setTimeout(() => {
      setPhase('ready')
      onComplete()
    }, BOOT_TOTAL)

    return () => {
      clearTimeout(warmUpTimer)
      clearTimeout(bootingTimer)
      clearTimeout(completeTimer)
    }
  }, [skip, onComplete, onStart])

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

  // POST lines appear one by one
  useEffect(() => {
    if (phase !== 'booting') return

    const interval = setInterval(() => {
      setVisibleLines((prev) => Math.min(prev + 1, BOOT_MESSAGES.length))
    }, BOOT_TIMING.lineDelay)

    return () => clearInterval(interval)
  }, [phase])

  // Don't render overlay when ready
  if (skip || phase === 'ready') return null

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-300"
      style={{ opacity: 1 - brightness * 0.55 }}
    >
      {/* CRT warm-up glow */}
      {(phase === 'warming' || phase === 'booting') && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse at center, rgba(34, 197, 94, ${brightness * 0.15}) 0%, transparent 70%)`,
          }}
        >
          {/* POST text */}
          {phase === 'booting' && (
            <div className="font-mono text-terminal text-sm sm:text-base space-y-1 whitespace-pre">
              {BOOT_MESSAGES.slice(0, visibleLines).map((line) => (
                <div key={line}>{line}</div>
              ))}
              <div>
                <span className="animate-cursor">_</span>
              </div>
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

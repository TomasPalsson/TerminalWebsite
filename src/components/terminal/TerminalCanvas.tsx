import React, { useState, useCallback, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { Monitor, Zap, ZapOff, ExternalLink } from 'lucide-react'
import TerminalHandler from '../TerminalHandler'
import { KeyPressProvider } from '../../context/KeypressedContext'
import useKeyClick from '../../hooks/useKeyClick'
import { usePerformanceMode } from '../../hooks/usePerformanceMode'
import TerminalScene from './TerminalScene'
import BootSequence from './BootSequence'

/**
 * Main 3D Terminal Canvas component
 * Orchestrates the retro computing experience with header, status bar, and scene
 */
export default function TerminalCanvas() {
  const playClick = useKeyClick()
  const { performanceMode, togglePerformanceMode } = usePerformanceMode()
  const [buffer, setBuffer] = useState<string[]>([])
  const [bootComplete, setBootComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleBootComplete = useCallback(() => {
    setBootComplete(true)
    // Also dismiss loading when boot completes
    setIsLoading(false)
  }, [])

  // Dismiss loading after a short delay (assets typically load quickly)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Mobile fallback with link to 2D terminal
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-40px)] bg-black text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/95 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-terminal/10 border border-terminal/30">
              <Monitor size={16} className="text-terminal" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-white">3d terminal</span>
                <span className="font-mono text-xs text-gray-600">—</span>
                <span className="font-mono text-xs text-gray-500">retro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile message */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
            <Monitor size={32} className="text-terminal" />
          </div>
          <h2 className="font-mono text-lg text-white mb-2">Best on Desktop</h2>
          <p className="font-mono text-sm text-gray-500 mb-6 max-w-sm">
            The 3D terminal experience is optimized for desktop browsers with WebGL support.
          </p>
          <a
            href="/terminal"
            className="flex items-center gap-2 px-4 py-2.5 font-mono text-sm rounded-lg bg-terminal text-black hover:bg-terminal/90 transition"
          >
            <ExternalLink size={16} />
            Open 2D Terminal
          </a>
        </div>
      </div>
    )
  }

  return (
    <KeyPressProvider onKeyPress={playClick} headless>
      <div className="flex flex-col h-[calc(100vh-40px)] bg-black text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/95 border-b border-neutral-800 z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-terminal/10 border border-terminal/30">
              <Monitor size={16} className="text-terminal" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-white">3d terminal</span>
                <span className="font-mono text-xs text-gray-600">—</span>
                <span className="font-mono text-xs text-gray-500">retro</span>
              </div>
              <p className="font-mono text-[10px] text-gray-600 mt-0.5">
                Immersive retro computing experience
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/terminal"
              className="flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] rounded border border-neutral-800 text-gray-500 hover:text-terminal hover:border-terminal/50 transition"
            >
              2D Mode
            </a>
            <span className="px-2 py-0.5 font-mono text-[10px] rounded bg-terminal/10 text-terminal border border-terminal/20">
              three.js
            </span>
          </div>
        </div>

        {/* Main 3D Scene */}
        <div className="flex-1 relative">
          {/* Headless terminal for buffer */}
          <TerminalHandler headless onBufferChange={setBuffer} />

          {/* Boot sequence overlay */}
          <BootSequence
            onComplete={handleBootComplete}
            skip={performanceMode}
          />

          {/* Loading indicator */}
          {isLoading && !performanceMode && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terminal/10 border border-terminal/30 flex items-center justify-center animate-pulse">
                  <Monitor size={20} className="text-terminal" />
                </div>
                <span className="font-mono text-xs text-gray-500">Loading 3D scene...</span>
              </div>
            </div>
          )}

          {/* 3D Scene */}
          <TerminalScene
            buffer={buffer}
            enableEffects={!performanceMode && bootComplete}
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/95 border-t border-neutral-800 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
              <span className="font-mono text-[10px] text-terminal uppercase tracking-wider">
                3D Mode
              </span>
            </div>
            <span className="font-mono text-[10px] text-gray-600">
              drag to orbit • scroll to zoom • double-click to reset
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePerformanceMode}
              className={`flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] rounded border transition ${
                performanceMode
                  ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                  : 'border-neutral-700 text-gray-500 hover:text-terminal hover:border-terminal/50'
              }`}
              title={performanceMode ? 'Effects disabled' : 'Effects enabled'}
            >
              {performanceMode ? (
                <>
                  <ZapOff size={12} />
                  Performance Mode
                </>
              ) : (
                <>
                  <Zap size={12} />
                  Effects On
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </KeyPressProvider>
  )
}

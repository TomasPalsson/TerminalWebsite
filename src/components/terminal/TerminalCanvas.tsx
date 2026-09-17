'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import { useProgress } from '@react-three/drei'
import { Monitor, Zap, ZapOff, Volume2, VolumeX, Lightbulb, LightbulbOff, RotateCcw, ExternalLink, Power, Footprints, PartyPopper } from 'lucide-react'
import TerminalHandler from '../TerminalHandler'
import { KeyPressProvider } from '../../context/KeypressedContext'
import useKeyClick from '../../hooks/useKeyClick'
import { playPowerOn } from '../../utils/audio'
import TerminalScene from './TerminalScene'
import BootSequence from './BootSequence'
import { CAMERA_PRESET_NAMES, sceneStore, useSceneStore } from './sceneStore'
import { ExhibitCard, WalkHud, DiscoveryCounter } from './ExhibitOverlay'

const toggleButton = (active: boolean) =>
  `flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] rounded border transition ${
    active
      ? 'border-terminal/50 text-terminal bg-terminal/10'
      : 'border-neutral-700 text-gray-500 hover:text-terminal hover:border-terminal/50'
  }`

/** Header shared by the desktop scene and the mobile fallback */
function Header({ children }: { children?: React.ReactNode }) {
  return (
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
            walk around with <span className="text-terminal">Explore</span> · type <span className="text-terminal">scene help</span> for everything else
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

/**
 * Main 3D Terminal Canvas component
 * Orchestrates the retro computing experience with header, status bar, and scene
 */
export default function TerminalCanvas() {
  const effects = useSceneStore((s) => s.effects)
  const sound = useSceneStore((s) => s.sound)
  const lampOn = useSceneStore((s) => s.lampOn)
  const power = useSceneStore((s) => s.power)
  const cameraPreset = useSceneStore((s) => s.cameraPreset)
  const walk = useSceneStore((s) => s.walk)
  const party = useSceneStore((s) => s.party)
  const fps = useSceneStore((s) => s.fps)
  const playClick = useKeyClick(sound)
  const { progress } = useProgress()
  const [buffer, setBuffer] = useState<string[]>([])
  const [bootComplete, setBootComplete] = useState(false)
  const [loaderTimedOut, setLoaderTimedOut] = useState(false)

  // The loader tracks real asset progress; the timeout is a safety net if the loading manager never reports
  useEffect(() => {
    const timer = setTimeout(() => setLoaderTimedOut(true), 8000)
    return () => clearTimeout(timer)
  }, [])

  const handleBootComplete = useCallback(() => setBootComplete(true), [])
  const handleBootStart = useCallback(() => {
    if (sceneStore.getState().sound) playPowerOn()
  }, [])

  const togglePower = () => {
    const next = !sceneStore.getState().power
    sceneStore.setState({ power: next })
    if (next && sceneStore.getState().sound) playPowerOn()
  }

  const modelLoading = progress < 100 && !loaderTimedOut

  // Mobile fallback with link to 2D terminal
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-40px)] bg-black text-white">
        <Header />
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
        <Header>
          <button onClick={() => sceneStore.toggle('walk')} className={toggleButton(walk)} title="Walk around the room (WASD + mouse, Esc to leave)">
            <Footprints size={12} />
            {walk ? 'Exploring' : 'Explore'}
          </button>
          <button onClick={() => sceneStore.toggle('party')} className={toggleButton(party)} title="Party mode">
            <PartyPopper size={12} />
            Party
          </button>
          <button onClick={() => sceneStore.toggle('sound')} className={toggleButton(sound)} title={sound ? 'Mute key clicks' : 'Unmute key clicks'}>
            {sound ? <Volume2 size={12} /> : <VolumeX size={12} />}
            Sound
          </button>
          <button onClick={() => sceneStore.toggle('lampOn')} className={toggleButton(lampOn)} title="Toggle the desk lamp">
            {lampOn ? <Lightbulb size={12} /> : <LightbulbOff size={12} />}
            Lamp
          </button>
          <button onClick={togglePower} className={toggleButton(power)} title={power ? 'Switch the monitor off' : 'Switch the monitor on'}>
            <Power size={12} />
            Power
          </button>
          <button onClick={() => sceneStore.toggle('effects')} className={toggleButton(effects)} title={effects ? 'Disable CRT effects (faster)' : 'Enable CRT effects'}>
            {effects ? <Zap size={12} /> : <ZapOff size={12} />}
            {effects ? 'Effects' : 'Performance'}
          </button>
          <a
            href="/terminal"
            className="flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] rounded border border-neutral-800 text-gray-500 hover:text-terminal hover:border-terminal/50 transition"
          >
            2D Mode
          </a>
        </Header>

        {/* Main 3D Scene */}
        <div className="flex-1 relative">
          {/* Headless terminal for buffer */}
          <TerminalHandler headless onBufferChange={setBuffer} />

          {/* Boot sequence overlay */}
          <BootSequence onComplete={handleBootComplete} onStart={handleBootStart} skip={!effects} />

          {/* Loading indicator until the model is in */}
          {modelLoading && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terminal/10 border border-terminal/30 flex items-center justify-center animate-pulse">
                  <Monitor size={20} className="text-terminal" />
                </div>
                <span className="font-mono text-xs text-gray-500">Loading 3D scene… {Math.round(progress)}%</span>
              </div>
            </div>
          )}

          {/* 3D Scene */}
          <TerminalScene buffer={buffer} enableEffects={effects && bootComplete} />

          {/* Room overlays */}
          <WalkHud />
          <ExhibitCard />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/95 border-t border-neutral-800 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
              <span className="font-mono text-[10px] text-terminal uppercase tracking-wider">3D Mode</span>
            </div>
            <span className="hidden lg:inline font-mono text-[10px] text-gray-600">
              {walk ? 'WASD to walk • mouse to look • E to inspect • Esc to leave' : 'drag to orbit • scroll to zoom • click things to inspect them'}
            </span>
            <DiscoveryCounter />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-gray-600 mr-1">view</span>
            {CAMERA_PRESET_NAMES.map((preset) => (
              <button
                key={preset}
                onClick={() => sceneStore.setCamera(preset)}
                className={`px-2 py-0.5 font-mono text-[10px] rounded-full border transition ${
                  cameraPreset === preset
                    ? 'border-terminal/50 text-terminal bg-terminal/10'
                    : 'border-neutral-800 text-gray-500 hover:text-terminal hover:border-terminal/50'
                }`}
              >
                {preset}
              </button>
            ))}
            <button
              onClick={() => sceneStore.setCamera('default')}
              className="ml-1 flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] rounded-full border border-neutral-800 text-gray-500 hover:text-terminal hover:border-terminal/50 transition"
              title="Reset the camera"
            >
              <RotateCcw size={10} />
            </button>
            {fps > 0 && (
              <span className="ml-2 font-mono text-[10px] text-gray-600 tabular-nums">{fps} fps</span>
            )}
          </div>
        </div>
      </div>
    </KeyPressProvider>
  )
}

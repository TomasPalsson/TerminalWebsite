'use client'

import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { Suspense, useCallback, useMemo, useEffect, useRef, useSyncExternalStore } from 'react'
import * as THREE from 'three'
import { EffectComposer } from '@react-three/postprocessing'
import CRTEffects from './CRTEffects'
import AmbientEffects from './AmbientEffects'
import { Room, DeskProps } from './DeskProps'
import { sceneStore, useSceneStore, type Screensaver } from './sceneStore'
import {
  SCREEN,
  drawScreen,
  phosphorColor,
  createMatrixState,
  drawMatrixFrame,
  createDvdState,
  drawDvdFrame,
  type DrawScreenOptions,
  type MatrixState,
  type DvdState,
} from './screenTexture'
import { buildExhibits, ROOM, type Exhibit } from './exhibits'
import { CertExhibit, PaintedExhibit, ShelfExhibit, SignExhibit } from './RoomExhibits'
import { Duck } from './RoomCritters'
import { AuroraWindow, LavaLamp, Plant, WallClock } from './RoomGadgets'
import { Confetti, Disco, FloatGroup, RoomLights, XRay } from './RoomEffects'
import WalkControls from './WalkControls'
import { useProfile } from '../../hooks/useProfile'
import { reactions } from './reactions'
import { DEFAULT_CAMERA_CONFIG } from '../../types/terminal3d'
import type { TerminalSceneProps, CameraConfig } from '../../types/terminal3d'

const MODEL_URL = '/scene.gltf'
useGLTF.preload(MODEL_URL)

const subscribeNoop = () => () => {}

/** Reads the terminal accent from CSS on the client */
const readTerminalColor = () =>
  phosphorColor(getComputedStyle(document.documentElement).getPropertyValue('--terminal').trim() || '#22c55e')

/** The `color` command writes `--terminal` onto <html style>; watch that attribute */
const subscribeTerminalColor = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
  return () => observer.disconnect()
}

/** Loads JetBrains Mono for the canvas and resolves once it is usable (or immediately if unsupported) */
const whenScreenFontReady = (): Promise<unknown> => {
  if (typeof document === 'undefined' || !('fonts' in document)) return Promise.resolve()
  return document.fonts.load(`${SCREEN.fontSize}px "JetBrains Mono"`).catch(() => undefined)
}

/** Owns the offscreen canvas and the three texture drawn from it */
class ScreenSurface {
  readonly texture: THREE.CanvasTexture
  private readonly ctx: CanvasRenderingContext2D | null

  constructor() {
    // Guard for SSR - a 1x1 placeholder that is never painted
    if (typeof document === 'undefined') {
      this.ctx = null
      this.texture = new THREE.CanvasTexture(new ImageData(1, 1))
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = SCREEN.width
    canvas.height = SCREEN.height
    this.ctx = canvas.getContext('2d')
    this.texture = new THREE.CanvasTexture(canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.anisotropy = 4
  }

  paint(options: Omit<DrawScreenOptions, 'ctx'>) {
    if (!this.ctx) return
    drawScreen({ ctx: this.ctx, ...options })
    this.texture.needsUpdate = true
  }

  /** Advances the active screensaver by one frame */
  paintSaver(saver: Screensaver, color: string) {
    if (!this.ctx) return
    if (saver === 'matrix') {
      this.matrix ??= createMatrixState()
      drawMatrixFrame(this.ctx, this.matrix, color)
    } else if (saver === 'dvd') {
      this.dvd ??= createDvdState()
      drawDvdFrame(this.ctx, this.dvd)
    }
    this.texture.needsUpdate = true
  }

  /** Forgets saver state so the next activation starts fresh */
  resetSavers() {
    this.matrix = null
    this.dvd = null
  }

  private matrix: MatrixState | null = null
  private dvd: DvdState | null = null
}

/**
 * Hook that returns a CanvasTexture driven by terminal lines
 */
export function useTerminalTexture(lines: string[], power: boolean, screensaver: Screensaver = 'off') {
  const color = useSyncExternalStore(subscribeTerminalColor, readTerminalColor, () => '#39ff6e')
  const surface = useMemo(() => new ScreenSurface(), [])
  const saverActive = power && screensaver !== 'off'

  const cursorVisibleRef = useRef(true)
  const linesRef = useRef(lines)
  const fontReadyRef = useRef(false)
  // How many committed lines are on screen; new output is revealed a row at a time like a real teletype
  const revealedRef = useRef(Math.max(0, lines.length - 1))

  const redraw = useCallback(() => {
    if (saverActive) return
    const all = linesRef.current
    const shown = [...all.slice(0, revealedRef.current), ...all.slice(-1)]
    surface.paint({ lines: shown, color, cursorVisible: cursorVisibleRef.current, power })
  }, [surface, color, power, saverActive])

  // Screensaver: ~30 fps animation loop that owns the canvas while active
  useEffect(() => {
    if (!saverActive) {
      surface.resetSavers()
      return
    }
    const timer = setInterval(() => surface.paintSaver(screensaver, color), 33)
    return () => clearInterval(timer)
  }, [saverActive, screensaver, color, surface])

  useEffect(() => {
    linesRef.current = lines
    const committed = Math.max(0, lines.length - 1)
    if (committed < revealedRef.current) revealedRef.current = committed // `clear`
    if (committed === revealedRef.current) {
      redraw()
      return
    }
    // A command just produced output: pulse the glow and roll the rows in at ~45 rows/s
    // (time-based so a slow frame rate catches up instead of crawling)
    reactions.screen += 1
    const from = revealedRef.current
    const startedAt = performance.now()
    const timer = setInterval(() => {
      revealedRef.current = Math.min(committed, from + Math.floor((performance.now() - startedAt) / 22))
      redraw()
      if (revealedRef.current >= committed) clearInterval(timer)
    }, 22)
    return () => clearInterval(timer)
  }, [lines, redraw])

  // Repaint once the web font arrives so the first frames are not in the fallback face
  useEffect(() => {
    if (fontReadyRef.current) return
    let cancelled = false
    whenScreenFontReady().then(() => {
      if (cancelled) return
      fontReadyRef.current = true
      redraw()
    })
    return () => {
      cancelled = true
    }
  }, [redraw])

  useEffect(() => {
    if (!power || saverActive) return
    const interval = setInterval(() => {
      cursorVisibleRef.current = !cursorVisibleRef.current
      redraw()
    }, 530)
    return () => clearInterval(interval)
  }, [power, saverActive, redraw])

  return surface.texture
}

/** GLTF wrapper for the retro computer model */
function RetroComputer({ screenTexture }: { screenTexture: THREE.Texture }) {
  const { scene } = useGLTF(MODEL_URL)

  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
    const screen = scene.getObjectByName('PC_M_Screen_0') as THREE.Mesh | undefined
    if (screen) {
      screen.material = new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false })
      screen.castShadow = false
    }
  }, [scene, screenTexture])

  return <primitive object={scene} scale={[1.2, 1.2, 1.2]} />
}

const SCREEN_CENTER: [number, number, number] = [0, 0.411, 0.2165]
const SCREEN_SIZE: [number, number] = [0.352, 0.288]

/** Translucent bright band that slowly rolls down the tube, like a CRT filmed on video */
function ScreenRoll({ enabled }: { enabled: boolean }) {
  const material = useRef<THREE.MeshBasicMaterial>(null)
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 4
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.46, 'rgba(255,255,255,0)')
    g.addColorStop(0.5, 'rgba(255,255,255,1)')
    g.addColorStop(0.54, 'rgba(255,255,255,0)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 4, 256)
    const t = new THREE.CanvasTexture(canvas)
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    return t
  }, [])

  useFrame((_, delta) => {
    if (!material.current?.map) return
    material.current.map.offset.y = (material.current.map.offset.y + delta * 0.12) % 1
  })

  if (!enabled) return null
  return (
    <mesh position={SCREEN_CENTER}>
      <planeGeometry args={SCREEN_SIZE} />
      <meshBasicMaterial ref={material} map={texture} transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/** Orbit controls plus smooth fly-to for `scene cam …` / exhibits, double-click reset and optional auto-spin */
function CameraRig({ config }: { config: CameraConfig }) {
  const { camera, gl } = useThree()
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const goal = useSceneStore((s) => s.cameraGoal)
  const nonce = useSceneStore((s) => s.cameraNonce)
  const spin = useSceneStore((s) => s.spin)
  const walk = useSceneStore((s) => s.walk)

  const flight = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null)

  // A new goal, or leaving walk mode, starts a flight
  useEffect(() => {
    if (walk) {
      flight.current = null
      return
    }
    flight.current = { position: new THREE.Vector3(...goal.position), target: new THREE.Vector3(...goal.target) }
  }, [goal, nonce, walk])

  useEffect(() => {
    const el = gl.domElement
    const reset = () => {
      if (!sceneStore.getState().walk) sceneStore.setCamera('default')
    }
    // Dragging takes over from an in-progress flight
    const cancel = () => {
      flight.current = null
    }
    el.addEventListener('dblclick', reset)
    el.addEventListener('pointerdown', cancel)
    el.addEventListener('wheel', cancel, { passive: true })
    return () => {
      el.removeEventListener('dblclick', reset)
      el.removeEventListener('pointerdown', cancel)
      el.removeEventListener('wheel', cancel)
    }
  }, [gl])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    const target = flight.current
    if (!controls || !target || walk) return
    const k = 1 - Math.exp(-delta * 4.5)
    camera.position.lerp(target.position, k)
    controls.target.lerp(target.target, k)
    if (camera.position.distanceTo(target.position) < 0.002 && controls.target.distanceTo(target.target) < 0.002) {
      camera.position.copy(target.position)
      controls.target.copy(target.target)
      flight.current = null
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!walk}
      target={config.target}
      minDistance={config.minDistance}
      maxDistance={config.maxDistance}
      minPolarAngle={config.minPolarAngle}
      maxPolarAngle={config.maxPolarAngle}
      autoRotate={spin && !walk}
      autoRotateSpeed={0.6}
      zoomSpeed={0.35}
      rotateSpeed={0.7}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      makeDefault
    />
  )
}

/** Publishes a smoothed frame rate to the scene store once a second */
function FpsSampler() {
  const frames = useRef(0)
  const elapsed = useRef(0)
  useFrame((_, delta) => {
    frames.current += 1
    elapsed.current += delta
    if (elapsed.current >= 1) {
      sceneStore.setState({ fps: Math.round(frames.current / elapsed.current) })
      frames.current = 0
      elapsed.current = 0
    }
  })
  return null
}

/** Picks the 3D component for an exhibit kind */
function ExhibitMesh({ exhibit }: { exhibit: Exhibit }) {
  switch (exhibit.kind) {
    case 'cert':
      return <CertExhibit exhibit={exhibit} />
    case 'sign':
      return <SignExhibit exhibit={exhibit} />
    case 'shelf':
      return <ShelfExhibit exhibit={exhibit} />
    case 'window':
      return <AuroraWindow exhibit={exhibit} />
    case 'clock':
      return <WallClock exhibit={exhibit} />
    case 'duck':
    case 'lava':
      // Desk residents live inside the FloatGroup so they can drift when gravity is off
      return null
    default:
      return <PaintedExhibit exhibit={exhibit} />
  }
}

/** Loads the profile once and publishes the room layout to the store */
function useRoomExhibits() {
  const { profile } = useProfile()
  const exhibits = useMemo(() => buildExhibits(profile), [profile])
  useEffect(() => {
    sceneStore.setState({ exhibits })
  }, [exhibits])
  return exhibits
}

/** Scene content rendered inside Canvas */
function SceneContent({
  screenTexture,
  enableEffects,
  cameraConfig,
}: {
  screenTexture: THREE.Texture
  enableEffects: boolean
  cameraConfig: CameraConfig
}) {
  const power = useSceneStore((s) => s.power)
  const lampOn = useSceneStore((s) => s.lampOn)
  const props = useSceneStore((s) => s.props)
  const roomLights = useSceneStore((s) => s.roomLights)
  const party = useSceneStore((s) => s.party)
  const xray = useSceneStore((s) => s.xray)
  const exhibits = useRoomExhibits()
  const byId = (id: string) => exhibits.find((e) => e.id === id)
  const duck = byId('duck')
  const lava = byId('lava')

  return (
    <>
      <ambientLight intensity={0.25} color="#8fb3a0" />
      <hemisphereLight intensity={0.25} color="#1b2a22" groundColor="#050505" />
      <XRay enabled={xray}>
        <Room />
        <RetroComputer screenTexture={screenTexture} />
        <ScreenRoll enabled={power && enableEffects} />
        {props && (
          <FloatGroup>
            <DeskProps lampOn={lampOn} />
            {duck && <Duck exhibit={duck} />}
            {lava && <LavaLamp exhibit={lava} />}
          </FloatGroup>
        )}
        <Suspense fallback={null}>
          {exhibits.map((exhibit) => (
            <ExhibitMesh key={exhibit.id} exhibit={exhibit} />
          ))}
        </Suspense>
        <Plant position={[2.7, ROOM.floorY, -0.4]} />
        <RoomLights on={roomLights} />
      </XRay>
      <Disco on={party} />
      <Confetti />
      <CameraRig config={cameraConfig} />
      <WalkControls />
      <AmbientEffects enabled showDust={enableEffects} showGlow={power} />
      <FpsSampler />
      {enableEffects && (
        <EffectComposer>
          <CRTEffects enabled={enableEffects} />
        </EffectComposer>
      )}
    </>
  )
}

/** Keeps a lost WebGL context from tearing the page down; three restores it on `webglcontextrestored` */
const handleCreated = ({ gl }: { gl: THREE.WebGLRenderer }) => {
  gl.domElement.addEventListener('webglcontextlost', (event) => event.preventDefault())
}

/**
 * Main 3D scene component with terminal rendering
 */
export default function TerminalScene({ buffer, enableEffects, cameraConfig: customConfig }: TerminalSceneProps) {
  // Wait for client-side mount before rendering Canvas
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false)
  const power = useSceneStore((s) => s.power)
  const screensaver = useSceneStore((s) => s.screensaver)
  const screenTexture = useTerminalTexture(buffer, power, screensaver)
  const cameraConfig = { ...DEFAULT_CAMERA_CONFIG, ...customConfig }

  if (!mounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <span className="font-mono text-terminal animate-pulse">Initializing WebGL...</span>
      </div>
    )
  }

  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: cameraConfig.defaultPosition, fov: 42, near: 0.05, far: 40 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      shadows
      onCreated={handleCreated}
    >
      <color attach="background" args={['#030405']} />
      <fog attach="fog" args={['#030405', 6, 12]} />
      <SceneContent screenTexture={screenTexture} enableEffects={enableEffects} cameraConfig={cameraConfig} />
    </Canvas>
  )
}

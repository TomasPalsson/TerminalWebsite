'use client'

import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { useCallback, useMemo, useEffect, useRef, useSyncExternalStore } from 'react'
import * as THREE from 'three'
import { EffectComposer } from '@react-three/postprocessing'
import CRTEffects from './CRTEffects'
import AmbientEffects from './AmbientEffects'
import { Room, DeskProps } from './DeskProps'
import { CAMERA_PRESETS, sceneStore, useSceneStore } from './sceneStore'
import { SCREEN, drawScreen, phosphorColor, type DrawScreenOptions } from './screenTexture'
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
}

/**
 * Hook that returns a CanvasTexture driven by terminal lines
 */
export function useTerminalTexture(lines: string[], power: boolean) {
  const color = useSyncExternalStore(subscribeTerminalColor, readTerminalColor, () => '#39ff6e')
  const surface = useMemo(() => new ScreenSurface(), [])

  const cursorVisibleRef = useRef(true)
  const linesRef = useRef(lines)
  const fontReadyRef = useRef(false)

  const redraw = useCallback(() => {
    surface.paint({ lines: linesRef.current, color, cursorVisible: cursorVisibleRef.current, power })
  }, [surface, color, power])

  useEffect(() => {
    linesRef.current = lines
    redraw()
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
    if (!power) return
    const interval = setInterval(() => {
      cursorVisibleRef.current = !cursorVisibleRef.current
      redraw()
    }, 530)
    return () => clearInterval(interval)
  }, [power, redraw])

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

/** Orbit controls plus smooth fly-to for `scene cam …`, double-click reset and optional auto-spin */
function CameraRig({ config }: { config: CameraConfig }) {
  const { camera, gl } = useThree()
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const preset = useSceneStore((s) => s.cameraPreset)
  const nonce = useSceneStore((s) => s.cameraNonce)
  const spin = useSceneStore((s) => s.spin)

  const flight = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null)

  useEffect(() => {
    const { position, target } = CAMERA_PRESETS[preset]
    flight.current = { position: new THREE.Vector3(...position), target: new THREE.Vector3(...target) }
  }, [preset, nonce])

  useEffect(() => {
    const el = gl.domElement
    const reset = () => sceneStore.setCamera('default')
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
    const goal = flight.current
    if (!controls || !goal) return
    const k = 1 - Math.exp(-delta * 4.5)
    camera.position.lerp(goal.position, k)
    controls.target.lerp(goal.target, k)
    if (camera.position.distanceTo(goal.position) < 0.002 && controls.target.distanceTo(goal.target) < 0.002) {
      camera.position.copy(goal.position)
      controls.target.copy(goal.target)
      flight.current = null
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      target={config.target}
      minDistance={config.minDistance}
      maxDistance={config.maxDistance}
      minPolarAngle={config.minPolarAngle}
      maxPolarAngle={config.maxPolarAngle}
      minAzimuthAngle={spin ? -Infinity : config.minAzimuthAngle}
      maxAzimuthAngle={spin ? Infinity : config.maxAzimuthAngle}
      autoRotate={spin}
      autoRotateSpeed={0.6}
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

  return (
    <>
      <ambientLight intensity={0.25} color="#8fb3a0" />
      <hemisphereLight intensity={0.25} color="#1b2a22" groundColor="#050505" />
      <Room />
      <RetroComputer screenTexture={screenTexture} />
      {props && <DeskProps lampOn={lampOn} />}
      <CameraRig config={cameraConfig} />
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
  const screenTexture = useTerminalTexture(buffer, power)
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
      <fog attach="fog" args={['#030405', 3.5, 7]} />
      <SceneContent screenTexture={screenTexture} enableEffects={enableEffects} cameraConfig={cameraConfig} />
    </Canvas>
  )
}

'use client'

import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from '@react-three/postprocessing'
import CRTEffects from './CRTEffects'
import AmbientEffects from './AmbientEffects'
import { DEFAULT_CAMERA_CONFIG } from '../../types/terminal3d'
import type { TerminalSceneProps, CameraConfig } from '../../types/terminal3d'

/**
 * Hook that returns a CanvasTexture driven by terminal lines
 */
export function useTerminalTexture(lines: string[]) {
  const [color, setColor] = useState('#0f0')

  const { canvas, ctx, texture } = useMemo(() => {
    // Guard for SSR - return dummy values that will be replaced on client
    if (typeof document === 'undefined') {
      return { canvas: null as HTMLCanvasElement | null, ctx: null as CanvasRenderingContext2D | null, texture: new THREE.CanvasTexture(new ImageData(1, 1)) }
    }
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 768
    const ctx = canvas.getContext('2d')!
    const texture = new THREE.CanvasTexture(canvas)
    texture.flipY = true
    texture.wrapS = THREE.RepeatWrapping
    texture.center.set(0.5, 0.5)
    return { canvas, ctx, texture }
  }, [])

  const visibleHeight = 768
  const margin = 20
  const lineHeight = 42
  const maxWidth = canvas ? canvas.width - margin * 2 : 1024 - margin * 2

  const cursorPosRef = useRef<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: true })
  const cursorVisibleRef = useRef(true)
  const linesRef = useRef<string[]>([])

  // Get terminal color on client side
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const c = getComputedStyle(document.documentElement).getPropertyValue('--terminal').trim() || '#0f0'
      setColor(c === '#22c55e' ? '#0f0' : c)
    }
  }, [])

  useEffect(() => {
    if (!canvas || !ctx) return
    linesRef.current = lines

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = color
    ctx.font = '20px monospace'
    ctx.textBaseline = 'top'

    let tempY = margin
    lines.forEach((ln) => {
      const words = ln.split(' ')
      let line = ''
      words.forEach((word, idx) => {
        const test = line + (idx ? ' ' : '') + word
        if (ctx.measureText(test).width > maxWidth) {
          tempY += lineHeight
          line = word
        } else {
          line = test
        }
      })
      tempY += lineHeight
    })
    const totalHeight = tempY

    let y = margin
    if (totalHeight > visibleHeight) {
      y = margin - (totalHeight - visibleHeight)
    }

    lines.forEach((ln) => {
      const words = ln.split(' ')
      let line = ''
      words.forEach((word, idx) => {
        const test = line + (idx ? ' ' : '') + word
        if (ctx.measureText(test).width > maxWidth) {
          if (y >= margin && y <= visibleHeight) {
            ctx.fillText(line, margin, y)
          }
          y += lineHeight
          line = word
        } else {
          line = test
        }
      })
      if (y >= margin && y <= visibleHeight) {
        ctx.fillText(line, margin, y)
      }
      y += lineHeight
    })

    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1]
      cursorPosRef.current = {
        x: margin + ctx.measureText(lastLine).width,
        y: y - lineHeight,
        visible: cursorVisibleRef.current,
      }
      if (cursorVisibleRef.current && cursorPosRef.current.y >= margin && cursorPosRef.current.y <= visibleHeight) {
        ctx.fillText('_', cursorPosRef.current.x, cursorPosRef.current.y)
      }
    }

    texture.needsUpdate = true
  }, [lines, color, canvas, ctx, texture, maxWidth])

  useEffect(() => {
    if (!canvas || !ctx) return

    const cursorWidth = 15
    const cursorHeight = lineHeight

    const interval = setInterval(() => {
      cursorVisibleRef.current = !cursorVisibleRef.current
      const pos = cursorPosRef.current

      if (linesRef.current.length === 0 || pos.y < margin || pos.y > visibleHeight) return

      ctx.fillStyle = '#000'
      ctx.fillRect(pos.x, pos.y, cursorWidth, cursorHeight)

      if (cursorVisibleRef.current) {
        ctx.fillStyle = color
        ctx.font = '20px monospace'
        ctx.textBaseline = 'top'
        ctx.fillText('_', pos.x, pos.y)
      }

      texture.needsUpdate = true
    }, 500)

    return () => clearInterval(interval)
  }, [color, canvas, ctx, texture])

  return texture
}

/** GLTF wrapper for the retro computer model */
function RetroComputer({ screenTexture }: { screenTexture: THREE.Texture }) {
  const { scene } = useGLTF('/scene.gltf')

  useEffect(() => {
    const screen = scene.getObjectByName('PC_M_Screen_0') as THREE.Mesh
    if (screen) {
      screen.material = new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false })
    }
  }, [scene, screenTexture])

  return <primitive object={scene} scale={[1.2, 1.2, 1.2]} />
}

/** Camera controls with configurable boundaries */
function CameraController({
  config,
  onDoubleClick,
}: {
  config: CameraConfig
  onDoubleClick?: () => void
}) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  const handleDoubleClick = useCallback(() => {
    if (controlsRef.current) {
      camera.position.set(...config.defaultPosition)
      controlsRef.current.target.set(...config.target)
      controlsRef.current.update()
    }
    onDoubleClick?.()
  }, [camera, config, onDoubleClick])

  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('dblclick', handleDoubleClick)
      return () => canvas.removeEventListener('dblclick', handleDoubleClick)
    }
  }, [handleDoubleClick])

  return (
    <OrbitControls
      ref={controlsRef}
      target={config.target}
      minDistance={config.minDistance}
      maxDistance={config.maxDistance}
      minPolarAngle={config.minPolarAngle}
      maxPolarAngle={config.maxPolarAngle}
      minAzimuthAngle={config.minAzimuthAngle}
      maxAzimuthAngle={config.maxAzimuthAngle}
      enableDamping
      dampingFactor={0.05}
    />
  )
}

/** Scene content rendered inside Canvas */
function SceneContent({
  screenTexture,
  enableEffects,
  cameraConfig,
  onDoubleClick,
}: {
  screenTexture: THREE.Texture
  enableEffects: boolean
  cameraConfig: CameraConfig
  onDoubleClick?: () => void
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0.721, 0.9]} intensity={0.8} color="#22c55e" />
      <RetroComputer screenTexture={screenTexture} />
      <CameraController config={cameraConfig} onDoubleClick={onDoubleClick} />
      <AmbientEffects enabled={enableEffects} />
      {enableEffects && (
        <EffectComposer>
          <CRTEffects enabled={enableEffects} />
        </EffectComposer>
      )}
    </>
  )
}

/**
 * Main 3D scene component with terminal rendering
 */
export default function TerminalScene({
  buffer,
  enableEffects,
  cameraConfig: customConfig,
  onDoubleClick,
}: TerminalSceneProps) {
  const [mounted, setMounted] = useState(false)
  const screenTexture = useTerminalTexture(buffer)
  const cameraConfig = { ...DEFAULT_CAMERA_CONFIG, ...customConfig }

  // Wait for client-side mount before rendering Canvas
  useEffect(() => {
    setMounted(true)
  }, [])

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
      camera={{ position: cameraConfig.defaultPosition }}
      gl={{ antialias: true, alpha: false }}
    >
      <SceneContent
        screenTexture={screenTexture}
        enableEffects={enableEffects}
        cameraConfig={cameraConfig}
        onDoubleClick={onDoubleClick}
      />
    </Canvas>
  )
}

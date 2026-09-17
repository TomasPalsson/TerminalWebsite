'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ROOM } from './exhibits'
import { useSceneStore } from './sceneStore'
import { startParty, stopParty } from '../../utils/audio'

/** Pendant lamp in the middle of the ceiling; on while walking so the walls are visible */
export function RoomLights({ on }: { on: boolean }) {
  const y = ROOM.ceilingY - 0.02
  return (
    <group position={[0, y, 1.6]}>
      <mesh position={[0, -0.12, 0]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.24, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, -0.28, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.22, 0.14, 24, 1, true]} />
        <meshStandardMaterial color="#1c1917" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={on ? '#fff7e0' : '#3a3630'} emissive="#ffe9b0" emissiveIntensity={on ? 2 : 0} />
      </mesh>
      {on && <pointLight position={[0, -0.36, 0]} color="#ffe6bf" intensity={18} distance={10} decay={1.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />}
    </group>
  )
}

const DISCO_COLORS = ['#ff2d95', '#22c55e', '#38bdf8', '#facc15', '#a855f7']

/** Mirror ball plus three colour-cycling spots sweeping the room; also drives the chiptune */
export function Disco({ on }: { on: boolean }) {
  const ball = useRef<THREE.Mesh>(null)
  const lights = useRef<(THREE.PointLight | null)[]>([])
  const soundOn = useSceneStore((s) => s.sound)

  useEffect(() => {
    if (on && soundOn) startParty()
    else stopParty()
    return () => stopParty()
  }, [on, soundOn])

  useFrame(({ clock }) => {
    if (!on) return
    const t = clock.getElapsedTime()
    if (ball.current) ball.current.rotation.y = t * 0.8
    lights.current.forEach((light, i) => {
      if (!light) return
      const a = t * (0.9 + i * 0.25) + (i * Math.PI * 2) / 3
      light.position.set(Math.cos(a) * 1.8, 0.6 + Math.sin(t * 2 + i) * 0.5, 1.6 + Math.sin(a) * 1.6)
      light.color.set(DISCO_COLORS[(Math.floor(t * 2) + i) % DISCO_COLORS.length])
    })
  })

  if (!on) return null
  return (
    <group>
      <mesh ref={ball} position={[0, ROOM.ceilingY - 0.35, 2.2]} castShadow>
        <sphereGeometry args={[0.16, 24, 16]} />
        <meshStandardMaterial color="#d4d4d8" metalness={1} roughness={0.15} flatShading emissive="#ffffff" emissiveIntensity={0.15} />
      </mesh>
      {DISCO_COLORS.slice(0, 3).map((color, i) => (
        <pointLight
          key={color}
          ref={(el) => {
            lights.current[i] = el
          }}
          color={color}
          intensity={6}
          distance={6}
          decay={1.8}
        />
      ))}
    </group>
  )
}

/**
 * Wraps desk clutter; when gravity is off every direct child drifts up, bobs and slowly tumbles,
 * and settles back when gravity returns.
 */
export function FloatGroup({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const gravity = useSceneStore((s) => s.gravity)
  const lift = useRef(0)

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    lift.current = THREE.MathUtils.damp(lift.current, gravity ? 0 : 1, 2, delta)
    const t = clock.getElapsedTime()
    group.current.children.forEach((child, i) => {
      const base = (child.userData.baseY ??= child.position.y) as number
      const rise = lift.current * (0.35 + (i % 4) * 0.12)
      child.position.y = base + rise + Math.sin(t * 1.1 + i) * 0.03 * lift.current
      child.rotation.z = Math.sin(t * 0.6 + i * 2) * 0.25 * lift.current
      child.rotation.x = Math.cos(t * 0.5 + i) * 0.2 * lift.current
    })
  })

  return <group ref={group}>{children}</group>
}

const CONFETTI_COUNT = 350
const CONFETTI_LIFE = 3.2

/** Burst of coloured confetti from above the desk whenever `celebrateNonce` changes */
export function Confetti() {
  const nonce = useSceneStore((s) => s.celebrateNonce)
  const points = useRef<THREE.Points>(null)
  const seen = useRef(nonce)
  const age = useRef(CONFETTI_LIFE)
  const velocities = useRef(new Float32Array(CONFETTI_COUNT * 3))

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CONFETTI_COUNT * 3), 3))
    const colors = new Float32Array(CONFETTI_COUNT * 3)
    const palette = DISCO_COLORS.map((c) => new THREE.Color(c))
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const c = palette[i % palette.length]
      colors.set([c.r, c.g, c.b], i * 3)
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  }, [])

  useFrame((_, delta) => {
    if (!points.current) return
    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    if (nonce !== seen.current) {
      seen.current = nonce
      age.current = 0
      for (let i = 0; i < CONFETTI_COUNT; i++) {
        arr.set([0, 1.3, 1.2], i * 3)
        velocities.current.set([(Math.random() - 0.5) * 3, Math.random() * 2.5 + 0.5, (Math.random() - 0.5) * 3], i * 3)
      }
    }
    if (age.current >= CONFETTI_LIFE) {
      points.current.visible = false
      return
    }
    points.current.visible = true
    age.current += delta
    const v = velocities.current
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      v[i * 3 + 1] -= 3.5 * delta
      arr[i * 3] += v[i * 3] * delta
      arr[i * 3 + 1] += v[i * 3 + 1] * delta
      arr[i * 3 + 2] += v[i * 3 + 2] * delta
      if (arr[i * 3 + 1] < ROOM.floorY) arr[i * 3 + 1] = ROOM.floorY
    }
    attr.needsUpdate = true
    const material = points.current.material as THREE.PointsMaterial
    material.opacity = 1 - age.current / CONFETTI_LIFE
  })

  return (
    <points ref={points} geometry={geometry} visible={false}>
      <pointsMaterial size={0.03} vertexColors transparent opacity={1} sizeAttenuation depthWrite={false} />
    </points>
  )
}

const XRAY_COLOR = new THREE.Color('#22c55e')
type XrayMaterial = THREE.MeshStandardMaterial & { userData: { xray?: { emissive: number; intensity: number } } }

/** Green wireframe view of every lit mesh (the CRT face stays solid so you can still read it) */
export function XRay({ enabled, children }: { enabled: boolean; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  useEffect(() => {
    const root = group.current
    if (!root || !enabled) return
    const touched: XrayMaterial[] = []
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh || mesh.name === 'PC_M_Screen_0') return
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.forEach((m) => {
        const mat = m as XrayMaterial
        if (!('wireframe' in mat) || !mat.emissive) return
        mat.userData.xray = { emissive: mat.emissive.getHex(), intensity: mat.emissiveIntensity }
        mat.wireframe = true
        mat.emissive.copy(XRAY_COLOR)
        mat.emissiveIntensity = 0.9
        touched.push(mat)
      })
    })
    return () =>
      touched.forEach((mat) => {
        const saved = mat.userData.xray
        mat.wireframe = false
        if (saved) {
          mat.emissive.setHex(saved.emissive)
          mat.emissiveIntensity = saved.intensity
        }
        delete mat.userData.xray
      })
  }, [enabled])
  return <group ref={group}>{children}</group>
}

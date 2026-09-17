'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { AmbientEffectsProps } from '../../types/terminal3d'

/**
 * Ambient visual effects for the 3D terminal scene
 * Includes dust particles and screen glow
 */
export default function AmbientEffects({
  enabled,
  showDust = true,
  showGlow = true,
}: AmbientEffectsProps) {
  if (!enabled) return null

  return (
    <>
      {/* Screen glow light */}
      {showGlow && <ScreenGlow />}
      {/* Floating dust particles */}
      {showDust && <DustParticles />}
    </>
  )
}

/** Screen glow emanating from the monitor */
function ScreenGlow() {
  return (
    <>
      {/* Main screen glow */}
      <pointLight
        position={[0, 0.5, 0.3]}
        intensity={0.4}
        color="#22c55e"
        distance={2}
        decay={2}
      />
      {/* Subtle ambient fill */}
      <pointLight
        position={[0, 0.3, 0.5]}
        intensity={0.2}
        color="#0a3d1a"
        distance={3}
        decay={2}
      />
    </>
  )
}

const PARTICLE_SEED = 0x9e3779b9

/** Deterministic PRNG (mulberry32) so particle layout is stable across renders */
function createSeededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Builds particle geometry in a cone shape from the screen, with slow drift velocities */
function createParticles(particleCount: number) {
  const positions = new Float32Array(particleCount * 3)
  const velocities = new Float32Array(particleCount * 3)

  const random = createSeededRandom(PARTICLE_SEED)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (random() - 0.5) * 0.5
    positions[i * 3 + 1] = random() * 0.5 + 0.2
    positions[i * 3 + 2] = random() * 0.4 + 0.3

    velocities[i * 3] = (random() - 0.5) * 0.001
    velocities[i * 3 + 1] = (random() - 0.5) * 0.001
    velocities[i * 3 + 2] = (random() - 0.5) * 0.001
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  return { geometry, velocities }
}

/** Floating dust particles in the screen light */
function DustParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 50

  const { geometry, velocities } = useMemo(() => createParticles(particleCount), [])

  useFrame(() => {
    if (!particlesRef.current) return

    const positionAttr = particlesRef.current.geometry.attributes.position
    const posArray = positionAttr.array as Float32Array

    for (let i = 0; i < particleCount; i++) {
      // Update positions
      posArray[i * 3] += velocities[i * 3]
      posArray[i * 3 + 1] += velocities[i * 3 + 1]
      posArray[i * 3 + 2] += velocities[i * 3 + 2]

      // Wrap around bounds
      if (posArray[i * 3] > 0.3) posArray[i * 3] = -0.3
      if (posArray[i * 3] < -0.3) posArray[i * 3] = 0.3
      if (posArray[i * 3 + 1] > 0.8) posArray[i * 3 + 1] = 0.1
      if (posArray[i * 3 + 1] < 0.1) posArray[i * 3 + 1] = 0.8
      if (posArray[i * 3 + 2] > 0.7) posArray[i * 3 + 2] = 0.2
      if (posArray[i * 3 + 2] < 0.2) posArray[i * 3 + 2] = 0.7
    }

    positionAttr.needsUpdate = true
  })

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.003}
        color="#22c55e"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}

'use client'

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Exhibit } from './exhibits'
import { Interactive } from './RoomExhibits'
import { reactions } from './exhibitActions'

const YELLOW = '#ffd60a'
const ORANGE = '#fb923c'

/** Rubber duck that squashes and hops when activated */
export function Duck({ exhibit }: { exhibit: Exhibit }) {
  const body = useRef<THREE.Group>(null)
  const seen = useRef(reactions.duck)
  const hop = useRef(0)

  useFrame((_, delta) => {
    if (!body.current) return
    if (reactions.duck !== seen.current) {
      seen.current = reactions.duck
      hop.current = 1
    }
    if (hop.current > 0) {
      hop.current = Math.max(0, hop.current - delta * 2.2)
      const t = 1 - hop.current
      const bounce = Math.sin(t * Math.PI) * 0.06
      body.current.position.y = bounce
      body.current.scale.set(1 + Math.sin(t * Math.PI * 2) * 0.15, 1 - Math.sin(t * Math.PI * 2) * 0.15, 1)
    } else {
      body.current.position.y = 0
      body.current.scale.setScalar(1)
    }
  })

  return (
    <Interactive exhibit={exhibit}>
      {(highlighted) => (
        <group ref={body}>
          <mesh position={[0, 0.045, 0]} scale={[1, 0.8, 1.25]} castShadow>
            <sphereGeometry args={[0.05, 20, 16]} />
            <meshStandardMaterial color={YELLOW} roughness={0.45} emissive={YELLOW} emissiveIntensity={highlighted ? 0.35 : 0} />
          </mesh>
          <mesh position={[0, 0.1, 0.035]} castShadow>
            <sphereGeometry args={[0.032, 20, 16]} />
            <meshStandardMaterial color={YELLOW} roughness={0.45} emissive={YELLOW} emissiveIntensity={highlighted ? 0.35 : 0} />
          </mesh>
          <mesh position={[0, 0.095, 0.068]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.013, 0.03, 12]} />
            <meshStandardMaterial color={ORANGE} roughness={0.5} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.016, 0.112, 0.056]}>
              <sphereGeometry args={[0.005, 8, 8]} />
              <meshStandardMaterial color="#111" roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}
    </Interactive>
  )
}

const FUR = '#d98a3d'
const FUR_DARK = '#b86f2a'

/** Head resting on paws: ears, closed eyes, pink nose */
function CatHead({ highlighted }: { highlighted: boolean }) {
  return (
    <group position={[0.11, 0.065, 0.05]}>
      <mesh castShadow>
        <sphereGeometry args={[0.052, 20, 16]} />
        <meshStandardMaterial color={FUR} roughness={0.9} emissive={FUR} emissiveIntensity={highlighted ? 0.3 : 0} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.03, 0.045, -0.01]} rotation={[0, 0, side * -0.4]}>
          <coneGeometry args={[0.014, 0.03, 8]} />
          <meshStandardMaterial color={FUR_DARK} roughness={0.9} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.02, 0.008, 0.047]} rotation={[0, 0, side * 0.3]}>
          <boxGeometry args={[0.016, 0.003, 0.003]} />
          <meshStandardMaterial color="#3b1f0e" />
        </mesh>
      ))}
      <mesh position={[0, -0.01, 0.052]}>
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshStandardMaterial color="#e4a0a0" />
      </mesh>
    </group>
  )
}

/** Low-poly tabby curled up asleep; breathes, and flicks its tail when activated */
export function Cat({ exhibit }: { exhibit: Exhibit }) {
  const bodyRef = useRef<THREE.Mesh>(null)
  const tailRef = useRef<THREE.Mesh>(null)
  const seen = useRef(reactions.cat)
  const flick = useRef(0)

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    if (bodyRef.current) bodyRef.current.scale.set(1, 1 + Math.sin(t * 1.6) * 0.03, 1)
    if (reactions.cat !== seen.current) {
      seen.current = reactions.cat
      flick.current = 1
    }
    if (tailRef.current) {
      flick.current = Math.max(0, flick.current - delta * 1.2)
      tailRef.current.rotation.y = Math.sin(t * 0.7) * 0.05 + Math.sin(flick.current * Math.PI * 4) * 0.5 * flick.current
    }
  })

  return (
    <Interactive exhibit={exhibit}>
      {(highlighted) => (
        <group>
          <mesh ref={bodyRef} position={[0, 0.06, 0]} scale={[1.5, 0.75, 1.1]} castShadow receiveShadow>
            <sphereGeometry args={[0.085, 24, 18]} />
            <meshStandardMaterial color={FUR} roughness={0.9} emissive={FUR} emissiveIntensity={highlighted ? 0.3 : 0} />
          </mesh>
          {/* Stripes */}
          {[-0.05, 0, 0.05].map((x) => (
            <mesh key={x} position={[x, 0.11, 0]} rotation={[0, 0, 0]} scale={[0.25, 0.25, 1]}>
              <sphereGeometry args={[0.06, 12, 10]} />
              <meshStandardMaterial color={FUR_DARK} roughness={0.9} />
            </mesh>
          ))}
          <CatHead highlighted={highlighted} />
          {/* Tail wrapped around */}
          <mesh ref={tailRef} position={[-0.1, 0.035, 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.06, 0.014, 10, 24, Math.PI * 1.2]} />
            <meshStandardMaterial color={FUR_DARK} roughness={0.9} />
          </mesh>
        </group>
      )}
    </Interactive>
  )
}

'use client'

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Exhibit } from './exhibits'
import { Interactive } from './RoomExhibits'
import { reactions } from './reactions'

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

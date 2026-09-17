'use client'

import React, { useMemo } from 'react'
import { Grid } from '@react-three/drei'
import * as THREE from 'three'

/** Top surface of the desk; the computer model's base sits exactly here */
export const DESK_TOP_Y = -0.062
const FLOOR_Y = -0.86

/** Static room: desk, wall and a retro grid floor. Always visible. */
export function Room() {
  return (
    <group>
      {/* Desk slab + legs */}
      <mesh position={[0, DESK_TOP_Y - 0.025, 0.15]} receiveShadow castShadow>
        <boxGeometry args={[2.6, 0.05, 1.7]} />
        <meshStandardMaterial color="#3a2a1e" roughness={0.85} metalness={0.05} />
      </mesh>
      {([-1.2, 1.2] as const).map((x) =>
        ([-0.6, 0.9] as const).map((z) => (
          <mesh key={`${x}${z}`} position={[x, (DESK_TOP_Y - 0.05 + FLOOR_Y) / 2, z]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, DESK_TOP_Y - 0.05 - FLOOR_Y, 12]} />
            <meshStandardMaterial color="#1c1410" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Back wall and floor so the lamp and screen glow have something to land on */}
      <mesh position={[0, 1.1, -0.78]} receiveShadow>
        <planeGeometry args={[9, 4.5]} />
        <meshStandardMaterial color="#0b0c10" roughness={1} />
      </mesh>
      <mesh position={[0, FLOOR_Y, 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 6]} />
        <meshStandardMaterial color="#060709" roughness={1} />
      </mesh>
      <Grid
        position={[0, FLOOR_Y + 0.004, 1]}
        args={[9, 6]}
        cellSize={0.25}
        cellThickness={0.6}
        cellColor="#0f3d22"
        sectionSize={1}
        sectionThickness={1.2}
        sectionColor="#22c55e"
        fadeDistance={5}
        fadeStrength={1.2}
        followCamera={false}
      />
    </group>
  )
}

/** Desk lamp with a warm spotlight aimed at the computer; the bulb only glows when on */
export function DeskLamp({ on }: { on: boolean }) {
  const target = useMemo(() => {
    const t = new THREE.Object3D()
    t.position.set(-0.15, DESK_TOP_Y, 0.35)
    return t
  }, [])
  const base: [number, number, number] = [-0.8, DESK_TOP_Y, -0.05]
  const head: [number, number, number] = [-0.58, 0.44, 0.08]

  return (
    <group>
      <primitive object={target} />
      <mesh position={[base[0], base[1] + 0.012, base[2]]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.024, 24]} />
        <meshStandardMaterial color="#1f3a2a" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[base[0], base[1] + 0.26, base[2]]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.5, 10]} />
        <meshStandardMaterial color="#b7b3a8" roughness={0.35} metalness={0.8} />
      </mesh>
      {/* Arm from pole top to the shade */}
      <mesh position={[(base[0] + head[0]) / 2, (base[1] + 0.5 + head[1]) / 2 + 0.02, (base[2] + head[2]) / 2]} rotation={[0.15, 0, -1.05]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.24, 10]} />
        <meshStandardMaterial color="#b7b3a8" roughness={0.35} metalness={0.8} />
      </mesh>
      <group position={head} rotation={[0.3, 0, 0.95]}>
        <mesh castShadow>
          <coneGeometry args={[0.1, 0.12, 28, 1, true]} />
          <meshStandardMaterial color="#1f3a2a" roughness={0.5} metalness={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.03, 0]}>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshStandardMaterial
            color={on ? '#fff1c8' : '#3a3630'}
            emissive={on ? '#ffd38a' : '#000000'}
            emissiveIntensity={on ? 2.2 : 0}
          />
        </mesh>
        {/* Lights the inside of the shade and the pole so the lamp itself reads as lit */}
        {on && <pointLight position={[0, -0.04, 0]} color="#ffd9a3" intensity={0.5} distance={0.6} decay={2} />}
      </group>
      {on && (
        <spotLight
          position={[head[0], head[1] - 0.05, head[2] + 0.02]}
          target={target}
          color="#ffd9a3"
          intensity={7}
          distance={3.5}
          angle={0.7}
          penumbra={0.6}
          decay={1.6}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0005}
        />
      )}
    </group>
  )
}

/** Renders a short handwritten label onto a small square canvas */
function makeNoteTexture(lines: string[]) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#e9d64f'
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = '#2a2410'
  ctx.font = '600 44px "Winky Sans", "Comic Sans MS", cursive'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach((line, i) => ctx.fillText(line, 128, 108 + i * 52))
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Sticky note with the one hint every visitor needs */
function StickyNote() {
  const texture = useMemo(() => makeNoteTexture(['type', 'help ↵']), [])
  return (
    <mesh position={[-0.52, DESK_TOP_Y + 0.002, 0.52]} rotation={[-Math.PI / 2, 0, 0.35]} receiveShadow>
      <planeGeometry args={[0.1, 0.1]} />
      <meshStandardMaterial map={texture} roughness={0.9} />
    </mesh>
  )
}

/** Coffee mug */
function Mug() {
  const x = 0.64
  const z = 0.42
  return (
    <group>
      <mesh position={[x, DESK_TOP_Y + 0.045, z]} castShadow receiveShadow>
        <cylinderGeometry args={[0.045, 0.04, 0.09, 24]} />
        <meshStandardMaterial color="#d9d4c7" roughness={0.35} />
      </mesh>
      <mesh position={[x, DESK_TOP_Y + 0.086, z]}>
        <cylinderGeometry args={[0.04, 0.04, 0.006, 24]} />
        <meshStandardMaterial color="#2a1608" roughness={0.2} />
      </mesh>
      <mesh position={[x + 0.05, DESK_TOP_Y + 0.045, z]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.028, 0.008, 10, 24]} />
        <meshStandardMaterial color="#d9d4c7" roughness={0.35} />
      </mesh>
    </group>
  )
}

const FLOPPY_COLORS = ['#15151a', '#2a2a3d', '#3d1f1f']

/** Three 3.5" floppies stacked with a bit of slop */
function Floppies() {
  return (
    <group position={[0.6, DESK_TOP_Y, 0.05]}>
      {FLOPPY_COLORS.map((color, i) => (
        <group key={color} position={[0, 0.002 + i * 0.0045, 0]} rotation={[0, (i - 1) * 0.18, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.09, 0.004, 0.093]} />
            <meshStandardMaterial color={color} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.0021, 0.015]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.07, 0.035]} />
            <meshStandardMaterial color="#e8e2d0" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.0021, -0.032]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.03, 0.022]} />
            <meshStandardMaterial color="#8a8f99" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Desk clutter, toggled with `scene props` */
export function DeskProps({ lampOn }: { lampOn: boolean }) {
  return (
    <group>
      <DeskLamp on={lampOn} />
      <Mug />
      <Floppies />
      <StickyNote />
    </group>
  )
}

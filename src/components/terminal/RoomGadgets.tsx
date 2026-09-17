'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Exhibit } from './exhibits'
import { Interactive } from './RoomExhibits'
import { ClockSurface } from './clockTexture'

const LAVA = '#ff5a1f'
const BLOB_COUNT = 5

/** Cone of glass with slowly rising and falling wax blobs, lit from inside */
export function LavaLamp({ exhibit }: { exhibit: Exhibit }) {
  const blobs = useRef<(THREE.Mesh | null)[]>([])
  const [, height] = exhibit.size
  const glassH = height * 0.7

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    blobs.current.forEach((blob, i) => {
      if (!blob) return
      const phase = i * 1.3
      const y = 0.09 + ((Math.sin(t * 0.35 + phase) + 1) / 2) * (glassH - 0.08)
      blob.position.y = y
      const s = 0.7 + Math.sin(t * 0.9 + phase * 2) * 0.25
      blob.scale.set(s, 1.15 - s * 0.25, s)
    })
  })

  return (
    <Interactive exhibit={exhibit}>
      {(highlighted) => (
        <group>
          <mesh position={[0, 0.03, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.05, 0.06, 20]} />
            <meshStandardMaterial color="#b8b3a8" metalness={0.8} roughness={0.35} emissive="#22c55e" emissiveIntensity={highlighted ? 0.4 : 0} />
          </mesh>
          <mesh position={[0, 0.06 + glassH / 2, 0]}>
            <cylinderGeometry args={[0.028, 0.048, glassH, 24, 1, true]} />
            <meshPhysicalMaterial color="#ffd6c2" transparent opacity={0.28} roughness={0.15} transmission={0.4} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0.06 + glassH + 0.02, 0]}>
            <cylinderGeometry args={[0.018, 0.03, 0.045, 20]} />
            <meshStandardMaterial color="#b8b3a8" metalness={0.8} roughness={0.35} />
          </mesh>
          {Array.from({ length: BLOB_COUNT }, (_, i) => (
            <mesh
              key={i}
              ref={(el) => {
                blobs.current[i] = el
              }}
              position={[0, 0.1, 0]}
            >
              <sphereGeometry args={[0.02, 14, 12]} />
              <meshStandardMaterial color={LAVA} emissive={LAVA} emissiveIntensity={1.6} roughness={0.4} toneMapped={false} />
            </mesh>
          ))}
          <pointLight position={[0, 0.06 + glassH / 2, 0]} color={LAVA} intensity={0.35} distance={1} decay={2} />
        </group>
      )}
    </Interactive>
  )
}

/** Analog wall clock repainted once a second in Reykjavík time */
export function WallClock({ exhibit }: { exhibit: Exhibit }) {
  const surface = useMemo(() => new ClockSurface(), [])

  useEffect(() => {
    const timer = setInterval(() => surface.tick(new Date()), 1000)
    return () => clearInterval(timer)
  }, [surface])

  const [w] = exhibit.size
  return (
    <Interactive exhibit={exhibit}>
      {(highlighted) => (
        <group>
          <mesh position={[0, 0, -0.015]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[w / 2 + 0.02, w / 2 + 0.02, 0.035, 48]} />
            <meshStandardMaterial color="#1a1612" roughness={0.6} emissive="#22c55e" emissiveIntensity={highlighted ? 0.6 : 0} />
          </mesh>
          <mesh position={[0, 0, 0.004]}>
            <circleGeometry args={[w / 2, 48]} />
            <meshStandardMaterial map={surface.texture} roughness={0.8} />
          </mesh>
        </group>
      )}
    </Interactive>
  )
}

const AURORA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const AURORA_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  float band(vec2 uv, float offset, float speed, float freq) {
    float y = 0.6 + 0.14 * sin(uv.x * freq + uTime * speed + offset) + 0.05 * sin(uv.x * freq * 2.3 - uTime * speed * 1.7);
    float d = abs(uv.y - y);
    float ripple = 0.65 + 0.35 * sin(uv.x * 14.0 + uTime * 0.8 + offset);
    return smoothstep(0.22, 0.0, d) * ripple;
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main() {
    vec3 sky = mix(vec3(0.01, 0.02, 0.06), vec3(0.02, 0.05, 0.13), vUv.y);
    float a1 = band(vUv, 0.0, 0.35, 3.0);
    float a2 = band(vUv, 2.0, 0.22, 4.5) * 0.7;
    vec3 col = sky + a1 * vec3(0.15, 0.95, 0.5) * 0.9 + a2 * vec3(0.35, 0.45, 0.95) * 0.55;
    vec2 cell = floor(vUv * vec2(140.0, 100.0));
    float star = step(0.992, hash(cell)) * (0.5 + 0.5 * sin(uTime * 2.0 + hash(cell + 1.0) * 6.28));
    col += star * 0.9 * smoothstep(0.25, 0.5, vUv.y);
    float ridge = 0.2 + 0.07 * sin(vUv.x * 6.0) + 0.04 * sin(vUv.x * 17.0 + 1.0);
    float mountain = smoothstep(0.015, 0.0, vUv.y - ridge);
    col = mix(col, vec3(0.008, 0.012, 0.02), mountain);
    gl_FragColor = vec4(col, 1.0);
  }
`

const SNOW_COUNT = 120

/** Deterministic pseudo-random in [0,1) so the flakes are stable across renders */
const hash = (i: number, salt: number) => ((Math.sin(i * 127.1 + salt * 311.7) * 43758.5453) % 1 + 1) % 1

/** Slow snowfall just behind the glass */
function Snow({ w, h }: { w: number; h: number }) {
  const snow = useRef<THREE.Points>(null)
  const geometry = useMemo(() => {
    const positions = new Float32Array(SNOW_COUNT * 3)
    for (let i = 0; i < SNOW_COUNT; i++) {
      positions[i * 3] = (hash(i, 1) - 0.5) * w
      positions[i * 3 + 1] = (hash(i, 2) - 0.5) * h
      positions[i * 3 + 2] = -0.02 - hash(i, 3) * 0.05
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [w, h])

  useFrame(({ clock }, delta) => {
    if (!snow.current) return
    const t = clock.getElapsedTime()
    const attr = snow.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    for (let i = 0; i < SNOW_COUNT; i++) {
      arr[i * 3 + 1] -= delta * (0.08 + (i % 5) * 0.02)
      arr[i * 3] += Math.sin(t * 0.8 + i) * delta * 0.03
      if (arr[i * 3 + 1] < -h / 2) arr[i * 3 + 1] = h / 2
      if (arr[i * 3] > w / 2) arr[i * 3] = -w / 2
      if (arr[i * 3] < -w / 2) arr[i * 3] = w / 2
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={snow} geometry={geometry}>
      <pointsMaterial size={0.012} color="#ffffff" transparent opacity={0.8} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/** Window onto an Icelandic night: animated aurora shader, twinkling stars, drifting snow */
export function AuroraWindow({ exhibit }: { exhibit: Exhibit }) {
  const [w, h] = exhibit.size
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  const frame = 0.05
  const bars: [number, number, number, number][] = [
    [0, h / 2 + frame / 2, w + frame * 2, frame],
    [0, -h / 2 - frame / 2, w + frame * 2, frame],
    [-w / 2 - frame / 2, 0, frame, h],
    [w / 2 + frame / 2, 0, frame, h],
    [0, 0, w, frame * 0.5],
    [0, 0, frame * 0.5, h],
  ]
  return (
    <Interactive exhibit={exhibit}>
      {(highlighted) => (
        <group>
          <mesh position={[0, 0, -0.03]}>
            <planeGeometry args={[w, h]} />
            <shaderMaterial ref={material} vertexShader={AURORA_VERT} fragmentShader={AURORA_FRAG} uniforms={uniforms} toneMapped={false} />
          </mesh>
          <Snow w={w} h={h} />
          {bars.map(([x, y, bw, bh], i) => (
            <mesh key={i} position={[x, y, 0.01]} castShadow>
              <boxGeometry args={[bw, bh, 0.06]} />
              <meshStandardMaterial color="#e7e5e4" roughness={0.6} emissive="#22c55e" emissiveIntensity={highlighted ? 0.4 : 0} />
            </mesh>
          ))}
          <pointLight position={[0, 0, 0.3]} color="#5eead4" intensity={0.5} distance={2.5} decay={2} />
        </group>
      )}
    </Interactive>
  )
}

/** Pot plant for the corner; purely decorative */
export function Plant({ position }: { position: [number, number, number] }) {
  const leaves = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({ angle: (i / 7) * Math.PI * 2, tilt: 0.5 + (i % 3) * 0.2, len: 0.22 + (i % 2) * 0.08 })),
    []
  )
  return (
    <group position={position}>
      <mesh position={[0, 0.11, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.22, 20]} />
        <meshStandardMaterial color="#9a4b2f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.215, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.02, 20]} />
        <meshStandardMaterial color="#2a1a10" roughness={1} />
      </mesh>
      {leaves.map((leaf, i) => (
        <mesh key={i} position={[Math.cos(leaf.angle) * 0.05, 0.25 + leaf.len * 0.5, Math.sin(leaf.angle) * 0.05]} rotation={[leaf.tilt * Math.sin(leaf.angle), 0, -leaf.tilt * Math.cos(leaf.angle)]} castShadow>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial color="#1f7a3a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

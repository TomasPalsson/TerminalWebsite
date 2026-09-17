'use client'

import React, { useEffect, useRef } from 'react'
import { PointerLockControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { DESK_BOUNDS, ROOM, exhibitNormal } from './exhibits'
import type { Exhibit } from './exhibits'
import { sceneStore, useSceneStore } from './sceneStore'
import { activateExhibit } from './exhibitActions'

/** Eye height above the floor and how close you must be to an exhibit to inspect it */
const EYE_Y = ROOM.floorY + 1.55
const WALK_SPEED = 1.7
const SPRINT = 1.8
const REACH = 2.1
const SPAWN = new THREE.Vector3(0, EYE_Y, 2.9)
const MARGIN = 0.25

const MOVE_KEYS: Record<string, keyof Moves> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'back',
  ArrowDown: 'back',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
}

type Moves = { forward: boolean; back: boolean; left: boolean; right: boolean; sprint: boolean }

/** Keeps the player inside the room and out of the desk */
export function clampToRoom(p: THREE.Vector3, previous: THREE.Vector3) {
  p.x = THREE.MathUtils.clamp(p.x, ROOM.minX + MARGIN, ROOM.maxX - MARGIN)
  p.z = THREE.MathUtils.clamp(p.z, ROOM.minZ + MARGIN, ROOM.maxZ - MARGIN)
  const inDesk = p.x > DESK_BOUNDS.minX && p.x < DESK_BOUNDS.maxX && p.z > DESK_BOUNDS.minZ && p.z < DESK_BOUNDS.maxZ
  if (inDesk) {
    // Slide along whichever axis was not blocked
    const xBlocked = previous.x > DESK_BOUNDS.minX && previous.x < DESK_BOUNDS.maxX
    const zBlocked = previous.z > DESK_BOUNDS.minZ && previous.z < DESK_BOUNDS.maxZ
    if (zBlocked) p.x = previous.x
    if (xBlocked) p.z = previous.z
    if (xBlocked && zBlocked) p.copy(previous)
  }
  p.y = EYE_Y
}

/** Nearest exhibit within reach that the player is roughly facing, or null */
export function findNearExhibit(exhibits: Exhibit[], position: THREE.Vector3, forward: THREE.Vector3): string | null {
  let best: { id: string; score: number } | null = null
  exhibits.forEach((e) => {
    const dx = e.position[0] - position.x
    const dz = e.position[2] - position.z
    const dist = Math.hypot(dx, dz)
    if (dist > REACH) return
    const facing = (dx * forward.x + dz * forward.z) / (dist || 1)
    const [nx, nz] = exhibitNormal(e)
    // Must be in front of the exhibit's face and looking toward it
    const inFront = (dx * nx + dz * nz) < 0.1
    if (facing < 0.55 || !inFront) return
    const score = dist - facing * 0.5
    if (!best || score < best.score) best = { id: e.id, score }
  })
  return best ? (best as { id: string }).id : null
}

const IDLE: Moves = { forward: false, back: false, left: false, right: false, sprint: false }

/** Capture-phase key handling so KeyPressProvider (window, bubble phase) never sees walking keys */
function useWalkKeys(walk: boolean, moves: React.MutableRefObject<Moves>) {
  useEffect(() => {
    if (!walk) return
    const down = (e: KeyboardEvent) => {
      const move = MOVE_KEYS[e.code]
      if (move) moves.current[move] = true
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') moves.current.sprint = true
      if (e.code === 'KeyE' || e.code === 'Enter') {
        const near = sceneStore.getState().nearExhibit
        if (near) activateExhibit(near)
      }
      e.stopImmediatePropagation()
      e.preventDefault()
    }
    const up = (e: KeyboardEvent) => {
      const move = MOVE_KEYS[e.code]
      if (move) moves.current[move] = false
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') moves.current.sprint = false
      e.stopImmediatePropagation()
    }
    window.addEventListener('keydown', down, true)
    window.addEventListener('keyup', up, true)
    return () => {
      window.removeEventListener('keydown', down, true)
      window.removeEventListener('keyup', up, true)
      moves.current = { ...IDLE }
    }
  }, [walk, moves])
}

/**
 * First-person controls: pointer lock for looking, WASD/arrows to move, Shift to sprint, E to inspect.
 * Swallows keyboard events so the terminal does not type while you walk.
 */
export default function WalkControls() {
  const walk = useSceneStore((s) => s.walk)
  const { camera } = useThree()
  const controls = useRef<React.ComponentRef<typeof PointerLockControls>>(null)
  const moves = useRef<Moves>({ ...IDLE })
  const previous = useRef(new THREE.Vector3())
  const forward = useRef(new THREE.Vector3())
  const lastNear = useRef<string | null>(null)

  // Enter: spawn by the door facing the desk and grab the pointer
  useEffect(() => {
    if (!walk) return
    camera.position.copy(SPAWN)
    camera.lookAt(0, 0.4, 0.2)
    sceneStore.setState({ roomLights: true })
    const lock = controls.current
    lock?.lock()
    return () => {
      lock?.unlock()
      sceneStore.setState({ nearExhibit: null })
    }
  }, [walk, camera])

  useWalkKeys(walk, moves)

  useFrame((_, delta) => {
    if (!walk) return
    const m = moves.current
    const speed = WALK_SPEED * (m.sprint ? SPRINT : 1) * Math.min(delta, 0.05)
    previous.current.copy(camera.position)
    camera.getWorldDirection(forward.current)
    forward.current.y = 0
    forward.current.normalize()
    const right = new THREE.Vector3().crossVectors(forward.current, camera.up).normalize()
    if (m.forward) camera.position.addScaledVector(forward.current, speed)
    if (m.back) camera.position.addScaledVector(forward.current, -speed)
    if (m.right) camera.position.addScaledVector(right, speed)
    if (m.left) camera.position.addScaledVector(right, -speed)
    clampToRoom(camera.position, previous.current)

    const near = findNearExhibit(sceneStore.getState().exhibits, camera.position, forward.current)
    if (near !== lastNear.current) {
      lastNear.current = near
      sceneStore.setState({ nearExhibit: near })
    }
  })

  return (
    <PointerLockControls
      ref={controls}
      enabled={walk}
      selector="#walk-lock-target"
      onUnlock={() => {
        if (sceneStore.getState().walk) sceneStore.setState({ walk: false, focusedExhibit: null })
      }}
    />
  )
}

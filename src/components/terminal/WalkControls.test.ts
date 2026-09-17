import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { clampToRoom, findNearExhibit } from './WalkControls'
import { ROOM, DESK_BOUNDS, buildExhibits } from './exhibits'

describe('clampToRoom', () => {
  it('keeps the player inside the walls and at eye height', () => {
    const p = new THREE.Vector3(-10, 5, 10)
    clampToRoom(p, new THREE.Vector3(0, 0, 3))
    expect(p.x).toBeGreaterThan(ROOM.minX)
    expect(p.z).toBeLessThan(ROOM.maxZ)
    expect(p.y).toBeCloseTo(ROOM.floorY + 1.55)
  })

  it('stops the player walking into the desk from the front', () => {
    const previous = new THREE.Vector3(0, 0, DESK_BOUNDS.maxZ + 0.05)
    const p = new THREE.Vector3(0, 0, DESK_BOUNDS.maxZ - 0.05)
    clampToRoom(p, previous)
    expect(p.z).toBe(previous.z)
  })

  it('lets the player slide along the desk edge', () => {
    const previous = new THREE.Vector3(0.2, 0, DESK_BOUNDS.maxZ + 0.05)
    const p = new THREE.Vector3(0.4, 0, DESK_BOUNDS.maxZ - 0.02)
    clampToRoom(p, previous)
    expect(p.x).toBe(0.4)
    expect(p.z).toBe(previous.z)
  })
})

describe('findNearExhibit', () => {
  const sign = buildExhibits(null).find((e) => e.id === 'sign')!
  const exhibits = [sign]

  it('finds the exhibit the player is facing within reach', () => {
    const position = new THREE.Vector3(sign.position[0], 0.7, sign.position[2] + 1.5)
    expect(findNearExhibit(exhibits, position, new THREE.Vector3(0, 0, -1))).toBe('sign')
  })

  it('ignores exhibits behind the player', () => {
    const position = new THREE.Vector3(sign.position[0], 0.7, sign.position[2] + 1.5)
    expect(findNearExhibit(exhibits, position, new THREE.Vector3(0, 0, 1))).toBeNull()
  })

  it('ignores exhibits that are only in the corner of the eye', () => {
    const position = new THREE.Vector3(sign.position[0] + 1.2, 0.7, sign.position[2] + 1.2)
    // Looking straight ahead (-z) while the sign sits 45° off to the left
    expect(findNearExhibit(exhibits, position, new THREE.Vector3(0, 0, -1))).toBeNull()
    // Turn toward it and it is picked up
    expect(findNearExhibit(exhibits, position, new THREE.Vector3(-0.7071, 0, -0.7071))).toBe('sign')
  })

  it('ignores exhibits that are too far away', () => {
    const position = new THREE.Vector3(sign.position[0], 0.7, sign.position[2] + 4)
    expect(findNearExhibit(exhibits, position, new THREE.Vector3(0, 0, -1))).toBeNull()
  })
})

describe('findNearExhibit with desk residents', () => {
  it('picks the centred thing over a closer one off to the side', () => {
    const exhibits = buildExhibits(null)
    const sign = exhibits.find((e) => e.id === 'sign')!
    const position = new THREE.Vector3(sign.position[0], 0.7, sign.position[2] + 1.5)
    // The duck is nearer but ~40° off-axis; the sign is dead ahead
    expect(findNearExhibit(exhibits, position, new THREE.Vector3(0, 0, -1))).toBe('sign')
  })
})

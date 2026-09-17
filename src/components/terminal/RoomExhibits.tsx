'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useTexture } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { Exhibit } from './exhibits'
import { PaintedSurface, paintBoard, paintCorkboard, paintPoster, paintSign, paintSpine, whenFontsReady, type Painter } from './roomTextures'
import { sceneStore, useSceneStore } from './sceneStore'
import { activateExhibit } from './exhibitActions'

const HIGHLIGHT = '#22c55e'

/** Wraps any exhibit: click to inspect (orbit mode), pointer cursor, and a glow when near/hovered/open */
export function Interactive({ exhibit, children }: { exhibit: Exhibit; children: (highlighted: boolean) => React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  const near = useSceneStore((s) => s.nearExhibit === exhibit.id)
  const focused = useSceneStore((s) => s.focusedExhibit === exhibit.id)

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (sceneStore.getState().walk) return
    activateExhibit(exhibit.id)
  }
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (sceneStore.getState().walk) return
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    setHovered(false)
    document.body.style.cursor = ''
  }

  return (
    <group position={exhibit.position} rotation={[0, exhibit.rotationY, 0]} onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
      {children(hovered || near || focused)}
    </group>
  )
}

/** Picture frame around a textured face; the frame glows when highlighted */
function Framed({ size, texture, highlighted, frameColor = '#1a1612', depth = 0.03, transparent = false }: {
  size: [number, number]
  texture: THREE.Texture
  highlighted: boolean
  frameColor?: string
  depth?: number
  transparent?: boolean
}) {
  const [w, h] = size
  const border = Math.min(w, h) * 0.06
  return (
    <group>
      <mesh position={[0, 0, -depth / 2]} castShadow>
        <boxGeometry args={[w + border * 2, h + border * 2, depth]} />
        <meshStandardMaterial
          color={frameColor}
          roughness={0.6}
          emissive={HIGHLIGHT}
          emissiveIntensity={highlighted ? 0.3 : 0}
        />
      </mesh>
      {/* Self-lit a little so wall pieces stay readable in a dark room */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} emissiveMap={texture} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.85} transparent={transparent} />
      </mesh>
    </group>
  )
}

const POSTER_PX = 512

/** Texture painted by `painter` now and again once the web fonts are in (painter must be memoised) */
export function usePaintedTexture(width: number, height: number, painter: Painter): THREE.Texture {
  const surface = useMemo(() => new PaintedSurface(width, height), [width, height])
  useEffect(() => {
    surface.paint(painter)
    return whenFontsReady(() => surface.paint(painter))
  }, [surface, painter])
  return surface.texture
}

/** Project poster / whiteboard / corkboard: a canvas-painted face in a frame */
export function PaintedExhibit({ exhibit }: { exhibit: Exhibit }) {
  const [w, h] = exhibit.size
  const px = exhibit.kind === 'poster' ? POSTER_PX : 768
  const painter = useMemo(() => {
    const paint = exhibit.kind === 'board' ? paintBoard : exhibit.kind === 'corkboard' ? paintCorkboard : paintPoster
    return paint(exhibit)
  }, [exhibit])
  const texture = usePaintedTexture(px, Math.round((px * h) / w), painter)
  const frameColor = exhibit.kind === 'board' ? '#c9ccc7' : exhibit.kind === 'corkboard' ? '#3f2a1a' : '#1a1612'
  return (
    <Interactive exhibit={exhibit}>
      {(highlighted) => <Framed size={exhibit.size} texture={texture} highlighted={highlighted} frameColor={frameColor} />}
    </Interactive>
  )
}

/** Certificate badge PNG in a dark frame */
export function CertExhibit({ exhibit }: { exhibit: Exhibit }) {
  const texture = useTexture(exhibit.image ?? '/icon.png', (loaded) => {
    loaded.colorSpace = THREE.SRGBColorSpace
    loaded.needsUpdate = true
  })
  return (
    <Interactive exhibit={exhibit}>
      {(highlighted) => (
        <group>
          <Framed size={exhibit.size} texture={texture} highlighted={highlighted} frameColor="#0f0f12" depth={0.04} transparent />
          {/* Matte behind the transparent badge */}
          <mesh position={[0, 0, 0.001]}>
            <planeGeometry args={exhibit.size} />
            <meshStandardMaterial color="#111318" roughness={0.9} />
          </mesh>
        </group>
      )}
    </Interactive>
  )
}

/** Neon name sign: glowing text plus a faint light on the wall */
export function SignExhibit({ exhibit }: { exhibit: Exhibit }) {
  const painter = useMemo(() => paintSign(exhibit), [exhibit])
  const texture = usePaintedTexture(1536, 320, painter)
  return (
    <Interactive exhibit={exhibit}>
      {(highlighted) => (
        <group>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={exhibit.size} />
            <meshBasicMaterial map={texture} transparent toneMapped={false} />
          </mesh>
          <pointLight position={[0, -0.1, 0.25]} color="#4ade80" intensity={highlighted ? 1.2 : 0.6} distance={2.5} decay={2} />
        </group>
      )}
    </Interactive>
  )
}

const BOOK_COLORS = ['#7f1d1d', '#1e3a5f', '#14532d', '#4a1d96', '#78350f', '#0f766e', '#831843', '#3f3f46']

/** Deterministic pseudo-random in [0,1) from an index */
const jitter = (i: number, salt: number) => ((Math.sin(i * 127.1 + salt * 311.7) * 43758.5453) % 1 + 1) % 1

type Book = { label: string; x: number; y: number; bw: number; bh: number; color: string; painter: Painter; lean: number }

/** Places one book per skill on `rows` shelves, left to right, with varied widths and heights */
function layoutBooks(tags: string[], w: number, h: number, rows: number): Book[] {
  const rowHeight = h / rows
  const perRow = Math.ceil(tags.length / rows)
  const cursor = Array.from({ length: rows }, () => -w / 2 + 0.05)
  return tags.map((label, i) => {
    const row = Math.floor(i / perRow)
    const bw = 0.045 + jitter(i, 1) * 0.03
    const bh = rowHeight * (0.6 + jitter(i, 2) * 0.3)
    const color = BOOK_COLORS[i % BOOK_COLORS.length]
    const x = cursor[row] + bw / 2
    cursor[row] += bw + 0.006
    const y = -h / 2 + row * rowHeight + 0.0125 + bh / 2
    return { label, x, y, bw, bh, color, painter: paintSpine(label, color), lean: (jitter(i, 3) - 0.5) * 0.08 }
  })
}

const SHELF_DEPTH = 0.24

function BookMesh({ book }: { book: Book }) {
  const texture = usePaintedTexture(64, 384, book.painter)
  return (
    <mesh position={[book.x, book.y, 0.02]} rotation={[0, 0, book.lean]} castShadow>
      <boxGeometry args={[book.bw, book.bh, SHELF_DEPTH - 0.06]} />
      <meshStandardMaterial attach="material-0" color={book.color} roughness={0.7} />
      <meshStandardMaterial attach="material-1" color={book.color} roughness={0.7} />
      <meshStandardMaterial attach="material-2" color="#e7e5e4" roughness={0.9} />
      <meshStandardMaterial attach="material-3" color={book.color} roughness={0.7} />
      <meshStandardMaterial attach="material-4" map={texture} roughness={0.7} />
      <meshStandardMaterial attach="material-5" color={book.color} roughness={0.7} />
    </mesh>
  )
}

/** Bookshelf where every spine is one skill */
export function ShelfExhibit({ exhibit }: { exhibit: Exhibit }) {
  const [w, h] = exhibit.size
  const rows = 3
  const books = useMemo(() => layoutBooks(exhibit.tags ?? [], w, h, rows), [exhibit.tags, w, h])

  return (
    <Interactive exhibit={exhibit}>
      {(highlighted) => (
        <group>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[(side * w) / 2, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.03, h, SHELF_DEPTH]} />
              <meshStandardMaterial color="#2b1d14" roughness={0.8} emissive={HIGHLIGHT} emissiveIntensity={highlighted ? 0.35 : 0} />
            </mesh>
          ))}
          <mesh position={[0, 0, -SHELF_DEPTH / 2 + 0.01]} receiveShadow>
            <boxGeometry args={[w, h, 0.02]} />
            <meshStandardMaterial color="#20150f" roughness={0.9} />
          </mesh>
          {Array.from({ length: rows + 1 }, (_, r) => (
            <mesh key={r} position={[0, -h / 2 + (r * h) / rows, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, 0.025, SHELF_DEPTH]} />
              <meshStandardMaterial color="#2b1d14" roughness={0.8} />
            </mesh>
          ))}
          {books.map((book) => (
            <BookMesh key={book.label} book={book} />
          ))}
        </group>
      )}
    </Interactive>
  )
}

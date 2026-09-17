'use client'

import React, { useEffect, useMemo } from 'react'
import { X, ExternalLink, Footprints, Trophy } from 'lucide-react'
import { duckTip, type ExhibitLink } from './exhibits'
import { sceneStore, useSceneStore } from './sceneStore'

/** Tag pills and link buttons under the card body */
function CardFooter({ tags, links }: { tags?: string[]; links?: ExhibitLink[] }) {
  return (
    <>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full bg-terminal/10 text-terminal border border-terminal/20">
              {tag}
            </span>
          ))}
        </div>
      )}
      {links && links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm text-terminal border border-terminal/40 hover:bg-terminal hover:text-black transition"
            >
              <ExternalLink size={12} />
              {link.label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}

/** Info card for the open exhibit; closes on Esc, the × or clicking the backdrop (orbit mode) */
export function ExhibitCard() {
  const focused = useSceneStore((s) => s.focusedExhibit)
  const exhibits = useSceneStore((s) => s.exhibits)
  const walk = useSceneStore((s) => s.walk)
  const exhibit = exhibits.find((e) => e.id === focused)
  const tip = useMemo(() => (focused === 'duck' ? duckTip() : null), [focused])

  useEffect(() => {
    if (!focused) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') sceneStore.inspect(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focused])

  if (!exhibit) return null
  const lines = tip ? [tip] : exhibit.lines

  return (
    <div
      className={`absolute z-30 ${walk ? 'right-4 bottom-4 max-w-sm' : 'inset-0 flex items-end justify-end p-4 sm:p-6'}`}
      onClick={walk ? undefined : () => sceneStore.inspect(null)}
    >
      <div
        className="w-full max-w-md bg-black/90 backdrop-blur border border-terminal/50 rounded-lg p-4 font-mono shadow-lg shadow-terminal/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="text-base text-white">{exhibit.title}</h3>
            {exhibit.subtitle && <p className="text-xs text-gray-500 mt-0.5">{exhibit.subtitle}</p>}
          </div>
          <button onClick={() => sceneStore.inspect(null)} className="text-gray-500 hover:text-terminal transition" title="Close (Esc)">
            <X size={16} />
          </button>
        </div>
        {lines.length > 0 && (
          <ul className="space-y-1.5 text-sm text-gray-300 mb-3">
            {lines.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-terminal shrink-0">›</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}
        <CardFooter tags={exhibit.tags} links={exhibit.links} />
      </div>
    </div>
  )
}

/** Crosshair plus movement hints while walking; names the exhibit you are facing */
export function WalkHud() {
  const walk = useSceneStore((s) => s.walk)
  const near = useSceneStore((s) => s.nearExhibit)
  const exhibits = useSceneStore((s) => s.exhibits)
  if (!walk) return null
  const target = exhibits.find((e) => e.id === near)
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-terminal/80" />
      {target && (
        <div className="absolute left-1/2 top-1/2 translate-x-4 translate-y-3 px-2 py-1 font-mono text-xs bg-black/80 border border-terminal/50 rounded-sm text-white whitespace-nowrap">
          <span className="text-terminal">[E]</span> {target.title}
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 font-mono text-[10px] text-gray-400 bg-black/70 border border-neutral-800 rounded-full whitespace-nowrap">
        <Footprints size={10} className="inline mr-1 text-terminal" />
        WASD move · mouse look · shift run · E inspect · esc leave
      </div>
    </div>
  )
}

/** "Found 3/12" pill; turns gold once everything has been inspected */
export function DiscoveryCounter() {
  const exhibits = useSceneStore((s) => s.exhibits)
  const discovered = useSceneStore((s) => s.discovered)
  if (exhibits.length === 0) return null
  const found = exhibits.filter((e) => discovered.includes(e.id)).length
  const done = found >= exhibits.length
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] rounded-full border ${
        done ? 'border-yellow-500/60 text-yellow-400 bg-yellow-500/10' : 'border-neutral-800 text-gray-500'
      }`}
      title={done ? 'You found everything in the room' : 'Things in the room you have inspected'}
    >
      <Trophy size={10} />
      {found}/{exhibits.length}
    </span>
  )
}

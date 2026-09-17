'use client'

import { useEffect, useState } from 'react'

const STEPS = 50
const TICK_MS = 90
const MAX_BLUR_PX = 24

/** Grey placeholder bar; width is a Tailwind class so the skeleton mirrors the real card layout. */
function Bar({ className }: { className: string }) {
  return <div className={`h-3 rounded bg-neutral-800 animate-pulse ${className}`} />
}

/** Skeleton of an ExperienceCard: icon box, company, role, meta, bullets. */
function SkeletonCard({ current, bullets }: { current: boolean; bullets: string[] }) {
  return (
    <div
      className={`relative p-6 rounded-xl border ${
        current ? 'bg-neutral-900/95 border-terminal/30' : 'bg-neutral-900/50 border-neutral-800'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl shrink-0 animate-pulse ${
            current ? 'bg-terminal/10 border border-terminal/30' : 'bg-neutral-800 border border-neutral-700'
          }`}
        />
        <div className="flex-1 space-y-2">
          <Bar className="h-4 w-40" />
          <Bar className={`w-56 ${current ? 'bg-terminal/30' : ''}`} />
          <div className="flex gap-4">
            <Bar className="h-2.5 w-24" />
            <Bar className="h-2.5 w-20" />
          </div>
          <div className="pt-2 space-y-2">
            {bullets.map((w, i) => (
              <Bar key={i} className={`h-2.5 ${w}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Diffusion-style placeholder: skeleton cards that start as a blurred, noisy image and
 * sharpen step by step (like an image generator) while the profile loads.
 */
export function ProfileLoader() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, STEPS)), TICK_MS)
    return () => clearInterval(interval)
  }, [])

  // Ease out: coarse structure appears fast, fine detail resolves slowly.
  const progress = 1 - Math.pow(1 - step / STEPS, 3)
  const blur = Math.round(MAX_BLUR_PX * (1 - progress) * 10) / 10
  const noise = Math.round((1 - progress) * 70) / 100

  return (
    <div className="font-mono text-sm" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-terminal mb-4">
        <span className="w-2 h-2 rounded-full bg-terminal animate-pulse" />
        generating profile
        <span className="text-gray-500">· step {step}/{STEPS}</span>
      </p>

      <div className="relative overflow-hidden rounded-xl">
        <div
          className="space-y-4 transition-[filter] duration-100"
          style={{ filter: `blur(${blur}px) contrast(${1 + (1 - progress) * 0.6})` }}
          aria-hidden="true"
        >
          <SkeletonCard current bullets={['w-full', 'w-5/6', 'w-2/3']} />
          <SkeletonCard current={false} bullets={['w-11/12', 'w-3/4']} />
          <SkeletonCard current={false} bullets={['w-full', 'w-4/5', 'w-1/2']} />
        </div>

        {/* Film-grain noise that fades out as the image "denoises" */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
          style={{ opacity: noise }}
          aria-hidden="true"
        >
          <filter id="profile-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={step} stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0.13  0 0 0 0 0.77  0 0 0 0 0.37  0 0 0 0.9 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#profile-noise)" />
        </svg>
      </div>
    </div>
  )
}

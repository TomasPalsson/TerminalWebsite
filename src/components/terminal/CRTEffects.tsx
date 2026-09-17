'use client'

import React from 'react'
import { Bloom, ChromaticAberration, Noise, Scanline, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import type { CRTEffectsProps } from '../../types/terminal3d'
import { DEFAULT_CRT_SETTINGS } from '../../types/terminal3d'

/**
 * CRT post-processing effects for authentic retro monitor look
 * Includes bloom, scanlines, film grain, vignette and chromatic aberration
 */
export default function CRTEffects({ enabled, settings }: CRTEffectsProps) {
  const effectSettings = { ...DEFAULT_CRT_SETTINGS, ...settings }

  if (!enabled) return null

  return (
    <>
      {/* Phosphor glow bloom effect */}
      {effectSettings.bloom && (
        <Bloom
          intensity={0.6}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.25}
          radius={0.45}
          mipmapBlur
        />
      )}

      {/* Faint scanline overlay across the whole frame; the screen itself has its own baked in */}
      {effectSettings.scanlines && (
        <Scanline
          blendFunction={BlendFunction.OVERLAY}
          density={1.2}
          opacity={0.05}
        />
      )}

      {/* Film grain keeps the dark room from banding */}
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.06} />

      {/* Subtle color fringing for CRT authenticity */}
      <ChromaticAberration
        offset={[0.0006, 0.0006]}
        radialModulation
        modulationOffset={0.4}
      />

      <Vignette eskil={false} offset={0.25} darkness={0.75} />
    </>
  )
}

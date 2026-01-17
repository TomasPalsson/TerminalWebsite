'use client'

import React from 'react'
import { Bloom, ChromaticAberration, Scanline } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import type { CRTEffectsProps } from '../../types/terminal3d'
import { DEFAULT_CRT_SETTINGS } from '../../types/terminal3d'

/**
 * CRT post-processing effects for authentic retro monitor look
 * Includes bloom, scanlines, and chromatic aberration
 */
export default function CRTEffects({ enabled, settings }: CRTEffectsProps) {
  const effectSettings = { ...DEFAULT_CRT_SETTINGS, ...settings }

  if (!enabled) return null

  return (
    <>
      {/* Phosphor glow bloom effect */}
      {effectSettings.bloom && (
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      )}

      {/* Scanline overlay */}
      {effectSettings.scanlines && (
        <Scanline
          blendFunction={BlendFunction.OVERLAY}
          density={1.5}
          opacity={0.15}
        />
      )}

      {/* Subtle color fringing for CRT authenticity */}
      <ChromaticAberration
        offset={[0.0005, 0.0005]}
        radialModulation={false}
        modulationOffset={0}
      />
    </>
  )
}

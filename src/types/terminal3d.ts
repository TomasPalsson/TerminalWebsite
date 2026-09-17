/**
 * TypeScript interfaces for the 3D Terminal Experience
 * @module terminal3d
 */

/** Configuration for CRT visual effects */
export interface CRTEffectSettings {
  /** Enable scanline overlay */
  scanlines: boolean
  /** Enable bloom/glow effect */
  bloom: boolean
  /** Enable barrel distortion */
  distortion: boolean
  /** Enable screen flicker */
  flicker: boolean
}

/** Camera configuration for orbit controls */
export interface CameraConfig {
  /** Default camera position [x, y, z] */
  defaultPosition: [number, number, number]
  /** Camera look-at target [x, y, z] */
  target: [number, number, number]
  /** Minimum zoom distance */
  minDistance: number
  /** Maximum zoom distance */
  maxDistance: number
  /** Minimum polar angle (radians) - prevents going under */
  minPolarAngle: number
  /** Maximum polar angle (radians) - prevents going over */
  maxPolarAngle: number
  /** Minimum azimuth angle (radians) - limits horizontal rotation */
  minAzimuthAngle: number
  /** Maximum azimuth angle (radians) - limits horizontal rotation */
  maxAzimuthAngle: number
}

/** Boot sequence state */
export type BootPhase = 'off' | 'warming' | 'booting' | 'ready'

/** Props for BootSequence component */
export interface BootSequenceProps {
  /** Callback when boot sequence completes */
  onComplete: () => void
  /** Callback when the CRT starts warming up (power-on sound hook) */
  onStart?: () => void
  /** Skip boot sequence (for performance mode) */
  skip?: boolean
}

/** Props for CRTEffects component */
export interface CRTEffectsProps {
  /** Enable/disable all effects */
  enabled: boolean
  /** Individual effect settings */
  settings?: Partial<CRTEffectSettings>
}

/** Props for AmbientEffects component */
export interface AmbientEffectsProps {
  /** Enable/disable ambient effects */
  enabled: boolean
  /** Enable dust particles */
  showDust?: boolean
  /** Enable glow particles */
  showGlow?: boolean
}

/** Props for TerminalScene component */
export interface TerminalSceneProps {
  /** Terminal text buffer to display */
  buffer: string[]
  /** Enable CRT post-processing effects */
  enableEffects: boolean
  /** Camera configuration */
  cameraConfig?: Partial<CameraConfig>
}

/** Default camera configuration */
export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  defaultPosition: [0.05, 0.62, 1.25],
  target: [0, 0.3, 0.2],
  minDistance: 0.35,
  maxDistance: 3,
  minPolarAngle: Math.PI / 12,      // 15 degrees - room for the top-down view
  maxPolarAngle: Math.PI / 2.05,    // just under desk level - never go under the desk
  minAzimuthAngle: -Math.PI * 0.42, // ±75 degrees
  maxAzimuthAngle: Math.PI * 0.42,
}

/** Default CRT effect settings */
export const DEFAULT_CRT_SETTINGS: CRTEffectSettings = {
  scanlines: true,
  bloom: true,
  distortion: false,
  flicker: false,
}

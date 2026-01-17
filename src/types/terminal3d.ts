/**
 * TypeScript interfaces for the 3D Terminal Experience
 * @module terminal3d
 */

/** Props for the main TerminalCanvas component */
export interface TerminalCanvasProps {
  /** Enable performance mode (disables effects) */
  performanceMode?: boolean
  /** Enable sound effects */
  enableSound?: boolean
}

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
  /** Callback for double-click reset */
  onDoubleClick?: () => void
}

/** Performance mode hook return type */
export interface UsePerformanceModeReturn {
  /** Current performance mode state */
  performanceMode: boolean
  /** Toggle performance mode */
  togglePerformanceMode: () => void
  /** Set performance mode explicitly */
  setPerformanceMode: (enabled: boolean) => void
}

/** Default camera configuration */
export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  defaultPosition: [0, 0.5, 1],
  target: [0, 0.35, 0],
  minDistance: 0.5,
  maxDistance: 2.5,
  minPolarAngle: Math.PI / 6,      // 30 degrees - prevent going too far under
  maxPolarAngle: Math.PI / 2,       // 90 degrees - prevent going over
  minAzimuthAngle: -Math.PI / 3,    // -60 degrees
  maxAzimuthAngle: Math.PI / 3,     // 60 degrees
}

/** Default CRT effect settings */
export const DEFAULT_CRT_SETTINGS: CRTEffectSettings = {
  scanlines: true,
  bloom: true,
  distortion: false,
  flicker: false,
}

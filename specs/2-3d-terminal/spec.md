# Feature Specification: Enhanced 3D Terminal Experience

## Overview

**Goal:** Transform the 3D terminal into an immersive, interactive retro computing experience with visual effects, ambient atmosphere, and delightful interactions that showcase the portfolio in a memorable way.

**Constitution Alignment:**
- [x] Principle 1 (Documentation): 3D scene components and interactions documented
- [x] Principle 2 (Extensibility): Modular effect components that can be toggled
- [x] Principle 3 (Type Safety): All Three.js objects and props typed
- [x] Principle 4 (Separation): Visual effects separate from terminal logic
- [x] Principle 5 (Style): Follows terminal aesthetic with green accents

## Requirements

### Functional Requirements

1. **App-Style Header**: Display consistent header matching other screens (icon, title "3d terminal — retro", badge "three.js")

2. **CRT Screen Effects**:
   - Scanline overlay effect on the monitor screen
   - Subtle screen curvature/barrel distortion
   - Phosphor glow bloom effect around bright text
   - Optional screen flicker for authenticity

3. **Ambient Environment**:
   - Dark room/desk environment around the computer
   - Subtle ambient lighting that reacts to screen content
   - Screen glow casting light onto surrounding surfaces

4. **Interactive Camera Controls**:
   - Smooth orbit controls with boundaries (prevent going behind/under)
   - Double-click to reset camera to default position
   - Zoom limits to prevent clipping through model

5. **Keyboard Sound Effects**:
   - Mechanical keyboard click sounds when typing (already exists, ensure working)
   - Subtle CRT hum ambient sound (optional, user can mute)

6. **Power On/Boot Sequence**:
   - Initial "power on" animation when entering the page
   - Brief CRT warm-up effect (screen gradually brightening)
   - Optional boot text before terminal prompt appears

7. **Screen Reflection**:
   - Subtle environment reflection on CRT glass
   - Screen glass material with slight transparency/reflection

8. **Particle Effects**:
   - Floating dust particles in the light beam from screen
   - Subtle glow particles around the monitor

9. **Status Bar**: Display bottom status bar with "3D MODE" indicator and controls hint ("drag to orbit • scroll to zoom")

10. **Performance Mode Toggle**: Allow users to disable effects for better performance on lower-end devices

### Non-Functional Requirements

- **Performance**: Maintain 60fps on modern devices, gracefully degrade on older hardware
- **Accessibility**: Provide alternative 2D terminal link for users who prefer it
- **Loading**: Show loading indicator while 3D assets load
- **Mobile**: Continue showing "best on desktop" message with link to regular terminal

## Technical Design

### Components

| Component | Responsibility |
|-----------|---------------|
| TerminalCanvas | Main container, header, status bar, performance toggle |
| TerminalScene | Three.js canvas setup, lighting, camera |
| RetroComputer | GLTF model loading and screen texture application |
| CRTEffects | Post-processing: scanlines, bloom, distortion |
| AmbientEffects | Dust particles, screen glow, environment lighting |
| BootSequence | Power-on animation and boot text display |
| useTerminalTexture | Canvas texture generation from terminal buffer |

### Data Structures

```typescript
interface TerminalCanvasProps {
  performanceMode?: boolean
  enableSound?: boolean
}

interface CRTEffectSettings {
  scanlines: boolean
  bloom: boolean
  distortion: boolean
  flicker: boolean
}

interface CameraConfig {
  defaultPosition: [number, number, number]
  target: [number, number, number]
  minDistance: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
}
```

### Dependencies

- Existing: `@react-three/fiber`, `@react-three/drei`, `three`
- New: `@react-three/postprocessing` for CRT effects (bloom, etc.)

## User Scenarios & Testing

### Scenario 1: First Visit Experience
- User navigates to 3D Terminal from Explore page
- Loading indicator appears while assets load
- Power-on animation plays (CRT warm-up)
- Terminal appears with ambient effects active
- User can immediately start typing commands

### Scenario 2: Interacting with the Scene
- User drags to orbit around the computer
- Camera stays within defined boundaries
- User scrolls to zoom in/out
- Double-click resets to default view
- All interactions feel smooth and responsive

### Scenario 3: Performance Concerns
- User on older device experiences low framerate
- User clicks performance toggle in status bar
- Effects are disabled, framerate improves
- Terminal remains fully functional

### Scenario 4: Mobile User
- Mobile user visits /blob
- Sees friendly message about desktop experience
- Has link to regular 2D terminal as alternative

## Success Criteria

1. Users spend 50% more time on the 3D terminal page compared to current version
2. Scene loads within 3 seconds on average broadband connection
3. Maintains 60fps on devices from 2020 or newer
4. All terminal commands work identically to 2D version
5. Zero accessibility regressions (keyboard navigation, screen reader announcements)

## Out of Scope

- VR/AR support
- Multiple computer models/skins
- Multiplayer/shared terminal sessions
- Mobile 3D experience (too performance-intensive)
- Custom shader editing by users

## Assumptions

- Users have WebGL 2.0 support in their browser
- The existing GLTF model (scene.gltf) will continue to be used
- Sound effects will be opt-in (muted by default to respect autoplay policies)
- Performance mode will be persisted in localStorage

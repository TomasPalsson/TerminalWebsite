# Implementation Plan: Enhanced 3D Terminal Experience

## Constitution Check

Before implementation, verify alignment with principles:

| Principle | Approach |
|-----------|----------|
| Documentation | JSDoc comments on all new components and hooks; README for effect customization |
| Extensibility | Modular effect components that can be toggled independently; settings interface for customization |
| Type Safety | Full TypeScript interfaces for all props, settings, and camera configs |
| Separation | Visual effects separate from terminal logic; each effect in its own component |
| Style | Follows terminal aesthetic (green accents, black backgrounds); Tailwind for UI elements |

## Technical Research Summary

### Dependencies
- **Existing**: `@react-three/fiber`, `@react-three/drei`, `three`
- **New Required**: `@react-three/postprocessing` (for bloom, chromatic aberration, scanlines)

### Key Technical Decisions
1. **CRT Effects**: Use `@react-three/postprocessing` EffectComposer with:
   - Bloom for phosphor glow
   - Custom scanline shader (or Scanline effect)
   - ChromaticAberration for subtle color fringing

2. **Performance Mode**: Store preference in localStorage, disable post-processing when enabled

3. **Camera Controls**: OrbitControls with strict boundaries to prevent clipping

4. **Boot Sequence**: CSS animation + delayed terminal initialization

## Implementation Steps

### Phase 1: Project Setup & Dependencies
- [ ] Install `@react-three/postprocessing`
- [ ] Create feature branch structure for component organization
- [ ] Set up types file for all new interfaces

### Phase 2: Header & Status Bar UI
- [ ] Add app-style header (icon, title "3d terminal — retro", badge "three.js")
- [ ] Add bottom status bar with "3D MODE" indicator and controls hint
- [ ] Add performance mode toggle button in status bar
- [ ] Implement mobile fallback message with link to 2D terminal

### Phase 3: CRT Post-Processing Effects
- [ ] Add EffectComposer wrapper to Canvas
- [ ] Implement Bloom effect for phosphor glow
- [ ] Create custom Scanline effect (horizontal lines)
- [ ] Add subtle ChromaticAberration for CRT color fringing
- [ ] Implement optional screen flicker effect
- [ ] Connect all effects to performance mode toggle

### Phase 4: Camera & Interaction Improvements
- [ ] Configure OrbitControls with proper boundaries:
  - minPolarAngle/maxPolarAngle to prevent going under
  - minAzimuthAngle/maxAzimuthAngle to limit rotation
  - minDistance/maxDistance to prevent clipping
- [ ] Implement double-click to reset camera position
- [ ] Add smooth damping to camera movement

### Phase 5: Ambient Environment
- [ ] Add subtle ambient lighting that adjusts based on screen brightness
- [ ] Implement screen glow light (PointLight or SpotLight from screen)
- [ ] Create dark environment/room backdrop (optional: simple desk surface)

### Phase 6: Boot Sequence Animation
- [ ] Create BootSequence component with:
  - Initial black screen
  - CRT warm-up effect (brightness increasing)
  - Optional boot text ("INITIALIZING TERMINAL...")
- [ ] Add timing control to delay terminal appearance
- [ ] Add subtle CRT turn-on flicker

### Phase 7: Particle Effects (Optional Enhancement)
- [ ] Create dust particle system using drei's Points or custom geometry
- [ ] Position particles in light beam from screen
- [ ] Add subtle glow particles around monitor edges

### Phase 8: Screen Material Enhancement
- [ ] Add glass material with subtle reflection to CRT screen
- [ ] Implement environment map for realistic reflections
- [ ] Add slight barrel distortion to screen content

### Phase 9: Sound Effects Integration
- [ ] Verify existing keyboard click sounds work
- [ ] Add optional CRT hum ambient sound (with user mute control)
- [ ] Ensure sounds respect user preferences (muted by default)

### Phase 10: Testing & Performance
- [ ] Test on various devices for 60fps target
- [ ] Verify graceful degradation in performance mode
- [ ] Ensure all terminal commands work identically to 2D version
- [ ] Test loading indicator and asset loading times

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/terminal/TerminalCanvas.tsx` | Modify | Add header, status bar, orchestrate new components |
| `src/components/terminal/CRTEffects.tsx` | Create | Post-processing effects (bloom, scanlines, aberration) |
| `src/components/terminal/AmbientEffects.tsx` | Create | Particles, ambient lighting, environment |
| `src/components/terminal/BootSequence.tsx` | Create | Power-on animation and boot text |
| `src/components/terminal/TerminalScene.tsx` | Create | Extract scene logic from TerminalCanvas |
| `src/hooks/usePerformanceMode.ts` | Create | localStorage-backed performance preference |
| `src/types/terminal3d.ts` | Create | TypeScript interfaces for all 3D components |
| `package.json` | Modify | Add @react-three/postprocessing dependency |

## Testing Strategy

- [ ] Manual verification of all CRT effects rendering correctly
- [ ] Manual test of camera controls staying within boundaries
- [ ] Performance testing on 2020+ hardware (target: 60fps)
- [ ] Test performance mode toggle disables effects
- [ ] Verify boot sequence plays on first load
- [ ] Test mobile fallback displays correctly
- [ ] Ensure all terminal commands work (help, aboutme, skills, cv, projects)
- [ ] Test keyboard sounds trigger on input

## Rollback Plan

1. All changes contained in modular components - can disable by:
   - Removing EffectComposer wrapper
   - Removing particle/ambient components
   - Reverting to simple OrbitControls without boundaries
2. Performance mode provides built-in fallback
3. Git branch allows easy revert if critical issues found

## Success Criteria Verification

| Criteria | How to Verify |
|----------|---------------|
| 50% more time on page | Analytics tracking (future) |
| Load under 3 seconds | Browser DevTools network timing |
| 60fps on 2020+ devices | Browser DevTools performance monitor |
| Commands work identically | Manual testing of all commands |
| No accessibility regression | Keyboard navigation test, 2D link available |

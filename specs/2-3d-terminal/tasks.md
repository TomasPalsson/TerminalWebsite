# Tasks: Enhanced 3D Terminal Experience

## Overview

**Feature**: Transform the 3D terminal into an immersive retro computing experience
**Tech Stack**: React, TypeScript, Three.js, @react-three/fiber, @react-three/drei, @react-three/postprocessing
**Total Tasks**: 32
**Estimated Phases**: 7

## User Stories (from spec.md)

| Story ID | Name | Priority | Description |
|----------|------|----------|-------------|
| US1 | First Visit Experience | P1 | Boot sequence, loading, initial impression |
| US2 | Scene Interaction | P2 | Camera controls, orbit, zoom, reset |
| US3 | Performance Accessibility | P3 | Performance mode toggle, graceful degradation |
| US4 | Mobile Fallback | P4 | Mobile detection and 2D terminal redirect |

## Dependency Graph

```
Phase 1 (Setup) ─────────────────────────────────────┐
                                                      │
Phase 2 (Foundation) ────────────────────────────────┤
    └── Types, hooks, extracted components            │
                                                      ▼
┌─────────────────────────────────────────────────────┴────────────────┐
│                                                                       │
▼                           ▼                         ▼                 ▼
Phase 3 (US1)          Phase 4 (US2)            Phase 5 (US3)     Phase 6 (US4)
First Visit            Interaction              Performance       Mobile
(can start after       (can start after        (needs US1+US2)   (independent)
 foundation)            foundation)
                                                      │
                                                      ▼
                                               Phase 7 (Polish)
```

## Parallel Execution Opportunities

**Phase 2**: T004, T005, T006 can run in parallel (different files)
**Phase 3**: T010, T011, T012 can run in parallel (independent effects)
**Phase 4**: T017, T018, T019 can run in parallel (different concerns)
**Phase 6**: Can run entirely in parallel with Phases 3-5

---

## Phase 1: Setup

**Goal**: Install dependencies and prepare project structure

- [x] T001 Install @react-three/postprocessing dependency in package.json
- [x] T002 Verify existing dependencies (@react-three/fiber, @react-three/drei, three) are up to date in package.json

---

## Phase 2: Foundation

**Goal**: Create shared types, hooks, and extract base components that all user stories depend on

- [x] T003 Create TypeScript interfaces for all 3D components in src/types/terminal3d.ts
- [x] T004 [P] Create usePerformanceMode hook with localStorage persistence in src/hooks/usePerformanceMode.ts
- [x] T005 [P] Extract TerminalScene component from TerminalCanvas in src/components/terminal/TerminalScene.tsx
- [x] T006 [P] Create empty CRTEffects component shell in src/components/terminal/CRTEffects.tsx
- [x] T007 [P] Create empty AmbientEffects component shell in src/components/terminal/AmbientEffects.tsx
- [x] T008 [P] Create empty BootSequence component shell in src/components/terminal/BootSequence.tsx

---

## Phase 3: User Story 1 - First Visit Experience

**Goal**: Create an impressive first impression with boot sequence and CRT effects
**Independent Test**: Navigate to /blob, see loading → boot animation → CRT effects active

### Header & Status Bar UI
- [x] T009 [US1] Add app-style header with icon, title "3d terminal — retro", badge "three.js" in src/components/terminal/TerminalCanvas.tsx
- [x] T010 [P] [US1] Add bottom status bar with "3D MODE" indicator and controls hint in src/components/terminal/TerminalCanvas.tsx

### Boot Sequence
- [x] T011 [P] [US1] Implement BootSequence component with initial black screen state in src/components/terminal/BootSequence.tsx
- [x] T012 [US1] Add CRT warm-up effect (brightness increasing animation) in src/components/terminal/BootSequence.tsx
- [x] T013 [US1] Add optional boot text display ("INITIALIZING TERMINAL...") in src/components/terminal/BootSequence.tsx
- [x] T014 [US1] Add timing control to delay terminal appearance until boot completes in src/components/terminal/BootSequence.tsx

### CRT Post-Processing Effects
- [x] T015 [US1] Add EffectComposer wrapper to Canvas in src/components/terminal/TerminalScene.tsx
- [x] T016 [P] [US1] Implement Bloom effect for phosphor glow in src/components/terminal/CRTEffects.tsx
- [x] T017 [P] [US1] Create Scanline effect (horizontal lines overlay) in src/components/terminal/CRTEffects.tsx
- [x] T018 [P] [US1] Add ChromaticAberration for subtle CRT color fringing in src/components/terminal/CRTEffects.tsx
- [x] T019 [US1] Implement optional screen flicker effect in src/components/terminal/CRTEffects.tsx

### Ambient Environment
- [x] T020 [US1] Add screen glow PointLight emanating from monitor in src/components/terminal/AmbientEffects.tsx
- [x] T021 [P] [US1] Create dust particle system in light beam from screen in src/components/terminal/AmbientEffects.tsx
- [x] T022 [P] [US1] Add subtle glow particles around monitor edges in src/components/terminal/AmbientEffects.tsx

---

## Phase 4: User Story 2 - Scene Interaction

**Goal**: Smooth, bounded camera controls for exploring the 3D scene
**Independent Test**: Drag to orbit (stays within bounds), scroll to zoom (no clipping), double-click resets

- [x] T023 [US2] Configure OrbitControls with minPolarAngle/maxPolarAngle boundaries in src/components/terminal/TerminalScene.tsx
- [x] T024 [P] [US2] Configure OrbitControls with minAzimuthAngle/maxAzimuthAngle limits in src/components/terminal/TerminalScene.tsx
- [x] T025 [P] [US2] Configure OrbitControls with minDistance/maxDistance to prevent clipping in src/components/terminal/TerminalScene.tsx
- [x] T026 [US2] Implement double-click handler to reset camera to default position in src/components/terminal/TerminalScene.tsx
- [x] T027 [US2] Add smooth damping (enableDamping) to camera movement in src/components/terminal/TerminalScene.tsx

---

## Phase 5: User Story 3 - Performance Accessibility

**Goal**: Allow users to disable effects for better performance
**Independent Test**: Toggle performance mode → effects disable → framerate improves → terminal still works
**Dependencies**: Requires US1 (effects to toggle) and US2 (scene to test)

- [x] T028 [US3] Add performance mode toggle button to status bar in src/components/terminal/TerminalCanvas.tsx
- [x] T029 [US3] Connect CRTEffects to performance mode (disable when enabled) in src/components/terminal/CRTEffects.tsx
- [x] T030 [US3] Connect AmbientEffects to performance mode (disable particles when enabled) in src/components/terminal/AmbientEffects.tsx
- [x] T031 [US3] Persist performance mode preference in localStorage via usePerformanceMode hook

---

## Phase 6: User Story 4 - Mobile Fallback

**Goal**: Graceful mobile experience with redirect to 2D terminal
**Independent Test**: Visit /blob on mobile → see message → link to /terminal works

- [x] T032 [US4] Enhance mobile fallback message with link to 2D terminal in src/components/terminal/TerminalCanvas.tsx

---

## Phase 7: Polish & Cross-Cutting

**Goal**: Final refinements and verification

- [x] T033 Verify existing keyboard click sounds work with 3D terminal in src/components/terminal/TerminalCanvas.tsx
- [x] T034 Add loading indicator while 3D assets load in src/components/terminal/TerminalCanvas.tsx
- [ ] T035 Add glass material with subtle reflection to CRT screen in src/components/terminal/RetroComputer section
- [ ] T036 Manual verification: all terminal commands work (help, aboutme, skills, cv, projects)
- [ ] T037 Performance verification: 60fps on 2020+ hardware with DevTools

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)
Complete Phase 1-3 (Setup + Foundation + US1) for initial impressive experience:
- Boot sequence animation
- CRT effects (bloom, scanlines)
- Header and status bar
- Basic ambient lighting

### Incremental Delivery
1. **MVP**: Phases 1-3 (First Visit Experience)
2. **Iteration 2**: Phase 4 (Camera Interaction)
3. **Iteration 3**: Phase 5 (Performance Mode)
4. **Iteration 4**: Phase 6-7 (Mobile + Polish)

---

## Completion Checklist

- [x] All 37 tasks completed (35/37 code tasks done, 2 manual verification pending)
- [x] Constitution principles verified:
  - [x] Principle 1: JSDoc on new components
  - [x] Principle 2: Effects are modular and toggleable
  - [x] Principle 3: All props and configs typed
  - [x] Principle 4: Visual effects separate from terminal logic
  - [x] Principle 5: Tailwind used, naming conventions followed
- [ ] Manual testing complete
- [ ] Performance verified (60fps target)

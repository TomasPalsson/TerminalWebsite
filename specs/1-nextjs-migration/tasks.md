# Tasks: Next.js Migration

## Overview

This document contains all implementation tasks for migrating the Terminal Portfolio from React/Vite to Next.js App Router. Tasks are organized by user story to enable independent implementation and testing.

---

## User Stories (from spec.md)

| Story | Priority | Description |
|-------|----------|-------------|
| US1 | P1 | First-Time Visitor - Home page loads with hero, marquee, navigation |
| US2 | P1 | Terminal User - Full terminal functionality with commands |
| US3 | P2 | Chat User - AI chat with SSE streaming |
| US4 | P2 | 3D Experience - Terminal canvas with effects |
| US5 | P3 | Returning Visitor - Data persistence across sessions |

---

## Phase 1: Setup

**Goal:** Initialize Next.js alongside Vite for incremental migration

- [X] T001 Install Next.js and eslint-config-next dependencies via `npm install next@latest && npm install -D eslint-config-next`
- [X] T002 [P] Create Next.js configuration file at `next.config.js` with Three.js transpilation
- [X] T003 [P] Create environment variables file at `.env.local` with Lambda and shortener API URLs
- [X] T004 Update TypeScript configuration in `tsconfig.json` for Next.js compatibility and path aliases
- [X] T005 Update scripts in `package.json` to add Next.js dev/build/start while keeping Vite as fallback

---

## Phase 2: Foundational

**Goal:** Create core Next.js app structure that all routes depend on

- [X] T006 Create app directory structure with `mkdir -p app/{terminal,chat,idea-generator,ideas,aboutme,blob,shorten}`
- [X] T007 Copy and adapt global styles from `src/index.css` to `app/globals.css`
- [X] T008 Create client-side providers wrapper with 'use client' directive in `app/providers.tsx`
- [X] T009 Create root layout with html/body, metadata, and providers in `app/layout.tsx`
- [X] T010 Create global loading state component in `app/loading.tsx`
- [X] T011 [P] Create 404 not-found page in `app/not-found.tsx`
- [X] T012 Verify 'use client' directive present in `src/context/KeypressedContext.tsx`

---

## Phase 3: First-Time Visitor (US1)

**Story Goal:** Users can access the home page and navigate to any section

**Independent Test Criteria:**
- Home page (/) renders with hero section, marquee, and project cards
- All navigation links work
- Responsive behavior maintained

### Tasks

- [X] T013 [US1] Add 'use client' directive to `src/screens/App.tsx` if using hooks
- [X] T014 [US1] Create home page in `app/page.tsx` importing App screen component
- [ ] T015 [US1] Verify marquee animation works in Next.js at `app/page.tsx`
- [X] T016 [US1] Update Link components in `src/screens/App.tsx` from React Router to next/link (change `to` to `href`)
- [X] T017 [US1] Create about page in `app/aboutme/page.tsx` importing AboutMe screen
- [X] T018 [P] [US1] Add 'use client' directive to `src/screens/AboutMe.tsx` if using hooks
- [ ] T019 [US1] Verify tab navigation works in AboutMe page

---

## Phase 4: Terminal User (US2)

**Story Goal:** Full terminal functionality with all 30+ commands working

**Independent Test Criteria:**
- Terminal page (/terminal) renders with boot sequence
- All terminal commands execute correctly
- Keyboard shortcuts work (arrows, tab, Ctrl+R, Ctrl+C)
- Vim editor overlay functions
- Code execution works (JavaScript/Python)

### Tasks

- [X] T020 [US2] Add 'use client' directive to `src/components/terminal/TerminalHandler.tsx`
- [X] T021 [P] [US2] Add 'use client' directive to `src/components/terminal/TerminalPrompt.tsx`
- [X] T022 [P] [US2] Add 'use client' directive to `src/components/terminal/TerminalOutput.tsx`
- [X] T023 [P] [US2] Add 'use client' directive to `src/components/terminal/TerminalSuggestions.tsx`
- [X] T024 [P] [US2] Add 'use client' directive to `src/components/terminal/ReverseSearchPrompt.tsx`
- [X] T025 [US2] Add 'use client' directive to `src/screens/Terminal.tsx`
- [X] T026 [US2] Create terminal page in `app/terminal/page.tsx` importing Terminal screen
- [ ] T027 [US2] Verify KeyPressContext works in terminal at `app/terminal/page.tsx`
- [ ] T028 [US2] Test filesystem commands (ls, cd, cat, mkdir) work correctly
- [ ] T029 [US2] Test git mock commands maintain state correctly
- [ ] T030 [US2] Test alias expansion works correctly
- [ ] T031 [US2] Test environment variable expansion works correctly
- [ ] T032 [US2] Verify arrow key history navigation works
- [ ] T033 [US2] Verify tab completion and suggestions work
- [ ] T034 [US2] Verify reverse search (Ctrl+R) works
- [ ] T035 [US2] Verify Ctrl+C interrupt works
- [X] T036 [US2] Update Vim editor to use dynamic import with ssr:false in `src/components/commands/vim/VimEditor.tsx`
- [ ] T037 [US2] Verify Vim editor overlay opens and saves files correctly
- [ ] T038 [US2] Verify JavaScript execution via Web Worker works
- [ ] T039 [US2] Verify Python execution via Pyodide works
- [ ] T040 [US2] Verify code execution timeout handling works

---

## Phase 5: Chat User (US3)

**Story Goal:** AI chat interface with SSE streaming works correctly

**Independent Test Criteria:**
- Chat page (/chat) renders
- Messages can be sent and received
- Streaming responses appear progressively
- Tool outputs render correctly

### Tasks

- [X] T041 [US3] Add 'use client' directive to `src/screens/ChatMe.tsx`
- [X] T042 [US3] Create chat page in `app/chat/page.tsx` importing ChatMe screen
- [X] T043 [US3] Update API endpoint to use NEXT_PUBLIC_LAMBDA_ENDPOINT env var in `src/screens/ChatMe.tsx`
- [ ] T044 [US3] Verify SSE streaming connection works
- [ ] T045 [US3] Verify progressive message rendering works
- [ ] T046 [US3] Verify tool execution display works
- [X] T047 [US3] Add 'use client' to all chat tool renderers in `src/components/chat/*.tsx`
- [ ] T048 [US3] Verify GitHub search renderer works
- [ ] T049 [US3] Verify Projects renderer works
- [ ] T050 [US3] Verify Web search renderer works
- [ ] T051 [US3] Verify chat session state persists within browser session

---

## Phase 6: 3D Experience (US4)

**Story Goal:** 3D terminal canvas renders with all visual effects

**Independent Test Criteria:**
- Blob page (/blob) renders 3D scene
- Post-processing effects work (bloom, scanlines)
- Camera controls work (orbit/zoom)
- Boot sequence animation plays
- Performance is acceptable (30+ FPS)

### Tasks

- [X] T052 [US4] Add 'use client' directive to `src/components/terminal/TerminalScene.tsx`
- [X] T053 [P] [US4] Add 'use client' directive to `src/components/terminal/TerminalCanvas.tsx`
- [X] T054 [P] [US4] Add 'use client' directive to `src/components/terminal/CRTEffects.tsx`
- [X] T055 [P] [US4] Add 'use client' directive to `src/components/terminal/AmbientEffects.tsx`
- [X] T056 [P] [US4] Add 'use client' directive to `src/components/terminal/BootSequence.tsx`
- [X] T057 [US4] Create blob page with dynamic import (ssr:false) in `app/blob/page.tsx`
- [ ] T058 [US4] Verify 3D canvas renders without errors
- [ ] T059 [US4] Verify bloom post-processing effect works
- [ ] T060 [US4] Verify scanline effect works
- [ ] T061 [US4] Verify distortion effect works
- [ ] T062 [US4] Verify OrbitControls work for camera
- [ ] T063 [US4] Verify boot sequence animation plays on load
- [ ] T064 [US4] Verify particle effects animate smoothly
- [ ] T065 [US4] Verify FPS is 30+ on modern devices

---

## Phase 7: Returning Visitor / Persistence (US5)

**Story Goal:** User data persists across page refreshes and browser sessions

**Independent Test Criteria:**
- All localStorage data persists
- No hydration errors with stored data
- Theme/color preferences persist

### Tasks

- [X] T066 [US5] Create URL shortener page in `app/shorten/page.tsx` importing UrlShortener screen
- [X] T067 [P] [US5] Add 'use client' directive to `src/screens/UrlShortener.tsx`
- [X] T068 [US5] Create ideas library page in `app/ideas/page.tsx` importing IdeaLibrary screen
- [X] T069 [P] [US5] Add 'use client' directive to `src/screens/IdeaLibrary.tsx`
- [X] T070 [US5] Create idea generator page in `app/idea-generator/page.tsx` importing IdeaGenerator screen
- [X] T071 [P] [US5] Add 'use client' directive to `src/screens/IdeaGenerator.tsx`
- [ ] T072 [US5] Verify filesystem state restores after page refresh
- [ ] T073 [US5] Verify git state restores after page refresh
- [ ] T074 [US5] Verify aliases restore after page refresh
- [ ] T075 [US5] Verify environment variables restore after page refresh
- [ ] T076 [US5] Verify saved ideas restore after page refresh
- [ ] T077 [US5] Verify color/theme preferences restore after page refresh
- [ ] T078 [US5] Verify command history is available after returning to terminal
- [ ] T079 [US5] Verify no hydration mismatch warnings in console

---

## Phase 8: Navigation & React Router Removal

**Goal:** Replace React Router with Next.js native routing

- [X] T080 Search and update all `import { Link } from 'react-router-dom'` to `import Link from 'next/link'`
- [X] T081 Search and update all `<Link to=` to `<Link href=` across all components
- [X] T082 Search and update all `useNavigate()` to `useRouter()` from 'next/navigation'
- [X] T083 Update all `navigate('/path')` calls to `router.push('/path')`
- [X] T084 Remove BrowserRouter wrapper from `src/main.tsx` or entry point
- [X] T085 Remove route definitions from `src/main.tsx` or routing file
- [X] T086 Uninstall react-router dependencies via `npm uninstall react-router-dom react-router`

---

## Phase 9: Cleanup & Vite Removal

**Goal:** Remove Vite and finalize Next.js setup

- [X] T087 Uninstall Vite dependencies via `npm uninstall vite @vitejs/plugin-react`
- [X] T088 Delete Vite configuration file `vite.config.ts`
- [X] T089 Update `package.json` scripts to remove Vite commands
- [X] T090 Update ESLint configuration to extend eslint-config-next in `.eslintrc` or `eslint.config.js`
- [X] T091 [P] Remove any Vite-specific imports or plugins from codebase
- [X] T092 Verify all import paths use @ alias correctly

---

## Phase 10: Testing & Verification

**Goal:** Ensure all functionality works correctly

- [ ] T093 Update test configuration to mock next/navigation in `vitest.config.ts`
- [ ] T094 Update any React Router mocks in test files to use next/navigation
- [ ] T095 Run existing test suite and fix failing tests
- [X] T096 Manual test: Verify all 8 routes are accessible
- [ ] T097 Manual test: Verify no console errors in development
- [ ] T098 Manual test: Verify no hydration warnings
- [ ] T099 Manual test: Verify responsive design works on mobile
- [ ] T100 Manual test: Verify keyboard shortcuts work throughout app
- [X] T101 Run `npm run build` and verify successful production build
- [X] T102 Run `npm start` and verify production server works
- [ ] T103 Run Lighthouse audit and verify 80+ score on mobile
- [X] T104 Verify no TypeScript errors in build output

---

## Dependencies

```
Phase 1 (Setup)
    └── Phase 2 (Foundational)
            ├── Phase 3 (US1: First-Time Visitor)
            ├── Phase 4 (US2: Terminal User)
            ├── Phase 5 (US3: Chat User)
            ├── Phase 6 (US4: 3D Experience)
            └── Phase 7 (US5: Persistence)
                    └── Phase 8 (Navigation Cleanup)
                            └── Phase 9 (Vite Removal)
                                    └── Phase 10 (Testing)
```

### Task Dependencies

| Task | Depends On | Notes |
|------|------------|-------|
| T006-T012 | T001-T005 | Core structure needs setup |
| T013-T019 | T006-T012 | US1 needs core structure |
| T020-T040 | T006-T012 | US2 needs core structure |
| T041-T051 | T006-T012 | US3 needs core structure |
| T052-T065 | T006-T012 | US4 needs core structure |
| T066-T079 | T006-T012 | US5 needs core structure |
| T080-T086 | T013-T079 | Navigation cleanup after all routes migrated |
| T087-T092 | T080-T086 | Vite removal after React Router removed |
| T093-T104 | T087-T092 | Testing after cleanup |

---

## Parallel Execution Examples

### Phase 1 (Setup) - Sequential
```
T001 → T002, T003 (parallel) → T004 → T005
```

### Phase 2 (Foundational) - Mixed
```
T006 → T007 → T008 → T009 → T010, T011 (parallel) → T012
```

### User Story Phases (US1-US5) - Can run in parallel after Phase 2
```
After Phase 2 complete:
  ├── Phase 3 (US1) - Independent
  ├── Phase 4 (US2) - Independent
  ├── Phase 5 (US3) - Independent
  ├── Phase 6 (US4) - Independent
  └── Phase 7 (US5) - Independent
```

### Within Phase 4 (US2 Terminal) - Parallel where marked
```
T020 → T021-T024 (parallel) → T025 → T026 → T027 → T028-T040 (mostly sequential)
```

---

## Implementation Strategy

### MVP Scope (Recommended)
**Phase 1 + Phase 2 + Phase 3 (US1)**
- Get Next.js running with home page
- Validates setup and foundational work
- Lowest risk, fastest feedback

### Incremental Delivery
1. **MVP**: Setup + Foundational + US1 (Home)
2. **Core**: US2 (Terminal) - Most complex, highest value
3. **Features**: US3 (Chat) + US4 (3D) + US5 (Persistence)
4. **Cleanup**: Navigation + Vite Removal + Testing

### Risk Mitigation
- Keep Vite running until Phase 9
- Test each user story independently before proceeding
- Commit after each phase completion

---

## Completion Checklist

- [ ] All 104 tasks completed
- [ ] All 8 routes accessible and functional
- [ ] 100% terminal command parity
- [ ] Chat SSE streaming works
- [ ] 3D canvas renders with effects
- [ ] Data persistence verified
- [ ] No console errors
- [ ] All tests passing
- [ ] Lighthouse 80+ on mobile
- [ ] Production build successful

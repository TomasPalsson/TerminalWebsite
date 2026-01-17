# Implementation Plan: Next.js Migration

## Constitution Check

Before implementation, verify alignment with principles:

| Principle | Approach |
|-----------|----------|
| Documentation | All migration decisions documented in research.md; component boundaries clearly defined in contracts |
| Extensibility | Next.js App Router enables better code splitting and future API routes; modular page structure |
| Type Safety | All existing TypeScript types preserved; routing contract adds type-safe route definitions |
| Separation | Clear client/server component boundaries; providers isolated from layouts |
| Style | Terminal-first dark aesthetic preserved; Tailwind configuration migrated 1:1 |

---

## Implementation Steps

### Phase 1: Project Setup

**Goal:** Initialize Next.js alongside Vite for incremental migration

- [ ] 1.1 Install Next.js and related dependencies
  ```bash
  npm install next@latest
  npm install -D eslint-config-next
  ```

- [ ] 1.2 Create `next.config.js` with Three.js transpilation
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    transpilePackages: ['three'],
  }
  module.exports = nextConfig
  ```

- [ ] 1.3 Update `tsconfig.json` for Next.js compatibility
  - Add `"moduleResolution": "bundler"` or keep `"node"`
  - Ensure path aliases work with `@/*`

- [ ] 1.4 Update `package.json` scripts
  - Keep Vite scripts as fallback during migration
  - Add Next.js dev/build/start scripts

- [ ] 1.5 Create `.env.local` for environment variables
  ```
  NEXT_PUBLIC_LAMBDA_ENDPOINT=https://4tbqtollh37e7h22fwcwwrj7pa0kwbhe.lambda-url.eu-west-1.on.aws/
  NEXT_PUBLIC_SHORTENER_API=https://t0mas.io
  ```

---

### Phase 2: Core App Structure

**Goal:** Create the Next.js app directory with root layout and providers

- [ ] 2.1 Create `app/` directory structure
  ```
  app/
  ├── layout.tsx
  ├── page.tsx
  ├── globals.css
  ├── providers.tsx
  ├── loading.tsx
  └── not-found.tsx
  ```

- [ ] 2.2 Copy and adapt global styles
  - Copy `src/index.css` to `app/globals.css`
  - Ensure font imports work (JetBrains Mono, Winky Sans)
  - Verify CSS variable `--terminal` is defined

- [ ] 2.3 Create root layout (`app/layout.tsx`)
  - Set up html/body with dark background
  - Import providers wrapper
  - Add metadata export for SEO

- [ ] 2.4 Create client providers wrapper (`app/providers.tsx`)
  - Add `'use client'` directive
  - Wrap KeyPressProvider
  - Export Providers component

- [ ] 2.5 Create global loading state (`app/loading.tsx`)
  - Terminal-styled loading indicator
  - Matches existing LoadingFallback component

---

### Phase 3: Static/Simple Pages

**Goal:** Migrate pages with minimal interactivity first

- [ ] 3.1 Create home page (`app/page.tsx`)
  - Import existing App.tsx content
  - Mark as client component if using hooks
  - Verify marquee animation works

- [ ] 3.2 Create about page (`app/aboutme/page.tsx`)
  - Import AboutMe screen component
  - Can be server component with client islands
  - Test tab navigation

- [ ] 3.3 Create URL shortener page (`app/shorten/page.tsx`)
  - Import UrlShortener screen
  - Mark as client component (form state)
  - Verify API calls work

- [ ] 3.4 Create ideas library page (`app/ideas/page.tsx`)
  - Import IdeaLibrary screen
  - Mark as client component (localStorage)
  - Test idea persistence

- [ ] 3.5 Create idea generator page (`app/idea-generator/page.tsx`)
  - Import IdeaGenerator screen
  - Mark as client component
  - Verify AI generation works

---

### Phase 4: Terminal System

**Goal:** Migrate the core terminal functionality

- [ ] 4.1 Add `'use client'` to all terminal components
  - TerminalHandler.tsx
  - TerminalPrompt.tsx
  - TerminalOutput.tsx
  - TerminalSuggestions.tsx
  - ReverseSearchPrompt.tsx

- [ ] 4.2 Create terminal page (`app/terminal/page.tsx`)
  - Import Terminal screen as client component
  - Ensure KeyPressContext works

- [ ] 4.3 Verify command execution
  - Test filesystem commands (ls, cd, cat, mkdir)
  - Test git mock commands
  - Test alias expansion
  - Test environment variable expansion

- [ ] 4.4 Verify keyboard handling
  - Arrow keys for history navigation
  - Tab for completion
  - Ctrl+R for reverse search
  - Ctrl+C for interrupt

- [ ] 4.5 Verify Vim editor overlay
  - Dynamic import with ssr: false for CodeMirror
  - Test file editing and saving

- [ ] 4.6 Verify code execution
  - JavaScript execution via Web Worker
  - Python execution via Pyodide
  - Test timeout handling

---

### Phase 5: Chat System

**Goal:** Migrate chat interface with SSE streaming

- [ ] 5.1 Create chat page (`app/chat/page.tsx`)
  - Import ChatMe screen as client component
  - Verify AWS Lambda endpoint connection

- [ ] 5.2 Verify SSE streaming
  - Test progressive message rendering
  - Test tool execution display
  - Test session state

- [ ] 5.3 Verify tool renderers
  - GitHub search renderer
  - Projects renderer
  - Web search renderer
  - Other tool outputs

---

### Phase 6: 3D Canvas

**Goal:** Migrate Three.js/React Three Fiber components

- [ ] 6.1 Create blob page with dynamic import (`app/blob/page.tsx`)
  ```tsx
  import dynamic from 'next/dynamic'

  const TerminalCanvas = dynamic(
    () => import('@/screens/TerminalCanvas'),
    { ssr: false, loading: () => <LoadingComponent /> }
  )
  ```

- [ ] 6.2 Add `'use client'` to 3D components
  - TerminalScene.tsx
  - TerminalCanvas.tsx
  - CRTEffects.tsx
  - AmbientEffects.tsx
  - BootSequence.tsx

- [ ] 6.3 Verify 3D rendering
  - Canvas renders without errors
  - Post-processing effects work (bloom, scanlines)
  - OrbitControls work
  - Boot sequence animation plays

- [ ] 6.4 Verify performance
  - FPS is acceptable (30+)
  - No memory leaks
  - PerformanceMonitor adaptive quality

---

### Phase 7: Navigation Updates

**Goal:** Replace React Router with Next.js navigation

- [ ] 7.1 Update all Link components
  - Change `to` prop to `href`
  - Import from `next/link`

- [ ] 7.2 Update programmatic navigation
  - Replace `useNavigate()` with `useRouter()`
  - Import from `next/navigation`

- [ ] 7.3 Remove React Router
  ```bash
  npm uninstall react-router-dom react-router
  ```

- [ ] 7.4 Delete React Router configuration
  - Remove route definitions from index/main files
  - Remove BrowserRouter wrapper

---

### Phase 8: Cleanup & Vite Removal

**Goal:** Remove Vite and finalize Next.js setup

- [ ] 8.1 Remove Vite dependencies
  ```bash
  npm uninstall vite @vitejs/plugin-react
  ```

- [ ] 8.2 Delete Vite configuration files
  - vite.config.ts
  - Any Vite-specific config

- [ ] 8.3 Update package.json scripts
  - Remove Vite scripts
  - Set Next.js scripts as default

- [ ] 8.4 Update ESLint configuration
  - Extend eslint-config-next
  - Remove any Vite-specific rules

- [ ] 8.5 Clean up imports
  - Remove any Vite-specific imports
  - Verify all paths use @ alias correctly

---

### Phase 9: Testing & Verification

**Goal:** Ensure all functionality works correctly

- [ ] 9.1 Update test configuration for Next.js
  - Mock next/navigation in tests
  - Update any React Router mocks

- [ ] 9.2 Run existing test suite
  - Fix any failing tests
  - Update assertions if needed

- [ ] 9.3 Manual testing checklist
  - All 8 routes accessible
  - Terminal commands work
  - Chat streaming works
  - 3D canvas renders
  - localStorage persists
  - Keyboard shortcuts work

- [ ] 9.4 Performance verification
  - Run Lighthouse audit
  - Check bundle sizes
  - Verify no hydration errors

- [ ] 9.5 Build verification
  - `npm run build` succeeds
  - `npm start` serves correctly
  - No TypeScript errors

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `next.config.js` | Create | Next.js configuration with Three.js transpilation |
| `app/layout.tsx` | Create | Root layout with providers wrapper |
| `app/providers.tsx` | Create | Client-side context providers |
| `app/globals.css` | Create | Global styles (copy from src/index.css) |
| `app/page.tsx` | Create | Home page |
| `app/loading.tsx` | Create | Global loading state |
| `app/not-found.tsx` | Create | 404 page |
| `app/terminal/page.tsx` | Create | Terminal route |
| `app/chat/page.tsx` | Create | Chat route |
| `app/idea-generator/page.tsx` | Create | Idea generator route |
| `app/ideas/page.tsx` | Create | Ideas library route |
| `app/aboutme/page.tsx` | Create | About page route |
| `app/blob/page.tsx` | Create | 3D canvas route with dynamic import |
| `app/shorten/page.tsx` | Create | URL shortener route |
| `.env.local` | Create | Environment variables |
| `tsconfig.json` | Modify | Next.js compatibility |
| `package.json` | Modify | Update scripts, dependencies |
| `src/screens/*.tsx` | Modify | Add 'use client' where needed |
| `src/components/terminal/*.tsx` | Modify | Add 'use client' to all |
| `src/context/KeypressedContext.tsx` | Modify | Ensure 'use client' present |
| `vite.config.ts` | Delete | Remove after migration |

---

## Testing Strategy

### Unit Tests
- [ ] Verify existing hook tests pass (useCommandHistory, useReverseSearch, useTabCompletion)
- [ ] Verify utility tests pass (colorPersistence, textExtraction)
- [ ] Mock next/navigation for any navigation-dependent tests

### Integration Tests
- [ ] Terminal command execution flows
- [ ] Chat message sending and receiving
- [ ] localStorage persistence across navigation

### Manual Verification
- [ ] All routes render correctly
- [ ] No console errors in development
- [ ] No hydration warnings
- [ ] Responsive design works
- [ ] Keyboard shortcuts functional

### Performance Tests
- [ ] Lighthouse score 80+ on mobile
- [ ] First Contentful Paint under 2s
- [ ] No layout shift issues

---

## Rollback Plan

If critical issues arise during migration:

1. **Keep Vite scripts** available during development phase
   - `npm run dev:vite` continues to work until Phase 8

2. **Git branch strategy**
   - All changes on `1-nextjs-migration` branch
   - `main` branch remains unchanged until verified

3. **Incremental commits**
   - Commit after each phase completion
   - Easy to revert specific changes

4. **Full rollback**
   - Checkout `main` branch
   - Delete migration branch if needed
   - No changes to production until fully verified

---

## Success Criteria Verification

| Criterion | Verification Method |
|-----------|---------------------|
| All 8 routes accessible | Manual navigation test |
| 100% terminal command parity | Test each command type |
| Chat streaming works | Send test messages, verify output |
| 3D canvas renders | Navigate to /blob, verify WebGL |
| Data persistence | Store data, refresh, verify present |
| No production errors | Check browser console |
| Tests pass | Run `npm test` |
| Performance 80+ | Run Lighthouse audit |

---

## Estimated Complexity

| Phase | Complexity | Dependencies |
|-------|------------|--------------|
| Phase 1: Setup | Low | None |
| Phase 2: Core Structure | Low | Phase 1 |
| Phase 3: Static Pages | Low | Phase 2 |
| Phase 4: Terminal | High | Phase 2 |
| Phase 5: Chat | Medium | Phase 2 |
| Phase 6: 3D Canvas | Medium | Phase 2 |
| Phase 7: Navigation | Medium | Phases 3-6 |
| Phase 8: Cleanup | Low | Phase 7 |
| Phase 9: Testing | Medium | Phase 8 |

**Critical Path:** Phases 1 → 2 → 4 (Terminal is core functionality)

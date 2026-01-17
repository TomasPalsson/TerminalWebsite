# Research: Next.js Migration

## Overview

This document consolidates technical research for migrating the Terminal Portfolio from React/Vite to Next.js App Router.

---

## 1. Project Structure & Routing

### Decision: Use Next.js 14+ App Router with file-based routing

**Rationale:**
- App Router is the recommended approach for new Next.js projects
- File-based routing eliminates need for React Router configuration
- Supports React 19 features and Server Components
- Built-in code splitting per route

**Directory Structure:**
```
app/
├── layout.tsx              # Root layout (html, body, providers)
├── page.tsx                # Home (/) - currently App.tsx
├── terminal/
│   └── page.tsx            # /terminal
├── chat/
│   └── page.tsx            # /chat
├── idea-generator/
│   └── page.tsx            # /idea-generator
├── ideas/
│   └── page.tsx            # /ideas (IdeaLibrary)
├── aboutme/
│   └── page.tsx            # /aboutme
├── blob/
│   └── page.tsx            # /blob (TerminalCanvas)
├── shorten/
│   └── page.tsx            # /shorten (UrlShortener)
└── globals.css             # Tailwind styles
```

**Alternatives Considered:**
- Pages Router: Legacy approach, less flexible for streaming/RSC
- Keep React Router: Would require `'use client'` everywhere, loses SSR benefits

---

## 2. Client vs Server Components

### Decision: Push `'use client'` as far down the tree as possible

**Rationale:**
- Server Components are the default in App Router
- Only components using browser APIs, state, or effects need `'use client'`
- Smaller client bundles improve performance

**Component Classification:**

| Component Type | Directive | Reason |
|----------------|-----------|--------|
| Page wrappers (app/*/page.tsx) | Server | Can import client components |
| KeyPressProvider, contexts | Client | useState, useEffect, event listeners |
| Terminal screens | Client | Keyboard events, DOM APIs |
| Three.js/R3F components | Client | WebGL, browser APIs |
| CodeMirror/Vim editor | Client | DOM manipulation |
| Static content (AboutMe sections) | Server | No interactivity needed |

**Pattern:**
```tsx
// app/terminal/page.tsx (Server Component)
import TerminalClient from '@/components/terminal/TerminalClient'

export default function TerminalPage() {
  return <TerminalClient />
}
```

---

## 3. Three.js / React Three Fiber Integration

### Decision: Use `next/dynamic` with `ssr: false` for all 3D components

**Rationale:**
- Three.js requires browser APIs (WebGL context, window)
- Dynamic import prevents SSR hydration errors
- Loading states provide good UX during initialization

**Configuration Required:**
```javascript
// next.config.js
const nextConfig = {
  transpilePackages: ['three']
}
```

**Loading Pattern:**
```tsx
import dynamic from 'next/dynamic'

const TerminalCanvas = dynamic(
  () => import('@/components/terminal/TerminalCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-black">
        <span className="font-mono text-terminal animate-pulse">
          Loading 3D...
        </span>
      </div>
    )
  }
)
```

**Post-Processing:**
- Use `@react-three/postprocessing` with EffectComposer
- Bloom, Vignette, Noise effects are compatible
- Use `PerformanceMonitor` for adaptive quality

**Alternatives Considered:**
- Conditional rendering with `typeof window`: Still causes hydration issues
- Lazy loading only: Doesn't prevent SSR attempts

---

## 4. localStorage and Browser APIs

### Decision: Use useEffect for all localStorage access with loading states

**Rationale:**
- localStorage is not available during SSR
- useEffect guarantees code runs only on client
- Consistent initial state prevents hydration mismatches

**Anti-Pattern to Avoid:**
```tsx
// DON'T DO THIS - causes hydration mismatch
const [value, setValue] = useState(
  typeof window !== 'undefined' ? localStorage.getItem('key') : 'default'
)
```

**Correct Pattern:**
```tsx
'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const item = localStorage.getItem(key)
    if (item) {
      setStoredValue(JSON.parse(item))
    }
    setIsLoaded(true)
  }, [key])

  const setValue = (value: T) => {
    setStoredValue(value)
    localStorage.setItem(key, JSON.stringify(value))
  }

  return [storedValue, setValue, isLoaded] as const
}
```

**Affected Services:**
- `src/services/filesystem.ts` (STORAGE_KEY = 'terminal-fs')
- `src/services/git.ts` (STORAGE_KEY = 'terminal-git')
- `src/services/alias.ts` (STORAGE_KEY = 'terminal-aliases')
- `src/services/env.ts` (STORAGE_KEY = 'terminal-env')
- Idea storage, color persistence

---

## 5. Global State & Context Providers

### Decision: Create client-side providers wrapper in root layout

**Rationale:**
- Context providers use React hooks (useState, useEffect)
- Must be wrapped in `'use client'` directive
- Root layout stays as Server Component

**Implementation:**
```tsx
// app/providers.tsx
'use client'

import { KeyPressProvider } from '@/context/KeypressedContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return <KeyPressProvider>{children}</KeyPressProvider>
}
```

```tsx
// app/layout.tsx (Server Component)
import { Providers } from './providers'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

## 6. Web Workers for Code Execution

### Decision: Use native Worker syntax with `import.meta.url`

**Rationale:**
- Next.js supports Web Workers with `import.meta.url` pattern
- No additional webpack configuration needed
- Maintains existing execution isolation

**Pattern:**
```tsx
'use client'

import { useEffect, useRef } from 'react'

export function useCodeExecutor() {
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/executor.worker.ts', import.meta.url)
    )
    return () => workerRef.current?.terminate()
  }, [])

  const execute = (code: string) => {
    workerRef.current?.postMessage({ code })
  }

  return { execute }
}
```

**Worker File Location:**
- Keep in `src/workers/` or move to `public/workers/`
- Use relative URLs with `import.meta.url`

---

## 7. Navigation Updates

### Decision: Replace React Router with Next.js native routing

**Replacements:**

| React Router | Next.js |
|--------------|---------|
| `useNavigate()` | `useRouter()` from `next/navigation` |
| `<Link to="/path">` | `<Link href="/path">` from `next/link` |
| `useParams()` | `useParams()` from `next/navigation` |
| `useSearchParams()` | `useSearchParams()` from `next/navigation` |
| `<Routes>/<Route>` | File-based routing |
| `lazy(() => import())` | `next/dynamic` |

**Example:**
```tsx
// Before (React Router)
import { useNavigate, Link } from 'react-router-dom'
const navigate = useNavigate()
navigate('/terminal')

// After (Next.js)
import { useRouter } from 'next/navigation'
import Link from 'next/link'
const router = useRouter()
router.push('/terminal')
```

---

## 8. Build & Configuration

### Decision: Standard Next.js configuration with Three.js transpilation

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  // Preserve existing terser-like behavior
  swcMinify: true,
  // Environment variables
  env: {
    NEXT_PUBLIC_LAMBDA_ENDPOINT: process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT,
    NEXT_PUBLIC_SHORTENER_API: process.env.NEXT_PUBLIC_SHORTENER_API,
  }
}

module.exports = nextConfig
```

**Package Changes:**

Add:
- `next`
- `eslint-config-next`

Remove:
- `vite`
- `@vitejs/plugin-react`
- `react-router-dom`
- `react-router`

---

## 9. Testing Considerations

### Decision: Keep Vitest with Next.js compatible configuration

**Rationale:**
- Existing tests use Vitest
- Vitest works with Next.js (not just Jest)
- Minimal configuration changes needed

**Updates Required:**
- Update module resolution for Next.js path aliases
- Mock `next/navigation` hooks in tests
- Add `@testing-library/react` setup for App Router

---

## Migration Order

Based on dependencies and complexity:

1. **Initialize Next.js** - Add dependencies, create config
2. **Root Layout** - app/layout.tsx with providers
3. **Static Pages** - AboutMe, Ideas (least interactive)
4. **Terminal System** - Most complex, needs client wrapper
5. **Chat System** - SSE streaming, client-only
6. **3D Canvas** - Dynamic import with ssr: false
7. **Remove Vite** - Clean up old config
8. **Testing** - Update and verify all tests

# Quickstart: Next.js Migration

## Prerequisites

- Node.js 18.17 or later
- Existing React/Vite codebase
- Git for version control

## Migration Steps Overview

```
1. Initialize Next.js (keep Vite running)
2. Create app directory structure
3. Migrate components incrementally
4. Remove Vite and React Router
5. Test and verify
```

---

## Step 1: Initialize Next.js

```bash
# Install Next.js alongside existing dependencies
npm install next@latest

# Install ESLint config for Next.js
npm install -D eslint-config-next

# Add Next.js scripts to package.json
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "dev:vite": "vite",
    "build:vite": "vite build"
  }
}
```

---

## Step 2: Create Next.js Configuration

Create `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
}

module.exports = nextConfig
```

---

## Step 3: Create App Directory Structure

```bash
mkdir -p app/{terminal,chat,idea-generator,ideas,aboutme,blob,shorten}
```

Expected structure:
```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page
├── globals.css         # Tailwind styles
├── providers.tsx       # Client-side providers
├── terminal/page.tsx
├── chat/page.tsx
├── idea-generator/page.tsx
├── ideas/page.tsx
├── aboutme/page.tsx
├── blob/page.tsx
└── shorten/page.tsx
```

---

## Step 4: Create Root Layout

`app/layout.tsx`:
```tsx
import { Providers } from './providers'
import './globals.css'

export const metadata = {
  title: 'Terminal Portfolio',
  description: 'Interactive terminal-themed portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

`app/providers.tsx`:
```tsx
'use client'

import { KeyPressProvider } from '@/context/KeypressedContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return <KeyPressProvider>{children}</KeyPressProvider>
}
```

---

## Step 5: Configure Path Aliases

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Step 6: Copy Global Styles

Copy `src/index.css` to `app/globals.css`:
```bash
cp src/index.css app/globals.css
```

---

## Step 7: Migrate Pages (Order Matters)

### 7a. Static Pages First (AboutMe)

`app/aboutme/page.tsx`:
```tsx
import AboutMeClient from '@/screens/AboutMe'

export default function AboutMePage() {
  return <AboutMeClient />
}
```

### 7b. Interactive Pages (Terminal, Chat)

`app/terminal/page.tsx`:
```tsx
import TerminalClient from '@/screens/Terminal'

export default function TerminalPage() {
  return <TerminalClient />
}
```

Add `'use client'` to screen files that don't have it.

### 7c. 3D Pages (Blob) - Use Dynamic Import

`app/blob/page.tsx`:
```tsx
import dynamic from 'next/dynamic'

const TerminalCanvas = dynamic(
  () => import('@/screens/TerminalCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-black">
        <span className="font-mono text-terminal animate-pulse">
          Loading 3D...
        </span>
      </div>
    ),
  }
)

export default function BlobPage() {
  return <TerminalCanvas />
}
```

---

## Step 8: Update Navigation

Replace React Router imports:

```tsx
// Before
import { useNavigate, Link } from 'react-router-dom'

// After
import { useRouter } from 'next/navigation'
import Link from 'next/link'
```

Replace navigation calls:
```tsx
// Before
const navigate = useNavigate()
navigate('/terminal')

// After
const router = useRouter()
router.push('/terminal')
```

Update Link components:
```tsx
// Before
<Link to="/terminal">Terminal</Link>

// After
<Link href="/terminal">Terminal</Link>
```

---

## Step 9: Remove Old Dependencies

```bash
npm uninstall react-router-dom react-router vite @vitejs/plugin-react
```

Delete Vite config files:
```bash
rm vite.config.ts vite.config.js
```

---

## Step 10: Verify Build

```bash
# Run development server
npm run dev

# Test production build
npm run build
npm start
```

---

## Verification Checklist

- [ ] All 8 routes accessible
- [ ] Terminal commands work
- [ ] Chat SSE streaming works
- [ ] 3D canvas renders
- [ ] localStorage data persists
- [ ] Keyboard shortcuts work
- [ ] No hydration errors in console
- [ ] No TypeScript errors

---

## Common Issues

### Hydration Mismatch
**Cause:** localStorage accessed during render
**Fix:** Use useEffect for all localStorage reads

### Three.js Errors
**Cause:** SSR attempting to run WebGL code
**Fix:** Use `dynamic(() => import(...), { ssr: false })`

### Context Not Available
**Cause:** Missing 'use client' directive
**Fix:** Add 'use client' to provider and consumer components

### Router Not Found
**Cause:** React Router imports not updated
**Fix:** Replace with next/navigation imports

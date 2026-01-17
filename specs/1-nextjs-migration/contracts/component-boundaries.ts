/**
 * Component Boundaries Contract for Next.js Migration
 *
 * Defines which components must be Client Components ('use client')
 * and which can remain as Server Components.
 */

/**
 * Components that MUST use 'use client' directive.
 * These use browser APIs, React hooks with side effects, or event handlers.
 */
export const CLIENT_COMPONENTS = [
  // Context Providers
  'src/context/KeypressedContext.tsx',

  // Terminal System
  'src/components/terminal/TerminalHandler.tsx',
  'src/components/terminal/TerminalPrompt.tsx',
  'src/components/terminal/TerminalOutput.tsx',
  'src/components/terminal/TerminalSuggestions.tsx',
  'src/components/terminal/ReverseSearchPrompt.tsx',

  // 3D Components (must also use next/dynamic with ssr: false)
  'src/components/terminal/TerminalScene.tsx',
  'src/components/terminal/TerminalCanvas.tsx',
  'src/components/terminal/CRTEffects.tsx',
  'src/components/terminal/AmbientEffects.tsx',
  'src/components/terminal/BootSequence.tsx',

  // Screens with heavy interactivity
  'src/screens/Terminal.tsx',
  'src/screens/ChatMe.tsx',
  'src/screens/IdeaGenerator.tsx',
  'src/screens/IdeaLibrary.tsx',
  'src/screens/UrlShortener.tsx',

  // Code Editor
  'src/components/commands/vim/VimEditor.tsx',

  // All command implementations (use context)
  'src/components/commands/*.tsx',

  // Chat components
  'src/components/chat/*.tsx',
] as const

/**
 * Components that CAN be Server Components.
 * These are purely presentational with no browser API usage.
 */
export const SERVER_COMPATIBLE_COMPONENTS = [
  // Static UI components
  'src/components/buttons/*.tsx',
  'src/components/loaders/*.tsx',

  // Static content sections
  'src/screens/AboutMe.tsx',  // Can be server with client islands
  'src/screens/App.tsx',      // Landing page - mostly static
] as const

/**
 * Components requiring dynamic import with ssr: false.
 * These have hard dependencies on browser-only APIs at import time.
 */
export const SSR_DISABLED_COMPONENTS = [
  // Three.js components
  'src/components/terminal/TerminalCanvas.tsx',
  'src/components/terminal/TerminalScene.tsx',

  // CodeMirror
  'src/components/commands/vim/VimEditor.tsx',
] as const

/**
 * Pattern for wrapping client components in page files.
 *
 * @example
 * // app/terminal/page.tsx (Server Component)
 * import TerminalClient from '@/components/terminal/TerminalClient'
 *
 * export default function TerminalPage() {
 *   return <TerminalClient />
 * }
 *
 * // components/terminal/TerminalClient.tsx
 * 'use client'
 * // ... actual implementation
 */
export interface ClientWrapperPattern {
  pageFile: string      // app/*/page.tsx - Server Component
  clientWrapper: string // components/*Client.tsx - Client Component
}

/**
 * Dynamic import pattern for SSR-disabled components.
 *
 * @example
 * import dynamic from 'next/dynamic'
 *
 * const TerminalCanvas = dynamic(
 *   () => import('@/components/terminal/TerminalCanvas'),
 *   { ssr: false, loading: () => <LoadingFallback /> }
 * )
 */
export interface DynamicImportPattern {
  component: string
  ssrDisabled: true
  loadingComponent: string
}

/**
 * Hooks that access browser APIs - must be used only in Client Components.
 */
export const BROWSER_DEPENDENT_HOOKS = [
  'useCommandHistory',     // localStorage for persistence
  'useTabCompletion',      // keyboard events
  'useReverseSearch',      // keyboard events
  'useKeyClick',           // window event listeners
] as const

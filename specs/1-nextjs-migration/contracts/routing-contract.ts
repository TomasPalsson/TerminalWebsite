/**
 * Routing Contract for Next.js Migration
 *
 * This contract defines the routing structure that must be preserved
 * during the migration from React Router to Next.js App Router.
 */

/**
 * All routes that must exist in the Next.js app directory.
 * Each route maps to a page.tsx file.
 */
export const REQUIRED_ROUTES = [
  '/',                    // app/page.tsx - Landing/Home
  '/terminal',            // app/terminal/page.tsx - Terminal emulator
  '/chat',                // app/chat/page.tsx - AI chat interface
  '/idea-generator',      // app/idea-generator/page.tsx - Idea generation
  '/ideas',               // app/ideas/page.tsx - Idea library
  '/aboutme',             // app/aboutme/page.tsx - About/profile
  '/blob',                // app/blob/page.tsx - 3D terminal canvas
  '/shorten',             // app/shorten/page.tsx - URL shortener
] as const

export type AppRoute = (typeof REQUIRED_ROUTES)[number]

/**
 * Route metadata for SEO and component classification.
 */
export interface RouteConfig {
  path: AppRoute
  title: string
  description: string
  renderStrategy: 'server' | 'client' | 'dynamic'
  requiresAuth: false  // No auth in current app
}

export const ROUTE_CONFIGS: RouteConfig[] = [
  {
    path: '/',
    title: 'Terminal Portfolio',
    description: 'Interactive terminal-themed portfolio',
    renderStrategy: 'server',  // SEO-friendly landing
    requiresAuth: false,
  },
  {
    path: '/terminal',
    title: 'Terminal',
    description: 'Interactive terminal emulator',
    renderStrategy: 'client',  // Heavy keyboard interaction
    requiresAuth: false,
  },
  {
    path: '/chat',
    title: 'Chat',
    description: 'AI-powered chat assistant',
    renderStrategy: 'client',  // SSE streaming
    requiresAuth: false,
  },
  {
    path: '/idea-generator',
    title: 'Idea Generator',
    description: 'Generate project ideas',
    renderStrategy: 'client',  // Interactive generation
    requiresAuth: false,
  },
  {
    path: '/ideas',
    title: 'Ideas Library',
    description: 'Saved project ideas',
    renderStrategy: 'client',  // localStorage dependent
    requiresAuth: false,
  },
  {
    path: '/aboutme',
    title: 'About Me',
    description: 'Profile and experience',
    renderStrategy: 'server',  // Mostly static content
    requiresAuth: false,
  },
  {
    path: '/blob',
    title: '3D Terminal',
    description: '3D terminal experience',
    renderStrategy: 'dynamic',  // Three.js - ssr: false
    requiresAuth: false,
  },
  {
    path: '/shorten',
    title: 'URL Shortener',
    description: 'Shorten URLs',
    renderStrategy: 'client',  // Form interaction
    requiresAuth: false,
  },
]

/**
 * Navigation contract - internal links must work without full page reload.
 */
export interface NavigationContract {
  /**
   * Navigate to a route programmatically.
   * Must use Next.js router.push() instead of React Router navigate().
   */
  navigateTo: (path: AppRoute) => void

  /**
   * Get current route path.
   * Must use Next.js usePathname() instead of React Router useLocation().
   */
  currentPath: AppRoute | string
}

---
description: Ensure code matches the Terminal Portfolio style guide before writing or reviewing code
allowed-tools: ["Read", "Glob", "Grep"]
---

# Terminal Portfolio Style Enforcer

Before writing any code for this project, you MUST apply these styling rules. This ensures visual and architectural consistency with the terminal-themed portfolio.

## Design Philosophy

This is a **dark, terminal-first aesthetic** with high-contrast black backgrounds and neon green highlights. All UI should feel like a retro computing terminal with modern polish.

---

## Color System

### Primary Colors
- **Terminal Green**: `#22c55e` - The signature neon accent
  - CSS Variable: `var(--terminal)`
  - Tailwind: `text-terminal`, `bg-terminal`, `border-terminal`
- **True Black**: `#000` or `bg-black` - Terminal surfaces
- **Near Black**: `bg-neutral-950`, `bg-zinc-800` - Secondary surfaces

### Text Hierarchy
- **Primary Text**: White (`text-white`)
- **Secondary Text**: `text-gray-300`, `text-gray-200`
- **Muted Text**: `text-gray-500`
- **Accent/Emphasis**: `text-terminal` (neon green)

### Interactive States
- **Buttons**: `text-terminal` default, `hover:bg-terminal hover:text-black` on hover
- **Links**: `hover:text-terminal hover:underline`
- **Selection**: Green overlay via `::selection` (already configured)

### DO NOT
- Add new accent colors without a CSS variable
- Use gradients over terminal screens
- Use bright colors that clash with terminal green

---

## Typography

### Font Families
- **Monospace** (primary): `font-mono` - JetBrains Mono
  - Use for: terminal, buttons, code, system-like text
- **Sans-serif** (fallback): system defaults

### Font Sizes
- **Controls/Buttons**: `text-sm` to `text-base`
- **Terminal text**: `text-lg`
- **Hero/Display**: `text-4xl sm:text-5xl md:text-5xl lg:text-6xl`
- **Suggestions/Output**: `text-lg` to `text-xl`

### Usage Rules
- Apply `font-mono` to ALL terminal-related UI
- Use `text-terminal` for brand text and emphasis
- Keep line lengths tight for terminal feel

---

## Layout & Spacing

### Centering
```jsx
className="flex items-center justify-center h-screen"
```

### Common Spacing (Tailwind scale)
- **Gaps**: `gap-2`, `gap-4`
- **Padding**: `px-4`, `px-6`, `py-2`, `py-4`, `pt-6`
- **Margins**: `mt-4`, `mt-16`

### Container Rules
- Use padding (`px-4`) for width constraints, NOT fixed widths
- Avoid horizontal scroll (`overflow-x-hidden` is set globally)
- Full-screen sections use `h-screen`

---

## Component Patterns

### Buttons (Match MainButton.tsx)
```jsx
className="inline-flex items-center gap-2 px-4 py-2 font-mono text-sm transition rounded-sm text-terminal hover:bg-terminal hover:text-black"
```

### Cards
```jsx
className="border border-terminal/50 rounded-lg p-4 transition hover:shadow-lg"
// For glow effect:
className="shadow-[0_0_20px_rgba(34,197,94,0.08)]"
```

### Terminal Elements
- Black background: `bg-black`
- Green text: `text-terminal`
- Blinking cursor: `animate-cursor` (blink animation)
- Preserve whitespace: `whitespace-pre-wrap`

### Links
```jsx
className="text-terminal hover:underline"
// Or with border style:
className="border border-terminal/50 rounded-sm px-3 py-1 hover:bg-terminal hover:text-black"
```

### Rounded Corners
- **Subtle (default)**: `rounded-sm` (2px)
- **Cards**: `rounded-lg` (8px)
- **Pills/Badges**: `rounded-full`

---

## Animations

### Available Animations
- **Cursor blink**: `animate-cursor` - Use for terminal cursors
- **Marquee**: `animate-marquee` - Use for scrolling content
- **Transitions**: `transition` - All hover effects should use this

### Usage
```jsx
// Blinking cursor
<span className="animate-cursor">_</span>

// Smooth hover transitions
<button className="transition hover:bg-terminal">
```

---

## File Organization

### Where to Put Files
- **Reusable components**: `src/components/`
- **Terminal commands**: `src/components/commands/`
- **Terminal UI**: `src/components/terminal/`
- **Page views**: `src/screens/`
- **Hooks**: `src/hooks/` (prefix with `use`)
- **Context**: `src/context/`
- **Static assets**: `public/`

### Naming Conventions
- **Components**: PascalCase (`MainButton.tsx`, `TerminalPrompt.tsx`)
- **Hooks**: camelCase with `use` prefix (`useKeyClick.ts`)
- **Tests**: Co-locate as `*.test.tsx`

---

## Code Style

### Formatting
- 2-space indent
- Single quotes
- No semicolons
- Consistent JSX spacing

### React Patterns
- Functional components only (no class components)
- Destructure props with TypeScript interfaces
- Keep components focused and single-purpose

### CSS Rules
- **Prefer** Tailwind utilities
- **Minimize** custom CSS (only in `index.css` or `App.css`)
- Define new colors via CSS variables in `:root`, then map to Tailwind

---

## Command System (for terminal features)

### Command Interface
```typescript
interface Command {
  name: string;
  description: string;
  usage?: React.ReactNode;
  args: string[];
  run: (args: string[], context: KeyPressContextType) => Promise<React.ReactNode | null>;
}
```

### Register in CommandMap.tsx
```typescript
commandMap.set('mycommand', myCommand)
```

---

## Responsive Design

### Breakpoints (mobile-first)
- `sm:` - Small devices (640px+)
- `md:` - Medium devices (768px+)
- `lg:` - Large devices (1024px+)

### Common Patterns
```jsx
// Responsive text
className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl"

// Responsive buttons
className="text-sm sm:text-base"

// Flex wrapping
className="flex flex-wrap"
```

---

## Checklist Before Writing Code

1. [ ] Using `font-mono` for terminal/system UI?
2. [ ] Using `text-terminal` for green accents?
3. [ ] Black backgrounds (`bg-black`, `bg-neutral-950`)?
4. [ ] Buttons follow the MainButton pattern?
5. [ ] Using `transition` for hover effects?
6. [ ] Proper border radius (`rounded-sm` by default)?
7. [ ] Component in correct directory?
8. [ ] Following PascalCase naming?
9. [ ] No inline styles (use Tailwind)?
10. [ ] Responsive with mobile-first breakpoints?

---

## Quick Reference

| Element | Classes |
|---------|---------|
| Terminal text | `text-terminal font-mono` |
| Button | `inline-flex items-center gap-2 px-4 py-2 font-mono text-sm transition rounded-sm text-terminal hover:bg-terminal hover:text-black` |
| Card | `border border-terminal/50 rounded-lg p-4 transition` |
| Link | `text-terminal hover:underline` |
| Cursor | `animate-cursor` |
| Container | `flex items-center justify-center h-screen` |
| Input | `bg-black border border-terminal/50 rounded-sm px-3 py-2 font-mono text-white focus:border-terminal focus:outline-none` |

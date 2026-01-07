# Terminal Portfolio

Interactive terminal-themed portfolio with LLM-powered tools and 3D experiences.

## Quick Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
npm run test     # Run Vitest tests
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── components/
│   ├── commands/     # Terminal command implementations (Command interface)
│   └── terminal/     # Terminal UI components
├── screens/          # Page-level views (Terminal, ChatMe, IdeaGenerator, etc.)
├── context/          # React context (KeypressedContext)
├── hooks/            # Custom hooks (useKeyClick, terminal hooks)
└── utils/            # Utilities (textExtraction, colorPersistence)
```

## Adding Terminal Commands

Commands follow the `Command` interface in `src/components/commands/Command.tsx`:

```typescript
interface Command {
  name: string;
  description: string;
  usage?: React.ReactNode;
  args: string[];
  run: (args: string[], context: KeyPressContextType) => Promise<React.ReactNode | null>;
}
```

Register new commands in `src/components/commands/CommandMap.tsx`.

---

# Style Guide (MUST FOLLOW)

This is a **dark, terminal-first aesthetic** with high-contrast black backgrounds and neon green highlights. All code must match these patterns.

## Color System

| Purpose | Value | Tailwind Class |
|---------|-------|----------------|
| Terminal Green | `#22c55e` | `text-terminal`, `bg-terminal`, `border-terminal` |
| Primary Background | `#000` | `bg-black` |
| Secondary Background | - | `bg-neutral-950`, `bg-zinc-800` |
| Primary Text | white | `text-white` |
| Secondary Text | - | `text-gray-300`, `text-gray-200` |
| Muted Text | - | `text-gray-500` |

**Rules:**
- Use `var(--terminal)` CSS variable for the green accent
- Never add new accent colors without a CSS variable
- No gradients over terminal screens

## Typography

- **Monospace**: `font-mono` (JetBrains Mono) - Use for terminal, buttons, code, system text
- **Sizes**: `text-sm`-`text-base` for controls, `text-lg` for terminal, `text-4xl`+ for hero
- Apply `text-terminal` for emphasis/brand text

## Component Patterns

### Buttons
```jsx
className="inline-flex items-center gap-2 px-4 py-2 font-mono text-sm transition rounded-sm text-terminal hover:bg-terminal hover:text-black"
```

### Cards
```jsx
className="border border-terminal/50 rounded-lg p-4 transition hover:shadow-lg"
```

### Links
```jsx
className="text-terminal hover:underline"
```

### Inputs
```jsx
className="bg-black border border-terminal/50 rounded-sm px-3 py-2 font-mono text-white focus:border-terminal focus:outline-none"
```

### Terminal Cursor
```jsx
<span className="animate-cursor">_</span>
```

## Layout

- **Centering**: `flex items-center justify-center h-screen`
- **Spacing**: Use `gap-2`, `gap-4`, `px-4`, `py-2`, `py-4`
- **Corners**: `rounded-sm` (default), `rounded-lg` (cards), `rounded-full` (pills)
- Use padding for width constraints, not fixed widths

## Code Style

- 2-space indent, single quotes, no semicolons
- Functional React components only
- PascalCase for components (`MainButton.tsx`)
- `use` prefix for hooks (`useKeyClick.ts`)
- Prefer Tailwind utilities over custom CSS
- Co-locate tests as `*.test.tsx`

## Responsive (Mobile-First)

```jsx
className="text-4xl sm:text-5xl lg:text-6xl"  // Hero text
className="text-sm sm:text-base"              // Buttons
```

## Pre-Flight Checklist

Before writing code, verify:
1. Using `font-mono` for terminal/system UI
2. Using `text-terminal` for green accents
3. Black backgrounds (`bg-black`, `bg-neutral-950`)
4. Buttons follow the pattern above
5. Using `transition` for all hover effects
6. Proper `rounded-sm` by default
7. Component in correct directory
8. No inline styles - use Tailwind

---

## Detailed Docs

- `AGENTS.md` - Full coding guidelines and conventions
- `style.md` - Visual design system and Tailwind patterns
- `.claude/commands/style-check.md` - Full style reference (run `/style-check`)

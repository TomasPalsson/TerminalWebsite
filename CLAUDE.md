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

## Key Patterns

- **Styling**: Tailwind utilities, `text-terminal` for green accent (#22c55e)
- **Components**: Functional React, PascalCase filenames
- **Tests**: Vitest + React Testing Library, co-locate as `*.test.ts`

## Detailed Docs

- `AGENTS.md` - Full coding guidelines and conventions
- `style.md` - Visual design system and Tailwind patterns

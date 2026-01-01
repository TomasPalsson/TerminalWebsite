# Repository Guidelines

## Project Structure & Module Organization
- `src/main.tsx` bootstraps React 19 with Vite; `src/App.tsx` renders the landing view.
- `src/components/` holds reusable UI, terminal helpers, and command handlers; keep new shared pieces here.
- `src/screens/` contains page-level views (Terminal, AboutMe, ChatMe, IdeaGenerator, UrlShortener).
- `src/context/` stores shared state; `src/hooks/` keeps custom hooks (prefix with `use`).
- Styling lives in `src/index.css` and `src/App.css`, with Tailwind config in `tailwind.config.js`; static assets belong in `public/`.
- Build output is written to `dist/`; avoid editing `node_modules/` or other generated assets.

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — start the Vite dev server with HMR (default http://localhost:5173).
- `npm run lint` — run ESLint (JS/JSX rules, unused var checks).
- `npm run build` — produce the production bundle.
- `npm run preview` — serve the built app locally to verify release artifacts.

## Coding Style & Naming Conventions
- Use functional React components in PascalCase filenames (`MainButton.tsx`, `AppRoutes.tsx`); hooks are `useSomething.ts`.
- Match existing style: 2-space indent, single quotes, no semicolons, and consistent JSX spacing.
- Favor Tailwind utility classes for layout/typography; keep custom CSS minimal and scoped to `App.css`/`index.css`.
- Keep command logic under `src/components/commands/` and terminal-specific pieces under `src/components/terminal/`.

## Testing Guidelines
- No automated tests are present; perform manual smoke checks via `npm run dev` for terminal flows and navigation.
- When adding logic-heavy components, add Vitest/React Testing Library cases (co-locate as `*.test.tsx`) and include coverage notes in PRs.

## Commit & Pull Request Guidelines
- Follow existing history: short, imperative subjects (`fix cv command`, `change highlight color`), ~50 characters.
- Keep commits focused; avoid mixing unrelated refactors and features.
- PRs should include a concise summary, linked issue (if any), screenshots or terminal recordings for UI changes, and tests run (`npm run lint`, manual checks).
- Note any new dependencies or configuration changes (Tailwind, Vite, ESLint) in the PR description.

## Security & Configuration Tips
- Do not commit secrets or `.env*` values; prefer local `.env.local` kept out of version control.
- Sanitize external links and user input in terminal/chat features before deploying.
- Run `npm audit` before releases when new packages are introduced.

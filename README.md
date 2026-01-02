# Terminal Website

Personal site with a terminal-inspired UX, a few LLM-powered tools, and a 3D twist. Built with React + Vite + Tailwind, deployed on AWS.

## Features
- Terminal CV: type commands to explore projects, CV, and utilities.
- AI Chat: chat with an AI version of me.
- URL Shortener: create/check short links and copy results.
- Idea Generator: generate ideas, save favourites (localStorage), and browse them in the Idea Library.
- 3D Terminal Canvas view for a playful landing.
- Skills marquee + recent projects with quick links.

## Quickstart
```bash
npm install
npm run dev      # start Vite dev server
npm run lint     # eslint . (ESM config)
npm run build    # production build
npm run preview  # serve built assets locally
```
Dev server defaults to http://localhost:5173.

## Project Structure
- `src/App.tsx` — landing + About section.
- `src/screens/` — page-level views (`Terminal`, `ChatMe`, `IdeaGenerator`, `IdeaLibrary`, `UrlShortener`, `AboutMe`).
- `src/components/` — shared UI, commands, terminal handler, routes, 3D canvas.
- `public/` — static assets (e.g., `scene.gltf`).
- `tailwind.config.js`, `eslint.config.js`, `vite.config.js` — tooling.

## Routes
- `/` landing
- `/terminal` terminal CV
- `/chat` AI chat
- `/shorten` URL shortener
- `/idea-generator` idea generator (save favourites)
- `/ideas` idea library
- `/blob` 3D terminal canvas
- `/aboutme` detailed bio

## Notes
- Favourites for the idea generator/library persist in `localStorage` (`idea-favorites`).
- Stack marquee and recent projects are on the About section for quick context.

## Links
- Live site: https://tomasp.me
- GitHub: https://t0mas.io/github

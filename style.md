# Style Guide

## Overview
- Built with React 19 + Vite + Tailwind. Prefer Tailwind utilities; keep custom CSS minimal in `src/index.css` and `src/App.css`.
- Fonts are loaded via Google: `JetBrains Mono` (primary mono) and `Winky Sans` (display accents). Set `font-mono` for terminal-like UI; default to system sans elsewhere.
- Dark, terminal-first aesthetic: high-contrast black backgrounds with neon green highlights.

## Color Palette
- Primary: `--terminal: #22c55e` (maps to Tailwind class `text-terminal` via CSS var in `src/index.css`).
- Selection: `--selection-color` auto-derived from `--terminal` (used in `::selection`).
- Backgrounds: use true black (`#000`) for terminal surfaces; keep pages minimalist with ample negative space.
- Hover/active: invert terminal buttons (green background, black text). Avoid additional accent colors without adding a corresponding CSS variable.

## Typography
- Default size follows Tailwind base; headings scale up per component needs.
- Monospace: apply `font-mono` for terminal, buttons, and system-like text. Use `text-terminal` for emphasis or brand text.
- Keep line length tight for terminal feel; prefer `text-sm`–`text-base` for controls and `text-4xl+` for hero name.

## Layout & Spacing
- Use flex utilities for centering (`flex items-center justify-center`) and `h-screen` for fullscreen sections.
- Constrain widths with padding (`px-4`) rather than fixed widths; avoid horizontal scroll (`overflow-x: hidden` already set).
- Maintain even spacing using Tailwind scales: `gap-4`, `pt-6`, `py-2/4`, `rounded-sm` for subtle corners.

## Components & Patterns
- Buttons: match `MainButton` style — `inline-flex items-center gap-2 px-4 py-2 font-mono text-sm transition rounded-sm text-terminal hover:bg-terminal hover:text-black`.
- Terminal: black background, neon text, blinking cursor. When rendering text to canvas, keep monospace and avoid anti-patterns like gradients over the screen.
- 3D Canvas: keep lights subtle; avoid adding bright colors that clash with terminal green.
- Screens: place page-level components in `src/screens/` and reuse shared pieces from `src/components/`.

## Tailwind & CSS Usage
- Tailwind config lives in `tailwind.config.js`; new classes should respect `content` globs.
- Define new theme colors via CSS variables in `:root` then map to Tailwind (extend `colors`).
- Keep custom keyframes/animations in Tailwind theme; `animation: cursor` already defined for blink effects.

## Assets & Static Files
- Static assets belong in `public/` and are referenced with root-relative paths (e.g., `/scene.gltf`).
- Avoid embedding large base64 data in components; prefer external files in `public/`.

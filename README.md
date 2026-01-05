<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Three.js-r177-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/AWS-Serverless-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS"/>
</p>

<h1 align="center">
  <br>
  <code>~/terminal-portfolio</code>
  <br>
</h1>

<h3 align="center">An interactive terminal-inspired portfolio with LLM-powered tools & immersive 3D experiences</h3>

<p align="center">
  <a href="https://tomasp.me">🌐 Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## Overview

A modern, terminal-themed personal website that goes beyond a static portfolio. This project combines the nostalgia of command-line interfaces with cutting-edge web technologies — featuring an interactive terminal emulator, AI-powered conversational interface, real-time idea generation, and an immersive 3D retro computer visualization rendered with Three.js.

**What makes this different:**
- **Fully interactive terminal** — Navigate projects, view CV, and run utilities via CLI commands
- **LLM-powered AI chat** — Streaming responses from a custom serverless backend
- **3D retro computer** — Real-time terminal output rendered as a texture on a 3D model
- **Serverless architecture** — Scales to zero, fast cold starts, cost-efficient

---

## Features

### 🖥️ Interactive Terminal Emulator

A full-featured terminal interface with custom command parsing, history, and real-time output. Explore projects, view CV details, and access utilities — all through familiar CLI semantics.

```bash
$ help              # List all available commands
$ projects          # Browse project portfolio
$ cv                # View professional experience
$ weather [city]    # Check weather conditions
$ calc [expression] # Evaluate math expressions
$ curl [url]        # Fetch and display URL content
$ color [hex]       # Customize terminal accent color
```

### 🤖 AI-Powered Chat Interface

Engage in natural conversation with an AI assistant trained on personal context. Features include:

- **Streaming responses** — Real-time token-by-token output
- **Session persistence** — Maintains conversation context
- **Performance metrics** — Response time tracking

### 💡 Idea Generator

An LLM-powered brainstorming tool that generates project ideas based on your input:

- **Scalable complexity** — Choose from XS to Large project sizes
- **Rich output** — Structured ideas with detailed descriptions
- **Favorites system** — Save and organize ideas locally
- **Idea Library** — Browse and manage your saved ideas

### 🎮 3D Terminal Experience

An immersive retro computing experience powered by Three.js and React Three Fiber:

- **Dynamic texture rendering** — Terminal output rendered in real-time on a 3D CRT screen
- **Interactive camera controls** — Orbit and zoom around the vintage computer
- **Blinking cursor animation** — Authentic terminal feel
- **GLTF model integration** — High-fidelity retro computer asset

### 🔗 URL Shortener

Create and manage shortened URLs with instant copy-to-clipboard functionality.

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/TomasPalsson/TerminalWebsite.git

# Navigate to project directory
cd TerminalWebsite

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server runs at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Create optimized production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |

---

## Architecture

```
src/
├── App.tsx                    # Landing page with hero section
├── main.tsx                   # Application entry point
├── screens/                   # Page-level views
│   ├── Terminal.tsx           # CLI terminal interface
│   ├── ChatMe.tsx             # AI chat interface with streaming
│   ├── IdeaGenerator.tsx      # LLM idea generation tool
│   ├── IdeaLibrary.tsx        # Saved ideas browser
│   ├── UrlShortener.tsx       # URL shortening utility
│   └── AboutMe.tsx            # Detailed biography page
├── components/
│   ├── commands/              # Terminal command implementations
│   │   ├── CommandMap.tsx     # Command registry
│   │   ├── HelpCommand.tsx    # Help system
│   │   ├── CvCommand.tsx      # CV/Resume display
│   │   ├── ProjectsCommand.tsx # Project portfolio
│   │   ├── WeatherCommand.tsx # Weather API integration
│   │   ├── CalcCommand.tsx    # Math expression parser
│   │   ├── CurlCommand.tsx    # HTTP request utility
│   │   └── ...
│   ├── terminal/
│   │   └── TerminalCanvas.tsx # 3D terminal with Three.js
│   ├── TerminalHandler.tsx    # Command parsing & execution
│   ├── TypingAnimation.tsx    # Typewriter text effect
│   ├── MacBar.tsx             # macOS-style window chrome
│   ├── ColorWheel.tsx         # Theme color picker
│   └── ...
├── context/
│   └── KeypressedContext.tsx  # Global keyboard event handling
├── hooks/
│   └── useKeyClick.ts         # Mechanical keyboard sound effects
└── public/
    └── scene.gltf             # 3D retro computer model
```

### Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   User      │────▶│  Terminal    │────▶│  Command        │
│   Input     │     │  Handler     │     │  Executor       │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                  │
                    ┌──────────────┐               ▼
                    │  3D Canvas   │◀───── Buffer Updates
                    │  (Three.js)  │
                    └──────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with latest concurrent features |
| **TypeScript** | Type-safe development |
| **Vite 6** | Next-generation build tooling |
| **Tailwind CSS 3.4** | Utility-first styling |
| **React Router 7** | Client-side routing |

### 3D Graphics
| Technology | Purpose |
|------------|---------|
| **Three.js** | WebGL-powered 3D rendering |
| **React Three Fiber** | React reconciler for Three.js |
| **React Three Drei** | Useful helpers and abstractions |

### Backend Services
| Technology | Purpose |
|------------|---------|
| **AWS Lambda** | Serverless compute for AI endpoints |
| **AWS Bedrock** | Managed LLM infrastructure |
| **Serverless Framework** | Infrastructure as code |

### Developer Experience
| Tool | Purpose |
|------|---------|
| **ESLint 9** | Code quality and consistency |
| **PostCSS + Autoprefixer** | CSS processing pipeline |

---

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `App.tsx` | Landing page with hero & about section |
| `/terminal` | `Terminal.tsx` | Interactive CLI interface |
| `/chat` | `ChatMe.tsx` | AI conversational interface |
| `/idea-generator` | `IdeaGenerator.tsx` | LLM idea brainstorming |
| `/ideas` | `IdeaLibrary.tsx` | Saved ideas collection |
| `/shorten` | `UrlShortener.tsx` | URL shortening tool |
| `/blob` | `TerminalCanvas.tsx` | 3D retro computer experience |
| `/aboutme` | `AboutMe.tsx` | Extended biography |

---

## Configuration

### Terminal Theme

The terminal accent color is customizable via CSS custom properties:

```css
:root {
  --terminal: #22c55e; /* Default green */
}
```

Users can dynamically change this using the `color` command in the terminal.

### Local Storage

The application persists user data locally:

| Key | Data |
|-----|------|
| `idea-favorites` | Saved ideas from the generator |

---

## Performance

- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Bundle Size**: ~250KB gzipped (including Three.js)

---

## Deployment

The application is deployed on AWS with the following architecture:

```
                    ┌─────────────────┐
                    │   CloudFront    │
                    │   (CDN)         │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐       ┌──────────▼──────────┐
    │      S3           │       │    API Gateway      │
    │  (Static Assets)  │       │                     │
    └───────────────────┘       └──────────┬──────────┘
                                           │
                                ┌──────────▼──────────┐
                                │    Lambda + Bedrock │
                                │    (AI Endpoints)   │
                                └─────────────────────┘
```

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Links

- **Live Site**: [tomasp.me](https://tomasp.me)
- **GitHub**: [github.com/TomasPalsson/TerminalWebsite](https://github.com/TomasPalsson/TerminalWebsite)
- **Contact**: [tomas@p5.is](mailto:tomas@p5.is)

---

<p align="center">
  <sub>Built with ❤️ and lots of ☕ by <a href="https://tomasp.me">Tómas Ari Pálsson</a></sub>
</p>

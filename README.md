```
 ______                   _             __  __          __         _ __
/_  __/__  ______ _  (_)__  ___ _/ / | |/ /__  / /  _____(_) /____
 / / / _ \/ __/  ' \/ / _ \/ _ `/ /  |   / _ \/ _ \(_-</ / __/ -_)
/_/  \___/_/ /_/_/_/_/_//_/\_,_/_/   |__|\_,_/_.__/___/_/\__/\__/
```

<p align="center">
  <img src="https://img.shields.io/badge/React-19-22c55e?style=flat-square&logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-22c55e?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Three.js-r177-22c55e?style=flat-square&logo=three.js&logoColor=white" alt="Three.js"/>
  <img src="https://img.shields.io/badge/Tailwind-3.4-22c55e?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/AWS-Serverless-22c55e?style=flat-square&logo=amazonaws&logoColor=white" alt="AWS"/>
</p>

<p align="center">
  <strong>An interactive terminal portfolio with AI-powered tools & 3D experiences</strong>
</p>

<p align="center">
  <a href="https://tomasp.me">Live Demo</a> ·
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#architecture">Architecture</a>
</p>

---

## `$ cat overview.txt`

A terminal-themed portfolio that combines CLI nostalgia with modern web tech. Features an interactive terminal emulator, AI chat with streaming responses, project idea generator, and a 3D retro computer rendered with Three.js.

```
┌─────────────────────────────────────────────────────────────┐
│  ● ○ ○  tomasp.me                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  $ whoami                                                   │
│  Tómas Ari Pálsson // Software Dev                          │
│                                                             │
│  $ cat skills.txt                                           │
│  AWS · Python · Rust · Flutter · Serverless · LLMs          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## `$ ls features/`

### `terminal/` — Interactive CLI

Full-featured terminal with command parsing, history navigation, tab completion, and reverse search (Ctrl+R).

```bash
$ help              # List commands
$ projects          # Browse portfolio
$ cv                # View experience
$ weather london    # Check weather
$ calc 2+2*3        # Math expressions
$ color #ff6b6b     # Change theme
```

### `filesystem/` — Mock Unix Filesystem

Persistent virtual filesystem with localStorage backing. Supports all common file operations.

```bash
$ pwd                    # Print working directory
$ ls -la                 # List files (including hidden)
$ cd projects            # Change directory
$ mkdir new-project      # Create directory
$ touch README.md        # Create file
$ cat README.md          # View file contents
$ echo "hello" > file    # Write to file
$ cp src dest            # Copy files
$ mv old new             # Move/rename files
$ rm -r folder           # Remove recursively
$ find . -name "*.txt"   # Find files by pattern
$ grep "TODO" .          # Search file contents
```

### `vim/` — Built-in Text Editor

Vim-style editor powered by CodeMirror 6 with essential keybindings for editing files.

```bash
$ vim file.txt           # Open/create file in editor
```

**Navigation**: `h` `j` `k` `l` · `w` `b` `e` · `0` `$` · `gg` `G`
**Modes**: `i` `a` `o` `O` (insert) · `v` (visual) · `Esc` (normal)
**Editing**: `x` `dd` `yy` `p` `u`
**Ex Commands**: `:w` (save) · `:q` (quit) · `:wq` (save & quit) · `:q!` (force quit)

### `git/` — Version Control

Git-like version control for the virtual filesystem with staging, commits, branches, and diffs.

```bash
$ git init               # Initialize repository
$ git status             # Show working tree status
$ git add file.txt       # Stage changes
$ git commit -m "msg"    # Commit staged changes
$ git log                # View commit history
$ git diff               # Show unstaged changes
$ git branch             # List branches
$ git checkout -b feat   # Create and switch branch
$ git merge feat         # Merge branch
```

### `shell/` — Environment & Aliases

Shell customization with environment variables and command aliases.

```bash
$ export EDITOR=vim      # Set environment variable
$ echo $EDITOR           # Use variable (expanded automatically)
$ unset EDITOR           # Remove variable
$ alias ll="ls -la"      # Create alias
$ alias                  # List all aliases
```

Variables can also be defined in `~/.zshrc`:
```bash
$ cat ~/.zshrc
export EDITOR="vim"
export TERM="xterm-256color"
```

### `chat/` — AI Assistant

Streaming AI chat powered by AWS Bedrock with session persistence and tool integrations.

### `ideas/` — Idea Generator

LLM-powered brainstorming with scalable project sizes (XS → Large), favorites system, and idea library.

### `3d/` — Retro Terminal

Three.js-powered 3D experience with real-time terminal output rendered on a CRT screen texture.

### `shorten/` — URL Shortener

Create short links with custom slugs and instant clipboard copy.

---

## `$ ./quickstart.sh`

```bash
# Clone
git clone https://github.com/TomasPalsson/TerminalWebsite.git
cd TerminalWebsite

# Install
npm install

# Run
npm run dev
```

Opens at `http://localhost:5173`

### Commands

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | Code linting |
| `npm run test` | Run tests |

---

## `$ tree src/`

```
src/
├── screens/
│   ├── Terminal.tsx        # CLI interface
│   ├── ChatMe.tsx          # AI chat
│   ├── IdeaGenerator.tsx   # Idea tool
│   ├── IdeaLibrary.tsx     # Saved ideas
│   ├── UrlShortener.tsx    # URL shortener
│   └── AboutMe.tsx         # Bio page
├── components/
│   ├── commands/           # CLI commands
│   │   ├── fs/             # Filesystem commands
│   │   ├── git/            # Git commands
│   │   └── vim/            # Vim editor
│   ├── terminal/           # Terminal UI components
│   └── TerminalHandler.tsx # Command parser
├── services/
│   ├── filesystem.ts       # Virtual filesystem
│   ├── git.ts              # Git implementation
│   ├── env.ts              # Environment variables
│   └── alias.ts            # Command aliases
├── types/                  # TypeScript definitions
├── context/                # State management
└── hooks/                  # Custom hooks
```

---

## `$ cat stack.json`

```json
{
  "frontend": {
    "framework": "React 19",
    "language": "TypeScript",
    "styling": "Tailwind CSS",
    "routing": "React Router 7",
    "build": "Vite 6"
  },
  "terminal": {
    "editor": "CodeMirror 6",
    "vim": "@replit/codemirror-vim"
  },
  "3d": {
    "engine": "Three.js",
    "bindings": "React Three Fiber",
    "helpers": "React Three Drei"
  },
  "backend": {
    "compute": "AWS Lambda",
    "ai": "AWS Bedrock",
    "iac": "Serverless Framework"
  }
}
```

---

## `$ cat routes.txt`

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/terminal` | CLI interface |
| `/chat` | AI chat |
| `/idea-generator` | Idea brainstorming |
| `/ideas` | Saved ideas |
| `/shorten` | URL shortener |
| `/blob` | 3D experience |
| `/aboutme` | About page |

---

## `$ cat deploy.txt`

```
        CloudFront (CDN)
              │
       ┌──────┴──────┐
       │             │
      S3         API Gateway
  (static)           │
                  Lambda
                     │
                  Bedrock
```

---

## `$ cat links.txt`

- **Site**: [tomasp.me](https://tomasp.me)
- **GitHub**: [TomasPalsson/TerminalWebsite](https://github.com/TomasPalsson/TerminalWebsite)
- **Email**: [tomas@p5.is](mailto:tomas@p5.is)

---

<p align="center">
  <code>// Built by Tómas Ari Pálsson</code>
</p>

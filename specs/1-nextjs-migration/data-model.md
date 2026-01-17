# Data Model: Next.js Migration

## Overview

This document defines the data structures that must be preserved during the migration from React/Vite to Next.js. No new entities are introduced; this is a 1:1 migration of existing data models.

---

## Entities

### 1. Filesystem State

**Storage Key:** `terminal-fs`
**Location:** localStorage
**Used By:** Mock filesystem commands (ls, cd, cat, mkdir, etc.)

```typescript
interface FileNode {
  type: 'file' | 'directory'
  name: string
  content?: string          // For files only
  children?: FileNode[]     // For directories only
  permissions?: string      // e.g., 'rwxr-xr-x'
  owner?: string
  group?: string
  size?: number
  modified?: string         // ISO date string
  created?: string          // ISO date string
}

interface FilesystemState {
  root: FileNode
  currentPath: string       // Absolute path like '/home/user'
}
```

**Migration Notes:**
- No schema changes required
- localStorage access must be guarded with useEffect
- Service file `src/services/filesystem.ts` remains unchanged

---

### 2. Git State

**Storage Key:** `terminal-git`
**Location:** localStorage
**Used By:** Mock git commands (git status, git log, git commit, etc.)

```typescript
interface GitCommit {
  hash: string
  message: string
  author: string
  date: string              // ISO date string
  files: string[]           // Changed file paths
}

interface GitBranch {
  name: string
  commits: GitCommit[]
  head: string              // Hash of current commit
}

interface GitState {
  branches: GitBranch[]
  currentBranch: string
  staging: string[]         // Files staged for commit
  workingDirectory: Map<string, 'modified' | 'deleted' | 'untracked'>
}
```

**Migration Notes:**
- No schema changes required
- Service file `src/services/git.ts` remains unchanged

---

### 3. Shell Aliases

**Storage Key:** `terminal-aliases`
**Location:** localStorage
**Used By:** Alias expansion in command execution

```typescript
interface AliasMap {
  [alias: string]: string   // alias -> expanded command
}

// Default aliases
const DEFAULT_ALIASES: AliasMap = {
  'lsd': 'ls',
  'll': 'ls -l',
  'la': 'ls -a',
  'cls': 'clear',
  'c': 'clear',
  'q': 'exit',
}
```

**Migration Notes:**
- No schema changes required
- Service file `src/services/alias.ts` remains unchanged

---

### 4. Environment Variables

**Storage Key:** `terminal-env`
**Location:** localStorage
**Used By:** Variable expansion ($VAR, ${VAR}) in commands

```typescript
interface EnvironmentMap {
  [key: string]: string
}

// Default environment
const DEFAULT_ENV: EnvironmentMap = {
  HOME: '/home/user',
  USER: 'user',
  SHELL: '/bin/zsh',
  PWD: '/home/user',
  TERM: 'xterm-256color',
}
```

**Migration Notes:**
- No schema changes required
- Service file `src/services/env.ts` remains unchanged

---

### 5. Saved Ideas

**Storage Key:** `saved-ideas` (or similar)
**Location:** localStorage
**Used By:** IdeaGenerator, IdeaLibrary screens

```typescript
interface SavedIdea {
  id: string
  title: string
  description: string
  category?: string
  tags?: string[]
  createdAt: string         // ISO date string
  isFavorite?: boolean
}

type SavedIdeasState = SavedIdea[]
```

**Migration Notes:**
- No schema changes required
- Verify storage key in IdeaGenerator/IdeaLibrary components

---

### 6. Terminal History

**Storage Key:** In-memory + optional localStorage backup
**Location:** React state (useCommandHistory hook)
**Used By:** Arrow key navigation, reverse search

```typescript
interface HistoryState {
  entries: string[]         // Past commands
  position: number          // Current navigation position
  tempInput?: string        // Saved input when navigating
}
```

**Migration Notes:**
- Hook `src/hooks/useCommandHistory.ts` remains unchanged
- Already uses useEffect for any persistence

---

### 7. Chat Session

**Storage Key:** None (in-memory only)
**Location:** React state
**Used By:** ChatMe screen

```typescript
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  tools?: ToolExecution[]
  timestamp?: string
}

interface ToolExecution {
  name: string
  input: Record<string, unknown>
  output?: unknown
}

interface ChatSession {
  id: string
  messages: ChatMessage[]
}
```

**Migration Notes:**
- No persistence required
- State management in ChatMe.tsx remains unchanged

---

### 8. Color/Theme Preferences

**Storage Key:** `terminal-color` or similar
**Location:** localStorage
**Used By:** Color customization commands

```typescript
interface ColorPreferences {
  terminalColor?: string    // Hex color like '#22c55e'
}
```

**Migration Notes:**
- Verify storage key in colorPersistence utility
- CSS variable updates via JavaScript

---

## Context State

### KeyPressContext

**Location:** React Context
**Used By:** Terminal input handling, keyboard shortcuts

```typescript
interface KeyPressContextType {
  text: string
  cursorPos: number
  setText: (text: string) => void
  setCursorPos: (pos: number) => void
  clearText: () => void
  shortcut: string | null
  vimEditor: VimEditorConfig | null
  setVimEditor: (config: VimEditorConfig | null) => void
}

interface VimEditorConfig {
  filePath: string
  content: string
  onSave: (content: string) => void
  onClose: () => void
}
```

**Migration Notes:**
- Context provider must be wrapped in `'use client'`
- Event listeners attach in useEffect (already implemented)

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   localStorage                          ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   ││
│  │  │ terminal-fs  │ │ terminal-git │ │ terminal-env │   ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘   ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   ││
│  │  │terminal-alias│ │ saved-ideas  │ │terminal-color│   ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                 React State (Client)                    ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   ││
│  │  │KeyPressContext│ │ChatSession  │ │TerminalHistory│   ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Components                            ││
│  │  Terminal ─── Chat ─── IdeaGenerator ─── 3D Canvas     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Validation Rules

All existing validation rules from service files are preserved:

1. **Filesystem paths** must be valid Unix-style paths
2. **Git branch names** must follow git naming conventions
3. **Alias names** cannot contain spaces
4. **Environment variable names** must be valid shell identifiers

---

## Migration Checklist

- [ ] Verify all localStorage keys match between Vite and Next.js builds
- [ ] Ensure useEffect guards all localStorage reads
- [ ] Test data persistence across page refreshes
- [ ] Test data persistence across navigation
- [ ] Verify no hydration mismatches with stored data

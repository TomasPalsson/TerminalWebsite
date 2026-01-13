# Implementation Plan: Mock Filesystem & Git

**Created**: 2026-01-12
**Feature**: Mock Filesystem & Git for Terminal Portfolio
**Branch**: `1-mock-filesystem`

## Overview

This plan outlines the implementation of a fully functional mock filesystem and git version control system within the terminal, persisted in localStorage.

## Architecture

```
src/
├── services/
│   ├── filesystem.ts          # FileSystemService class
│   └── git.ts                 # GitService class
├── components/
│   ├── commands/
│   │   ├── fs/                # Filesystem commands
│   │   │   ├── CdCommand.tsx
│   │   │   ├── LsCommand.tsx
│   │   │   ├── PwdCommand.tsx
│   │   │   ├── TouchCommand.tsx
│   │   │   ├── CatCommand.tsx
│   │   │   ├── MkdirCommand.tsx
│   │   │   ├── RmCommand.tsx
│   │   │   ├── CpCommand.tsx
│   │   │   ├── MvCommand.tsx
│   │   │   ├── FindCommand.tsx
│   │   │   └── GrepCommand.tsx
│   │   └── git/               # Git commands
│   │       └── GitCommand.tsx  # Handles all git subcommands
│   └── terminal/
│       └── TerminalPrompt.tsx  # Updated with git branch display
└── types/
    ├── filesystem.ts          # FS types
    └── git.ts                 # Git types
```

## Implementation Phases

### Phase 1: Core Services (Foundation)

**Goal**: Build the core filesystem and git services with persistence

**Files to create**:
1. `src/types/filesystem.ts` - Type definitions
2. `src/types/git.ts` - Git type definitions
3. `src/services/filesystem.ts` - FileSystemService implementation
4. `src/services/git.ts` - GitService implementation

**Key implementations**:
- FileSystemNode tree structure
- Path resolution (absolute/relative, `.`, `..`)
- localStorage persistence with JSON serialization
- Default filesystem initialization
- Git commit/branch data structures

**Constitution compliance**:
- P1: JSDoc comments on all public methods
- P2: Services are independent, reusable modules
- P3: Full TypeScript typing
- P4: Logic separated from UI

### Phase 2: Navigation Commands

**Goal**: Implement basic navigation commands

**Files to create**:
1. `src/components/commands/fs/PwdCommand.tsx`
2. `src/components/commands/fs/CdCommand.tsx`
3. `src/components/commands/fs/LsCommand.tsx`

**Output styling** (per spec requirements):
- Use card layouts with `bg-neutral-900/50 border border-neutral-800`
- Lucide icons: `Folder`, `File`, `FolderOpen`
- `text-terminal` for directories, `text-gray-400` for files
- Error states: `bg-red-500/10 border border-red-500/30`

**Help documentation**:
- Interactive examples with clickable commands
- Options explained with flags

### Phase 3: File Operations Commands

**Goal**: Implement file CRUD operations

**Files to create**:
1. `src/components/commands/fs/TouchCommand.tsx`
2. `src/components/commands/fs/CatCommand.tsx`
3. `src/components/commands/fs/MkdirCommand.tsx`
4. `src/components/commands/fs/RmCommand.tsx`
5. `src/components/commands/fs/CpCommand.tsx`
6. `src/components/commands/fs/MvCommand.tsx`

**Key features**:
- `rm -r` for recursive deletion
- `ls -a` for hidden files (starting with `.`)
- `ls -l` for long format with sizes/dates

### Phase 4: File Editing & Echo Redirection

**Goal**: Implement file content modification

**Files to modify**:
1. `src/components/commands/EchoCommand.tsx` - Add `>` and `>>` support

**Key implementations**:
- Parse `echo "text" > file` syntax
- Parse `echo "text" >> file` syntax
- Handle quoted strings properly

### Phase 5: Git Commands

**Goal**: Implement full git command suite

**Files to create**:
1. `src/components/commands/git/GitCommand.tsx` - Main git command handler

**Subcommands to implement**:
- `git init` - Initialize repository
- `git status` - Show working tree status
- `git add <file>` / `git add .` - Stage changes
- `git reset <file>` - Unstage changes
- `git commit -m "message"` - Create commit
- `git log` - Show commit history
- `git show <hash>` - Show commit details
- `git branch` / `git branch <name>` - List/create branches
- `git checkout <branch>` - Switch branches
- `git merge <branch>` - Merge branches
- `git diff` - Show unstaged changes

**Output styling**:
- `GitBranch` icon for branch-related output
- `GitCommit` icon for commit-related output
- Commit hashes in `text-terminal`
- Status indicators with colored badges

### Phase 6: Terminal Integration

**Goal**: Integrate with terminal UI

**Files to modify**:
1. `src/components/commands/CommandMap.tsx` - Register new commands
2. `src/components/commands/HelpCommand.tsx` - Add new command categories
3. `src/components/terminal/TerminalHandler.tsx` - Tab completion support
4. `src/components/terminal/TerminalPrompt.tsx` - Git branch in prompt

**Key implementations**:
- Add "Filesystem" and "Git" categories to help
- Tab completion using FileSystemService.getCompletions()
- Prompt format: `user@terminal ~/path (branch) $`

### Phase 7: Search Commands & Polish

**Goal**: Add search functionality and polish

**Files to create**:
1. `src/components/commands/fs/FindCommand.tsx`
2. `src/components/commands/fs/GrepCommand.tsx`

**Files to create/modify**:
1. `src/components/commands/fs/ClearFsCommand.tsx` - Reset filesystem

**Polish items**:
- Storage usage warning near localStorage limit
- Comprehensive error messages
- All help documentation complete

## File-by-File Specifications

### `src/types/filesystem.ts`

```typescript
export type FileSystemNode = {
  type: 'file' | 'directory'
  name: string
  content?: string
  children?: Record<string, FileSystemNode>
  createdAt: number
  modifiedAt: number
}

export type FileSystemState = {
  version: number
  root: FileSystemNode
  cwd: string
}

export type FSResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type DirectoryEntry = {
  name: string
  type: 'file' | 'directory'
  size: number
  modifiedAt: number
}
```

### `src/services/filesystem.ts`

Core service implementing IFileSystemService contract:
- Singleton pattern for global state
- Path resolution with normalization
- Deep copy for cp operations
- Recursive deletion for rm -r
- Tab completion helper

### `src/services/git.ts`

Core service implementing IGitService contract:
- Depends on FileSystemService
- Hash generation using random hex
- Commit snapshot captures file contents
- Branch checkout restores filesystem state

### Command Output Patterns

**Success card**:
```tsx
<div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
  <div className="flex items-center gap-2 mb-2">
    <Folder size={14} className="text-terminal" />
    <span className="text-white font-medium">Directory created</span>
  </div>
  <p className="text-gray-400">/path/to/directory</p>
</div>
```

**Error card**:
```tsx
<div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
  <AlertCircle size={14} className="text-red-400" />
  <span className="text-red-400">No such file or directory: {path}</span>
</div>
```

**Interactive help example**:
```tsx
<button
  type="button"
  onClick={(e) => {
    const cmd = 'ls -la'
    context?.setText(cmd)
    context?.setCursorPos(cmd.length)
    e.currentTarget.blur()
  }}
  className="text-terminal hover:underline cursor-pointer"
>
  ls -la
</button>
```

## Testing Strategy

1. **Unit tests** for services:
   - `src/services/filesystem.test.ts`
   - `src/services/git.test.ts`

2. **Manual testing checklist**:
   - Navigate filesystem (cd, ls, pwd)
   - Create/modify files (touch, echo, cat, rm)
   - Git workflow (init, add, commit, branch, merge)
   - Persistence across refresh
   - Tab completion

## Dependencies

- No new npm packages required
- Uses existing: Lucide icons, React, TypeScript

## Success Criteria Verification

| Criterion | How to Verify |
|-----------|---------------|
| File operations < 30s | Manual timing of create/edit/delete |
| Full git workflow | Execute init → add → commit → branch → merge |
| 100% persistence | Refresh browser, verify state restored |
| < 100ms latency | No perceived delay in command execution |
| Familiar to Unix users | Commands match expected behavior |
| Tab completion 90% | Test with various partial paths |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| localStorage limit | Add warning at 4MB, clear command available |
| Complex merge conflicts | Only support fast-forward merges |
| Path edge cases | Comprehensive path normalization |

## Constitution Compliance Checklist

- [x] P1: Code Documentation - JSDoc on all services and public methods
- [x] P2: Extensibility - Commands via interface, services decoupled
- [x] P3: Type Safety - Full TypeScript types for all models
- [x] P4: Separation of Concerns - Services handle logic, commands handle UI
- [x] P5: Code Style - Follow existing patterns, Tailwind only

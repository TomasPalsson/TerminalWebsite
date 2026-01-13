# Research: Mock Filesystem & Git

**Created**: 2026-01-12
**Feature**: Mock Filesystem & Git for Terminal Portfolio

## Technical Context Analysis

### 1. localStorage Data Structure

**Decision**: Use a JSON-serialized tree structure for filesystem, separate keys for git state

**Rationale**:
- localStorage only supports string values, so JSON serialization is required
- Separate keys (`fs-state`, `git-state`) allow independent updates and easier debugging
- Tree structure mirrors natural filesystem hierarchy

**Alternatives considered**:
- Flat key-value (each file as separate localStorage key) - rejected due to path management complexity
- IndexedDB - overkill for expected data size, adds complexity

### 2. Filesystem Data Model

**Decision**: Use a node-based tree where each node has type (file/directory), content, and children

**Rationale**:
- Matches existing pattern in colorPersistence.ts (simple, focused utilities)
- Easy to traverse for path resolution
- Efficient for common operations (ls, cd, cat)

**Structure**:
```typescript
type FSNode = {
  type: 'file' | 'directory'
  name: string
  content?: string // only for files
  children?: Map<string, FSNode> // only for directories
  createdAt: number
  modifiedAt: number
}
```

### 3. Git State Model

**Decision**: Store commits as array, branches as Map, track staging area separately

**Rationale**:
- Git log needs chronological order (array is natural)
- Branch lookup by name is common (Map is efficient)
- Staging area is separate concept from working directory

**Structure**:
```typescript
type GitState = {
  initialized: boolean
  currentBranch: string
  branches: Map<string, string> // branch name -> commit hash
  commits: Commit[]
  stagingArea: Set<string> // paths of staged files
  headCommit: string | null
}

type Commit = {
  hash: string
  message: string
  timestamp: number
  parentHash: string | null
  snapshot: Record<string, string> // path -> content
}
```

### 4. Path Resolution

**Decision**: Implement Unix-style path resolution with support for `.`, `..`, absolute and relative paths

**Rationale**:
- Spec requires Unix-style paths
- Users expect familiar terminal behavior
- Enables tab completion

**Implementation approach**:
- Store current working directory (cwd) as absolute path string
- Resolve all paths relative to cwd unless starting with `/`
- Handle edge cases: `//`, trailing slashes, `.` and `..`

### 5. Command Architecture

**Decision**: Create filesystem commands following existing Command interface pattern, with shared filesystem service

**Rationale**:
- Constitution Principle 2: Extensibility - new commands via new files + CommandMap registration
- Constitution Principle 4: Separation of Concerns - service handles logic, commands handle presentation
- Follows existing patterns (colorPersistence.ts for storage, ProjectsCommand.tsx for complex output)

**Architecture**:
```
src/
├── services/
│   ├── filesystem.ts    # FileSystemService class
│   └── git.ts           # GitService class
├── components/commands/
│   ├── fs/              # Filesystem commands (cd, ls, pwd, etc.)
│   └── git/             # Git commands (git init, git status, etc.)
```

### 6. Tab Completion

**Decision**: Extend existing `tab` shortcut handling in KeypressedContext to support filesystem paths

**Rationale**:
- KeypressedContext already handles Tab key via shortcut state
- TerminalHandler can intercept and provide completions
- Minimal changes to existing architecture

**Implementation approach**:
- On Tab shortcut, parse current input to extract partial path
- Query FileSystemService for matching children
- Complete with common prefix or cycle through options

### 7. Terminal Prompt with Git Branch

**Decision**: Add git branch display to existing prompt in TerminalHandler

**Rationale**:
- Users expect to see current branch like in real terminals
- Prompt is rendered in TerminalHandler
- GitService can expose current branch getter

**Format**: `user@terminal ~/current/path (branch) $`

### 8. Output Styling Pattern

**Decision**: Follow existing card-based patterns with Lucide icons

**Reference patterns from existing commands**:
- Cards: `bg-neutral-900/50 border border-neutral-800`
- Headers: `flex items-center gap-2` with icon + text
- Errors: `bg-red-500/10 border border-red-500/30` with AlertCircle
- Success: `text-terminal` for highlights
- Icons: Folder, File, GitBranch, GitCommit, Check, AlertCircle

### 9. Interactive Help Examples

**Decision**: Use clickable buttons that call `context.setText()` and `context.setCursorPos()` with blur pattern

**Reference**: ProjectsCommand.tsx lines 157-162
```tsx
onClick={(e) => {
  const cmd = 'example command'
  context?.setText(cmd)
  context?.setCursorPos(cmd.length)
  e.currentTarget.blur()
}}
```

## Dependencies

| Dependency | Purpose | Notes |
|------------|---------|-------|
| localStorage | Persistence | Already used for color |
| Lucide icons | UI icons | Already imported |
| KeypressedContext | Tab completion, input | Existing |

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| localStorage 5MB limit | Show warning when approaching limit, provide clear command |
| Performance with large filesystems | Lazy loading of directory contents, debounced saves |
| Complex merge conflicts | Out of scope per spec (simple merge only) |

## Constitution Compliance

| Principle | Compliance |
|-----------|------------|
| P1: Code Documentation | JSDoc on services, clear naming |
| P2: Extensibility | Commands via interface, services decoupled |
| P3: Type Safety | Full TypeScript types for all models |
| P4: Separation of Concerns | Services handle logic, commands handle UI |
| P5: Code Style | Follow existing patterns, Tailwind only |

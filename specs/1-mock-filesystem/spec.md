# Feature Specification: Mock Filesystem & Git

## Overview

**Goal:** Provide users with a fully functional mock filesystem and git version control system within the terminal, persisted in localStorage, enabling realistic terminal interactions for file management and version control workflows.

## User Scenarios & Testing

### Scenario 1: File System Navigation
**As a** terminal user
**I want to** navigate through directories using standard commands (cd, ls, pwd)
**So that** I can explore the mock filesystem like a real terminal

**Acceptance Criteria:**
- User can list directory contents with `ls`
- User can change directories with `cd [path]`
- User can see current working directory with `pwd`
- Paths support absolute (`/home/user`) and relative (`../folder`) navigation
- Tab completion works for directory names

### Scenario 2: File Operations
**As a** terminal user
**I want to** create, read, edit, and delete files and directories
**So that** I can manage content within the mock filesystem

**Acceptance Criteria:**
- User can create files with `touch [filename]`
- User can create directories with `mkdir [dirname]`
- User can view file contents with `cat [filename]`
- User can remove files with `rm [filename]`
- User can remove directories with `rmdir [dirname]` or `rm -r [dirname]`
- User can copy files with `cp [src] [dest]`
- User can move/rename files with `mv [src] [dest]`

### Scenario 3: File Editing
**As a** terminal user
**I want to** edit file contents
**So that** I can modify files within the filesystem

**Acceptance Criteria:**
- User can append to files with `echo "text" >> file`
- User can overwrite files with `echo "text" > file`
- A simple inline editor mode is available for multi-line editing

### Scenario 4: Git Version Control
**As a** terminal user
**I want to** use git commands for version control
**So that** I can experience realistic git workflows

**Acceptance Criteria:**
- User can initialize a repository with `git init`
- User can check status with `git status`
- User can stage files with `git add [file]` or `git add .`
- User can commit changes with `git commit -m "message"`
- User can view commit history with `git log`
- User can create branches with `git branch [name]`
- User can switch branches with `git checkout [branch]`
- User can see current branch in terminal prompt

### Scenario 5: Persistence
**As a** terminal user
**I want to** have my filesystem and git state preserved
**So that** my work persists across browser sessions

**Acceptance Criteria:**
- Filesystem state is automatically saved to localStorage
- Git repository state (commits, branches) is saved to localStorage
- State is restored when the terminal loads
- User can reset the filesystem to default with a clear command

## Functional Requirements

### File System Commands
1. **Navigation**: `cd`, `pwd`, `ls` (with `-a`, `-l` flags)
2. **File Operations**: `touch`, `cat`, `rm`, `cp`, `mv`
3. **Directory Operations**: `mkdir`, `rmdir`, `rm -r`
4. **File Writing**: `echo` with `>` (overwrite) and `>>` (append) redirection
5. **Search**: `find` (basic pattern matching), `grep` (search file contents)

### Git Commands
1. **Repository**: `git init`, `git status`
2. **Staging**: `git add [file]`, `git add .`, `git reset [file]`
3. **Commits**: `git commit -m "message"`, `git log`, `git show [hash]`
4. **Branches**: `git branch`, `git branch [name]`, `git checkout [branch]`, `git merge [branch]`
5. **Diff**: `git diff` (show unstaged changes)

### Output Styling Requirements
All commands must follow the established design patterns:
- Use card-based layouts with `bg-neutral-900/50 border border-neutral-800` styling
- Include Lucide icons for visual context (Folder, File, GitBranch, etc.)
- Display structured information with proper hierarchy
- Use `text-terminal` for command names and highlights
- Use `text-gray-400/500` for secondary information
- Error states use `bg-red-500/10 border border-red-500/30` with AlertCircle icon

### Help Documentation Requirements
Each command must include a `usage` property following existing patterns:
- Section headers with `text-terminal mb-2` (e.g., "Usage:", "Options:", "Examples:")
- Command syntax in `text-gray-400`
- Options/flags explained with `text-white` for flag names and descriptions
- **Interactive examples**: Clickable example commands that auto-fill the terminal input when clicked (using `context.setText()` and `context.setCursorPos()` pattern)
- Examples should cover common use cases and flag combinations

### Default Filesystem Structure
The mock filesystem starts with a pre-populated structure:
```
/
├── home/
│   └── user/
│       ├── projects/
│       │   └── portfolio/
│       │       └── README.md
│       ├── documents/
│       └── .bashrc
├── etc/
└── tmp/
```

## Success Criteria

1. Users can perform complete file management workflows (create, edit, organize, delete) within 30 seconds per operation
2. Users can complete a full git workflow (init, add, commit, branch, merge) successfully
3. 100% of filesystem and git state persists correctly across browser refresh
4. Command response time feels instantaneous (< 100ms perceived latency)
5. Users familiar with Unix terminals can use commands without consulting help
6. Tab completion successfully suggests valid paths and filenames 90% of the time

## Assumptions

- The mock filesystem operates entirely in-browser with no server-side storage
- File sizes are limited by localStorage capacity (typically 5-10MB total)
- Git operations are simulated locally without network/remote repository support
- The filesystem uses Unix-style paths (forward slashes, case-sensitive)
- Default working directory on terminal load is `/home/user`

## Out of Scope

- Remote git operations (push, pull, fetch, clone)
- Advanced git features (rebase, cherry-pick, stash, tags)
- File permissions and ownership
- Symbolic links
- Binary file support
- Vim/nano full editor integration (only simple inline editing)
- Network file operations
- Multiple user support

## Dependencies

- Existing terminal infrastructure (TerminalHandler, KeyPressContext)
- Existing command registration system (CommandMap)
- localStorage API for persistence

## Clarifications

### Session 2026-01-12
- Q: How detailed should command output be for filesystem/git commands? → A: Styled Cards — Match existing command patterns with card layouts, Lucide icons, and styled elements (bg-neutral-900/50, border-neutral-800) for all commands
- Q: How comprehensive should built-in help be for each command? → A: Follow existing command patterns (usage property with examples) plus interactive clickable examples that auto-fill the terminal input when clicked

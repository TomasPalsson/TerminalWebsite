# Data Model: Mock Filesystem & Git

**Created**: 2026-01-12
**Feature**: Mock Filesystem & Git for Terminal Portfolio

## Entities

### FileSystemNode

Represents a node in the filesystem tree (file or directory).

| Field | Type | Description |
|-------|------|-------------|
| `type` | `'file' \| 'directory'` | Node type |
| `name` | `string` | Node name (basename) |
| `content` | `string \| undefined` | File contents (only for files) |
| `children` | `Record<string, FileSystemNode> \| undefined` | Child nodes (only for directories) |
| `createdAt` | `number` | Unix timestamp of creation |
| `modifiedAt` | `number` | Unix timestamp of last modification |

**Validation rules**:
- `name` must not contain `/` or be empty
- `name` must not be `.` or `..` (reserved)
- `content` must be defined iff `type === 'file'`
- `children` must be defined iff `type === 'directory'`

### FileSystemState

Root state object persisted to localStorage.

| Field | Type | Description |
|-------|------|-------------|
| `version` | `number` | Schema version for migrations |
| `root` | `FileSystemNode` | Root directory node |
| `cwd` | `string` | Current working directory (absolute path) |

**Validation rules**:
- `root.type` must be `'directory'`
- `root.name` must be `''` (empty for root)
- `cwd` must be a valid path within the filesystem

### GitCommit

Represents a single commit in the repository.

| Field | Type | Description |
|-------|------|-------------|
| `hash` | `string` | Short commit hash (7 chars) |
| `message` | `string` | Commit message |
| `timestamp` | `number` | Unix timestamp of commit |
| `parentHash` | `string \| null` | Parent commit hash (null for initial) |
| `snapshot` | `Record<string, string>` | Path → content at commit time |

**Validation rules**:
- `hash` must be 7 lowercase hex characters
- `message` must not be empty
- `snapshot` keys must be absolute paths

### GitBranch

Represents a branch pointer.

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Branch name |
| `commitHash` | `string` | Hash of commit branch points to |

**Validation rules**:
- `name` must not contain spaces or special characters
- `commitHash` must reference existing commit

### GitState

Root git state object persisted to localStorage.

| Field | Type | Description |
|-------|------|-------------|
| `version` | `number` | Schema version for migrations |
| `initialized` | `boolean` | Whether git init has been run |
| `currentBranch` | `string` | Name of checked-out branch |
| `branches` | `Record<string, string>` | Branch name → commit hash |
| `commits` | `GitCommit[]` | All commits (chronological order) |
| `stagingArea` | `string[]` | Paths staged for next commit |

**Validation rules**:
- If `initialized === true`, `currentBranch` must exist in `branches`
- `branches` must contain at least one entry if `initialized`
- `stagingArea` paths must be valid filesystem paths

## Relationships

```
FileSystemState
└── root: FileSystemNode (directory)
    └── children: Record<string, FileSystemNode>
        └── (recursive)

GitState
├── commits: GitCommit[]
│   └── parentHash → GitCommit.hash
├── branches: Record<name, commitHash>
│   └── commitHash → GitCommit.hash
└── stagingArea: string[]
    └── paths reference FileSystemNode
```

## State Transitions

### FileSystem Operations

| Operation | State Changes |
|-----------|---------------|
| `cd <path>` | Update `cwd` |
| `mkdir <name>` | Add directory node to current directory's children |
| `touch <name>` | Add file node (empty content) to current directory |
| `rm <path>` | Remove node from parent's children |
| `cp <src> <dest>` | Deep copy node to destination |
| `mv <src> <dest>` | Remove from source, add to destination |
| `echo "text" > file` | Update file content (overwrite) |
| `echo "text" >> file` | Update file content (append) |

### Git Operations

| Operation | State Changes |
|-----------|---------------|
| `git init` | Set `initialized=true`, create `main` branch, set `currentBranch` |
| `git add <file>` | Add path to `stagingArea` |
| `git add .` | Add all modified/new files to `stagingArea` |
| `git reset <file>` | Remove path from `stagingArea` |
| `git commit -m "msg"` | Create new `GitCommit`, update branch pointer, clear staging |
| `git branch <name>` | Add new entry to `branches` pointing to HEAD |
| `git checkout <branch>` | Update `currentBranch`, restore filesystem from commit snapshot |
| `git merge <branch>` | Create merge commit, update branch pointer |

## localStorage Keys

| Key | Value Type | Description |
|-----|------------|-------------|
| `terminal-fs` | `FileSystemState` (JSON) | Filesystem state |
| `terminal-git` | `GitState` (JSON) | Git repository state |

## Default Filesystem Structure

```typescript
const defaultFileSystem: FileSystemNode = {
  type: 'directory',
  name: '',
  children: {
    home: {
      type: 'directory',
      name: 'home',
      children: {
        user: {
          type: 'directory',
          name: 'user',
          children: {
            projects: {
              type: 'directory',
              name: 'projects',
              children: {
                portfolio: {
                  type: 'directory',
                  name: 'portfolio',
                  children: {
                    'README.md': {
                      type: 'file',
                      name: 'README.md',
                      content: '# Portfolio\n\nWelcome to my portfolio project.',
                      createdAt: Date.now(),
                      modifiedAt: Date.now()
                    }
                  },
                  createdAt: Date.now(),
                  modifiedAt: Date.now()
                }
              },
              createdAt: Date.now(),
              modifiedAt: Date.now()
            },
            documents: {
              type: 'directory',
              name: 'documents',
              children: {},
              createdAt: Date.now(),
              modifiedAt: Date.now()
            },
            '.bashrc': {
              type: 'file',
              name: '.bashrc',
              content: '# Bash configuration\nexport PS1="user@terminal $ "',
              createdAt: Date.now(),
              modifiedAt: Date.now()
            }
          },
          createdAt: Date.now(),
          modifiedAt: Date.now()
        }
      },
      createdAt: Date.now(),
      modifiedAt: Date.now()
    },
    etc: {
      type: 'directory',
      name: 'etc',
      children: {},
      createdAt: Date.now(),
      modifiedAt: Date.now()
    },
    tmp: {
      type: 'directory',
      name: 'tmp',
      children: {},
      createdAt: Date.now(),
      modifiedAt: Date.now()
    }
  },
  createdAt: Date.now(),
  modifiedAt: Date.now()
}
```

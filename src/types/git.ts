/**
 * Git Types
 *
 * Type definitions for the mock git version control service.
 */

/**
 * Represents a git commit.
 */
export type GitCommit = {
  /** Short commit hash (7 hex chars) */
  hash: string
  /** Commit message */
  message: string
  /** Commit timestamp */
  timestamp: number
  /** Parent commit hash (null for initial commit) */
  parentHash: string | null
  /** Snapshot of all file contents at commit time (path -> content) */
  snapshot: Record<string, string>
}

/**
 * Git repository state persisted to localStorage.
 */
export type GitState = {
  /** Schema version for migrations */
  version: number
  /** Whether repository is initialized */
  initialized: boolean
  /** Current branch name */
  currentBranch: string
  /** Branch name -> commit hash mapping */
  branches: Record<string, string>
  /** All commits in chronological order */
  commits: GitCommit[]
  /** Paths staged for next commit */
  stagingArea: string[]
}

/**
 * Result of a git operation.
 */
export type GitResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * File status for git status command.
 */
export type FileStatus = {
  /** File path */
  path: string
  /** Status type */
  status: 'new' | 'modified' | 'deleted' | 'staged' | 'untracked'
}

/**
 * Diff entry for git diff command.
 */
export type DiffEntry = {
  /** File path */
  path: string
  /** Change type */
  type: 'added' | 'removed' | 'modified'
  /** Previous content (for modified/removed) */
  oldContent?: string
  /** New content (for added/modified) */
  newContent?: string
}

/**
 * Log entry for git log command.
 */
export type LogEntry = {
  /** Commit hash */
  hash: string
  /** Commit message */
  message: string
  /** Commit timestamp */
  timestamp: number
  /** Branch name if this is a branch head */
  branch?: string
}

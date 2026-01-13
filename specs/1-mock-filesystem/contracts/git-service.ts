/**
 * Git Service Contract
 *
 * Defines the interface for the mock git version control service.
 * Simulates git operations within the mock filesystem.
 */

import { IFileSystemService } from './filesystem-service'

// ============================================================
// Types
// ============================================================

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
  /** Snapshot of all file contents at commit time */
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
  path: string
  status: 'new' | 'modified' | 'deleted' | 'staged' | 'untracked'
}

/**
 * Diff entry for git diff command.
 */
export type DiffEntry = {
  path: string
  type: 'added' | 'removed' | 'modified'
  oldContent?: string
  newContent?: string
}

/**
 * Log entry for git log command.
 */
export type LogEntry = {
  hash: string
  message: string
  timestamp: number
  branch?: string
}

// ============================================================
// Service Interface
// ============================================================

export interface IGitService {
  // ----------------------
  // State Management
  // ----------------------

  /** Initialize git service with filesystem reference */
  initialize(fs: IFileSystemService): void

  /** Save current state to localStorage */
  persist(): void

  /** Check if repository is initialized */
  isInitialized(): boolean

  // ----------------------
  // Repository Operations
  // ----------------------

  /** Initialize a new repository */
  init(): GitResult<void>

  /** Get repository status */
  status(): GitResult<{
    branch: string
    staged: FileStatus[]
    unstaged: FileStatus[]
    untracked: FileStatus[]
  }>

  // ----------------------
  // Staging Operations
  // ----------------------

  /** Stage a file for commit */
  add(path: string): GitResult<void>

  /** Stage all changes */
  addAll(): GitResult<void>

  /** Unstage a file */
  reset(path: string): GitResult<void>

  /** Unstage all files */
  resetAll(): GitResult<void>

  // ----------------------
  // Commit Operations
  // ----------------------

  /** Create a new commit */
  commit(message: string): GitResult<{ hash: string }>

  /** Get commit log */
  log(options?: { limit?: number }): GitResult<LogEntry[]>

  /** Show commit details */
  show(hash: string): GitResult<GitCommit>

  // ----------------------
  // Branch Operations
  // ----------------------

  /** Get current branch name */
  getCurrentBranch(): string | null

  /** List all branches */
  listBranches(): GitResult<{ name: string; current: boolean }[]>

  /** Create a new branch */
  branch(name: string): GitResult<void>

  /** Delete a branch */
  deleteBranch(name: string): GitResult<void>

  /** Switch to a branch */
  checkout(branchOrCommit: string): GitResult<void>

  /** Merge a branch into current branch */
  merge(branch: string): GitResult<{ conflicts: boolean; message: string }>

  // ----------------------
  // Diff Operations
  // ----------------------

  /** Show unstaged changes */
  diff(path?: string): GitResult<DiffEntry[]>

  /** Show staged changes */
  diffStaged(path?: string): GitResult<DiffEntry[]>

  // ----------------------
  // Utilities
  // ----------------------

  /** Generate a commit hash */
  generateHash(): string

  /** Get HEAD commit */
  getHead(): GitCommit | null

  /** Check if there are uncommitted changes */
  hasUncommittedChanges(): boolean
}

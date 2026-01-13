/**
 * Git Service
 *
 * Provides mock git version control functionality.
 * Works with the FileSystem service for file operations.
 */

import {
  GitState,
  GitCommit,
  GitResult,
  FileStatus,
  DiffEntry,
  LogEntry,
} from '../types/git'
import { fileSystem } from './filesystem'

const STORAGE_KEY = 'terminal-git'
const SCHEMA_VERSION = 1

/**
 * Creates the default git state (uninitialized).
 */
function createDefaultGitState(): GitState {
  return {
    version: SCHEMA_VERSION,
    initialized: false,
    currentBranch: 'main',
    branches: {},
    commits: [],
    stagingArea: [],
  }
}

/**
 * Git Service class
 *
 * Manages the mock git repository state and operations.
 */
class GitService {
  private state: GitState
  private initialized = false
  private lastSnapshot: Record<string, string> = {}

  constructor() {
    this.state = createDefaultGitState()
  }

  /**
   * Initialize the git service (load from storage).
   */
  initialize(): void {
    if (this.initialized) return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as GitState
        if (parsed.version === SCHEMA_VERSION) {
          this.state = parsed
          // Rebuild last snapshot from HEAD commit
          if (this.state.initialized) {
            const head = this.getHead()
            if (head) {
              this.lastSnapshot = { ...head.snapshot }
            }
          }
        }
      }
    } catch {
      // Use default state on error
    }

    this.initialized = true
  }

  /**
   * Save current state to localStorage.
   */
  persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Reset git state to default (uninitialized).
   */
  reset(): void {
    this.state = createDefaultGitState()
    this.lastSnapshot = {}
    this.initialized = false
    // Clear localStorage and re-persist
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore
    }
  }

  /**
   * Check if repository is initialized.
   */
  isInitialized(): boolean {
    return this.state.initialized
  }

  /**
   * Generate a random commit hash (7 hex chars).
   */
  generateHash(): string {
    const chars = '0123456789abcdef'
    let hash = ''
    for (let i = 0; i < 7; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    return hash
  }

  /**
   * Get the HEAD commit.
   */
  getHead(): GitCommit | null {
    if (!this.state.initialized) return null
    const headHash = this.state.branches[this.state.currentBranch]
    if (!headHash) return null
    return this.state.commits.find(c => c.hash === headHash) || null
  }

  /**
   * Get current branch name.
   */
  getCurrentBranch(): string | null {
    return this.state.initialized ? this.state.currentBranch : null
  }

  /**
   * Initialize a new repository.
   */
  init(): GitResult<void> {
    if (this.state.initialized) {
      return { success: false, error: 'Repository already initialized' }
    }

    this.state.initialized = true
    this.state.currentBranch = 'main'
    this.state.branches = {}
    this.state.commits = []
    this.state.stagingArea = []
    this.lastSnapshot = {}

    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Get current snapshot of all files.
   */
  private getCurrentSnapshot(): Record<string, string> {
    const snapshot: Record<string, string> = {}
    const paths = fileSystem.getAllFilePaths()

    for (const path of paths) {
      const result = fileSystem.cat(path)
      if (result.success) {
        snapshot[path] = result.data
      }
    }

    return snapshot
  }

  /**
   * Get repository status.
   */
  status(): GitResult<{
    branch: string
    staged: FileStatus[]
    unstaged: FileStatus[]
    untracked: FileStatus[]
  }> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    const currentSnapshot = this.getCurrentSnapshot()
    const staged: FileStatus[] = []
    const unstaged: FileStatus[] = []
    const untracked: FileStatus[] = []

    // Check staged files
    for (const path of this.state.stagingArea) {
      const currentContent = currentSnapshot[path]
      const lastContent = this.lastSnapshot[path]

      if (currentContent === undefined && lastContent !== undefined) {
        staged.push({ path, status: 'deleted' })
      } else if (currentContent !== undefined && lastContent === undefined) {
        staged.push({ path, status: 'new' })
      } else if (currentContent !== lastContent) {
        staged.push({ path, status: 'modified' })
      } else {
        staged.push({ path, status: 'staged' })
      }
    }

    // Check all files for changes
    const allPaths = new Set([
      ...Object.keys(currentSnapshot),
      ...Object.keys(this.lastSnapshot),
    ])

    for (const path of allPaths) {
      // Skip if already staged
      if (this.state.stagingArea.includes(path)) continue

      const currentContent = currentSnapshot[path]
      const lastContent = this.lastSnapshot[path]

      if (currentContent === undefined && lastContent !== undefined) {
        unstaged.push({ path, status: 'deleted' })
      } else if (currentContent !== undefined && lastContent === undefined) {
        untracked.push({ path, status: 'untracked' })
      } else if (currentContent !== lastContent) {
        unstaged.push({ path, status: 'modified' })
      }
    }

    return {
      success: true,
      data: {
        branch: this.state.currentBranch,
        staged,
        unstaged,
        untracked,
      },
    }
  }

  /**
   * Stage a file for commit.
   */
  add(path: string): GitResult<void> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    const resolved = fileSystem.resolvePath(path)

    // Check if file exists or was deleted
    const exists = fileSystem.exists(resolved)
    const wasTracked = this.lastSnapshot[resolved] !== undefined

    if (!exists && !wasTracked) {
      return { success: false, error: `Path does not exist: ${path}` }
    }

    if (!this.state.stagingArea.includes(resolved)) {
      this.state.stagingArea.push(resolved)
    }

    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Stage all changes.
   */
  addAll(): GitResult<void> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    const currentSnapshot = this.getCurrentSnapshot()
    const allPaths = new Set([
      ...Object.keys(currentSnapshot),
      ...Object.keys(this.lastSnapshot),
    ])

    this.state.stagingArea = []

    for (const path of allPaths) {
      const currentContent = currentSnapshot[path]
      const lastContent = this.lastSnapshot[path]

      // Only stage if there's a difference
      if (currentContent !== lastContent) {
        this.state.stagingArea.push(path)
      }
    }

    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Unstage a file.
   */
  reset(path: string): GitResult<void> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    const resolved = fileSystem.resolvePath(path)
    const index = this.state.stagingArea.indexOf(resolved)

    if (index === -1) {
      return { success: false, error: `Path not staged: ${path}` }
    }

    this.state.stagingArea.splice(index, 1)
    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Unstage all files.
   */
  resetAll(): GitResult<void> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    this.state.stagingArea = []
    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Create a new commit.
   */
  commit(message: string): GitResult<{ hash: string }> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    if (!message.trim()) {
      return { success: false, error: 'Commit message cannot be empty' }
    }

    if (this.state.stagingArea.length === 0) {
      return { success: false, error: 'Nothing to commit. Stage files with `git add` first.' }
    }

    // Create snapshot from current files
    const currentSnapshot = this.getCurrentSnapshot()
    const newSnapshot: Record<string, string> = { ...this.lastSnapshot }

    // Apply staged changes to snapshot
    for (const path of this.state.stagingArea) {
      if (currentSnapshot[path] !== undefined) {
        newSnapshot[path] = currentSnapshot[path]
      } else {
        delete newSnapshot[path]
      }
    }

    const hash = this.generateHash()
    const parentHash = this.state.branches[this.state.currentBranch] || null

    const commit: GitCommit = {
      hash,
      message: message.trim(),
      timestamp: Date.now(),
      parentHash,
      snapshot: newSnapshot,
    }

    this.state.commits.push(commit)
    this.state.branches[this.state.currentBranch] = hash
    this.state.stagingArea = []
    this.lastSnapshot = newSnapshot

    this.persist()
    return { success: true, data: { hash } }
  }

  /**
   * Get commit log.
   */
  log(options?: { limit?: number }): GitResult<LogEntry[]> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    const headHash = this.state.branches[this.state.currentBranch]
    if (!headHash) {
      return { success: true, data: [] }
    }

    // Build log by following parent chain
    const entries: LogEntry[] = []
    let currentHash: string | null = headHash

    while (currentHash) {
      const commit = this.state.commits.find(c => c.hash === currentHash)
      if (!commit) break

      // Find branches pointing to this commit
      const branches = Object.entries(this.state.branches)
        .filter(([, hash]) => hash === commit.hash)
        .map(([name]) => name)

      entries.push({
        hash: commit.hash,
        message: commit.message,
        timestamp: commit.timestamp,
        branch: branches.length > 0 ? branches.join(', ') : undefined,
      })

      currentHash = commit.parentHash

      if (options?.limit && entries.length >= options.limit) break
    }

    return { success: true, data: entries }
  }

  /**
   * Show commit details.
   */
  show(hash: string): GitResult<GitCommit> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    const commit = this.state.commits.find(c => c.hash.startsWith(hash))
    if (!commit) {
      return { success: false, error: `Commit not found: ${hash}` }
    }

    return { success: true, data: commit }
  }

  /**
   * List all branches.
   */
  listBranches(): GitResult<{ name: string; current: boolean }[]> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    const branches = Object.keys(this.state.branches).map(name => ({
      name,
      current: name === this.state.currentBranch,
    }))

    // Sort with current branch first
    branches.sort((a, b) => {
      if (a.current) return -1
      if (b.current) return 1
      return a.name.localeCompare(b.name)
    })

    return { success: true, data: branches }
  }

  /**
   * Create a new branch.
   */
  branch(name: string): GitResult<void> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    if (!name.trim()) {
      return { success: false, error: 'Branch name cannot be empty' }
    }

    if (this.state.branches[name]) {
      return { success: false, error: `Branch already exists: ${name}` }
    }

    const headHash = this.state.branches[this.state.currentBranch]
    if (!headHash) {
      return { success: false, error: 'Cannot create branch: no commits yet' }
    }

    this.state.branches[name] = headHash
    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Delete a branch.
   */
  deleteBranch(name: string): GitResult<void> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    if (name === this.state.currentBranch) {
      return { success: false, error: 'Cannot delete current branch' }
    }

    if (!this.state.branches[name]) {
      return { success: false, error: `Branch not found: ${name}` }
    }

    delete this.state.branches[name]
    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Switch to a branch.
   */
  checkout(branchOrCommit: string): GitResult<void> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    // Check for uncommitted changes
    const statusResult = this.status()
    if (statusResult.success) {
      const { staged, unstaged } = statusResult.data
      if (staged.length > 0 || unstaged.length > 0) {
        return { success: false, error: 'Cannot checkout: you have uncommitted changes. Commit or stash them first.' }
      }
    }

    // Check if it's a branch
    if (this.state.branches[branchOrCommit]) {
      this.state.currentBranch = branchOrCommit
      const headHash = this.state.branches[branchOrCommit]
      const commit = this.state.commits.find(c => c.hash === headHash)

      if (commit) {
        this.lastSnapshot = { ...commit.snapshot }
        fileSystem.restoreFromSnapshot(commit.snapshot)
      }

      this.persist()
      return { success: true, data: undefined }
    }

    // Check if it's a commit hash
    const commit = this.state.commits.find(c => c.hash.startsWith(branchOrCommit))
    if (commit) {
      // Detached HEAD state - for simplicity, create a temp branch
      this.lastSnapshot = { ...commit.snapshot }
      fileSystem.restoreFromSnapshot(commit.snapshot)
      this.persist()
      return { success: true, data: undefined }
    }

    return { success: false, error: `Branch or commit not found: ${branchOrCommit}` }
  }

  /**
   * Merge a branch into current branch (fast-forward only).
   */
  merge(sourceBranch: string): GitResult<{ conflicts: boolean; message: string }> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    if (!this.state.branches[sourceBranch]) {
      return { success: false, error: `Branch not found: ${sourceBranch}` }
    }

    if (sourceBranch === this.state.currentBranch) {
      return { success: false, error: 'Cannot merge branch into itself' }
    }

    const sourceHash = this.state.branches[sourceBranch]
    const targetHash = this.state.branches[this.state.currentBranch]

    // Check if already merged (source is ancestor of target)
    if (sourceHash === targetHash) {
      return { success: true, data: { conflicts: false, message: 'Already up to date.' } }
    }

    // Check if fast-forward is possible (target is ancestor of source)
    let isAncestor = false
    let currentHash: string | null = sourceHash

    while (currentHash) {
      if (currentHash === targetHash) {
        isAncestor = true
        break
      }
      const commit = this.state.commits.find(c => c.hash === currentHash)
      currentHash = commit?.parentHash || null
    }

    if (isAncestor || !targetHash) {
      // Fast-forward merge
      this.state.branches[this.state.currentBranch] = sourceHash
      const sourceCommit = this.state.commits.find(c => c.hash === sourceHash)

      if (sourceCommit) {
        this.lastSnapshot = { ...sourceCommit.snapshot }
        fileSystem.restoreFromSnapshot(sourceCommit.snapshot)
      }

      this.persist()
      return { success: true, data: { conflicts: false, message: `Fast-forward merge to ${sourceBranch}` } }
    }

    // For simplicity, we don't support non-fast-forward merges
    return {
      success: false,
      error: 'Cannot fast-forward. Non-fast-forward merges are not supported in this mock git.',
    }
  }

  /**
   * Show unstaged changes.
   */
  diff(path?: string): GitResult<DiffEntry[]> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    const currentSnapshot = this.getCurrentSnapshot()
    const entries: DiffEntry[] = []

    const pathsToCheck = path
      ? [fileSystem.resolvePath(path)]
      : [...new Set([...Object.keys(currentSnapshot), ...Object.keys(this.lastSnapshot)])]

    for (const filePath of pathsToCheck) {
      // Skip staged files
      if (this.state.stagingArea.includes(filePath)) continue

      const currentContent = currentSnapshot[filePath]
      const lastContent = this.lastSnapshot[filePath]

      if (currentContent === undefined && lastContent !== undefined) {
        entries.push({ path: filePath, type: 'removed', oldContent: lastContent })
      } else if (currentContent !== undefined && lastContent === undefined) {
        entries.push({ path: filePath, type: 'added', newContent: currentContent })
      } else if (currentContent !== lastContent) {
        entries.push({
          path: filePath,
          type: 'modified',
          oldContent: lastContent,
          newContent: currentContent,
        })
      }
    }

    return { success: true, data: entries }
  }

  /**
   * Show staged changes.
   */
  diffStaged(path?: string): GitResult<DiffEntry[]> {
    if (!this.state.initialized) {
      return { success: false, error: 'Not a git repository. Run `git init` first.' }
    }

    const currentSnapshot = this.getCurrentSnapshot()
    const entries: DiffEntry[] = []

    const pathsToCheck = path
      ? [fileSystem.resolvePath(path)]
      : this.state.stagingArea

    for (const filePath of pathsToCheck) {
      if (!this.state.stagingArea.includes(filePath)) continue

      const currentContent = currentSnapshot[filePath]
      const lastContent = this.lastSnapshot[filePath]

      if (currentContent === undefined && lastContent !== undefined) {
        entries.push({ path: filePath, type: 'removed', oldContent: lastContent })
      } else if (currentContent !== undefined && lastContent === undefined) {
        entries.push({ path: filePath, type: 'added', newContent: currentContent })
      } else if (currentContent !== lastContent) {
        entries.push({
          path: filePath,
          type: 'modified',
          oldContent: lastContent,
          newContent: currentContent,
        })
      }
    }

    return { success: true, data: entries }
  }

  /**
   * Check if there are uncommitted changes.
   */
  hasUncommittedChanges(): boolean {
    const statusResult = this.status()
    if (!statusResult.success) return false

    const { staged, unstaged, untracked } = statusResult.data
    return staged.length > 0 || unstaged.length > 0 || untracked.length > 0
  }

  /**
   * Reset git state (for clearfs command).
   */
  resetState(): void {
    this.state = createDefaultGitState()
    this.lastSnapshot = {}
    this.persist()
  }
}

// Export singleton instance
export const gitService = new GitService()

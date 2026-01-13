/**
 * FileSystem Service Contract
 *
 * Defines the interface for the mock filesystem service.
 * All filesystem operations go through this service.
 */

// ============================================================
// Types
// ============================================================

/**
 * Represents a node in the filesystem tree.
 */
export type FileSystemNode = {
  /** Node type: file or directory */
  type: 'file' | 'directory'
  /** Node name (basename, no slashes) */
  name: string
  /** File contents (only for files) */
  content?: string
  /** Child nodes keyed by name (only for directories) */
  children?: Record<string, FileSystemNode>
  /** Creation timestamp */
  createdAt: number
  /** Last modification timestamp */
  modifiedAt: number
}

/**
 * Root filesystem state persisted to localStorage.
 */
export type FileSystemState = {
  /** Schema version for migrations */
  version: number
  /** Root directory node */
  root: FileSystemNode
  /** Current working directory (absolute path) */
  cwd: string
}

/**
 * Result of a filesystem operation.
 */
export type FSResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Directory entry for ls command output.
 */
export type DirectoryEntry = {
  name: string
  type: 'file' | 'directory'
  size: number
  modifiedAt: number
}

// ============================================================
// Service Interface
// ============================================================

export interface IFileSystemService {
  // ----------------------
  // State Management
  // ----------------------

  /** Initialize filesystem (load from storage or create default) */
  initialize(): void

  /** Save current state to localStorage */
  persist(): void

  /** Reset filesystem to default state */
  reset(): void

  // ----------------------
  // Navigation
  // ----------------------

  /** Get current working directory */
  getCwd(): string

  /** Change current working directory */
  cd(path: string): FSResult<string>

  /** Resolve a path (relative or absolute) to absolute path */
  resolvePath(path: string): string

  /** Check if a path exists */
  exists(path: string): boolean

  /** Check if path is a directory */
  isDirectory(path: string): boolean

  /** Check if path is a file */
  isFile(path: string): boolean

  // ----------------------
  // Directory Operations
  // ----------------------

  /** List directory contents */
  ls(path?: string, options?: { all?: boolean; long?: boolean }): FSResult<DirectoryEntry[]>

  /** Create a directory */
  mkdir(path: string): FSResult<void>

  /** Remove an empty directory */
  rmdir(path: string): FSResult<void>

  // ----------------------
  // File Operations
  // ----------------------

  /** Create an empty file or update timestamp */
  touch(path: string): FSResult<void>

  /** Read file contents */
  cat(path: string): FSResult<string>

  /** Write content to file (overwrite) */
  writeFile(path: string, content: string): FSResult<void>

  /** Append content to file */
  appendFile(path: string, content: string): FSResult<void>

  /** Remove a file or directory */
  rm(path: string, options?: { recursive?: boolean }): FSResult<void>

  /** Copy a file or directory */
  cp(src: string, dest: string): FSResult<void>

  /** Move/rename a file or directory */
  mv(src: string, dest: string): FSResult<void>

  // ----------------------
  // Search Operations
  // ----------------------

  /** Find files matching a pattern */
  find(path: string, pattern: string): FSResult<string[]>

  /** Search file contents for a pattern */
  grep(pattern: string, path: string): FSResult<{ path: string; line: number; content: string }[]>

  // ----------------------
  // Tab Completion
  // ----------------------

  /** Get completions for a partial path */
  getCompletions(partialPath: string): string[]

  // ----------------------
  // Utilities
  // ----------------------

  /** Get node at path */
  getNode(path: string): FileSystemNode | null

  /** Get all file paths (for git operations) */
  getAllFilePaths(path?: string): string[]

  /** Get storage usage in bytes */
  getStorageUsage(): number
}

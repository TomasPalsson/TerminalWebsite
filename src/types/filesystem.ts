/**
 * Filesystem Types
 *
 * Type definitions for the mock filesystem service.
 */

/**
 * Represents a node in the filesystem tree (file or directory).
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
  /** Entry name */
  name: string
  /** Entry type */
  type: 'file' | 'directory'
  /** Size in bytes (content length for files, 0 for directories) */
  size: number
  /** Last modification timestamp */
  modifiedAt: number
}

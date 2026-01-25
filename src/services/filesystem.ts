/**
 * FileSystem Service
 *
 * Provides a mock filesystem with localStorage persistence.
 * Implements Unix-style path resolution and common file operations.
 */

import {
  FileSystemNode,
  FileSystemState,
  FSResult,
  DirectoryEntry,
} from '../types/filesystem'

const STORAGE_KEY = 'terminal-fs'
// Increment this when changing the FileSystemState structure
// Old data with mismatched version will be discarded and replaced with defaults
const SCHEMA_VERSION = 1

/**
 * Helper to build filesystem from simple declarations.
 */
class FileSystemBuilder {
  private root: FileSystemNode
  private now = Date.now()

  constructor() {
    this.root = {
      type: 'directory',
      name: '',
      children: {},
      createdAt: this.now,
      modifiedAt: this.now,
    }
  }

  /**
   * Create a directory (and all parent directories).
   * Example: dir('/home/user/projects')
   */
  dir(path: string): this {
    const parts = path.split('/').filter(Boolean)
    let current = this.root

    for (const part of parts) {
      if (!current.children) current.children = {}
      if (!current.children[part]) {
        current.children[part] = {
          type: 'directory',
          name: part,
          children: {},
          createdAt: this.now,
          modifiedAt: this.now,
        }
      }
      current = current.children[part]
    }
    return this
  }

  /**
   * Create a file with content (creates parent directories too).
   * Example: file('/home/user/.zshrc', 'export EDITOR=vim')
   */
  file(path: string, content: string): this {
    const parts = path.split('/').filter(Boolean)
    const fileName = parts.pop()!

    // Create parent directories
    if (parts.length > 0) {
      this.dir('/' + parts.join('/'))
    }

    // Navigate to parent
    let current = this.root
    for (const part of parts) {
      current = current.children![part]
    }

    // Create file
    if (!current.children) current.children = {}
    current.children[fileName] = {
      type: 'file',
      name: fileName,
      content,
      createdAt: this.now,
      modifiedAt: this.now,
    }
    return this
  }

  build(): FileSystemNode {
    return this.root
  }
}

/**
 * Creates the default filesystem structure.
 *
 * To add new directories: .dir('/path/to/folder')
 * To add new files: .file('/path/to/file.txt', 'content here')
 */
function createDefaultFileSystem(): FileSystemNode {
  return new FileSystemBuilder()
    // Directories
    .dir('/home/user/projects')
    .dir('/home/user/documents')
    .dir('/etc')
    .dir('/tmp')

    // Files
    .file('/home/user/.zshrc', `# Zsh configuration
export PS1="user@terminal $ "
export EDITOR="vim"
export TERM="xterm-256color"
`)
    .file('/home/user/projects/README.md', `# Projects

A collection of things I've built.

## Canvas App
AI-powered LMS client built with Flutter.
Helps students manage assignments and deadlines.

## Language Compiler
A compiler written in Rust that compiles a custom
language down to machine code. Includes lexer,
parser, and code generator.

## Terminal Portfolio
You're looking at it! A terminal-themed portfolio
with vim, git, and a mock filesystem.
`)
    .file('/home/user/projects/hello.py', `#!/usr/bin/env python3
"""A simple Python script."""

def greet(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))
    print("Welcome to my terminal portfolio!")
`)
    .file('/etc/passwd', `# Why are you looking here? ;)
root:x:0:0:root:/root:/bin/bash
user:x:1000:1000:Tómas:/home/user:/bin/zsh
guest:x:1001:1001:Guest User:/home/guest:/bin/false
`)
    .build()
}

/**
 * FileSystem Service class
 *
 * Manages the mock filesystem state and operations.
 */
class FileSystemService {
  private state: FileSystemState
  private initialized = false

  constructor() {
    this.state = {
      version: SCHEMA_VERSION,
      root: createDefaultFileSystem(),
      cwd: '/home/user',
    }
  }

  /**
   * Initialize the filesystem (load from storage or create default).
   */
  initialize(): void {
    if (this.initialized) return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as FileSystemState
        if (parsed.version === SCHEMA_VERSION) {
          this.state = parsed
          // Validate that cwd exists, reset to /home/user if not
          const cwdNode = this.getNode(this.state.cwd)
          if (!cwdNode || cwdNode.type !== 'directory') {
            this.state.cwd = '/home/user'
            this.persist()
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
      // Ignore storage errors (e.g., quota exceeded)
    }
  }

  /**
   * Reset filesystem to default state.
   */
  reset(): void {
    this.state = {
      version: SCHEMA_VERSION,
      root: createDefaultFileSystem(),
      cwd: '/home/user',
    }
    this.persist()
  }

  /**
   * Get current working directory.
   */
  getCwd(): string {
    return this.state.cwd
  }

  /**
   * Normalize a path by resolving . and .. and removing duplicate slashes.
   */
  private normalizePath(path: string): string {
    // Handle empty path
    if (!path) return this.state.cwd

    // Split path into segments
    const segments = path.split('/').filter(Boolean)
    const result: string[] = []

    // Determine if path is absolute
    const isAbsolute = path.startsWith('/')

    // Start with cwd if relative path
    if (!isAbsolute) {
      result.push(...this.state.cwd.split('/').filter(Boolean))
    }

    // Process each segment
    for (const segment of segments) {
      if (segment === '.') {
        // Current directory - skip
        continue
      } else if (segment === '..') {
        // Parent directory - pop if possible
        if (result.length > 0) {
          result.pop()
        }
      } else {
        result.push(segment)
      }
    }

    return '/' + result.join('/')
  }

  /**
   * Resolve a path (relative or absolute) to an absolute path.
   */
  resolvePath(path: string): string {
    return this.normalizePath(path)
  }

  /**
   * Get a node at the given path.
   */
  getNode(path: string): FileSystemNode | null {
    const normalized = this.normalizePath(path)

    // Root path
    if (normalized === '/') {
      return this.state.root
    }

    // Traverse the tree
    const segments = normalized.split('/').filter(Boolean)
    let current: FileSystemNode = this.state.root

    for (const segment of segments) {
      if (current.type !== 'directory' || !current.children) {
        return null
      }
      const child = current.children[segment]
      if (!child) {
        return null
      }
      current = child
    }

    return current
  }

  /**
   * Check if a path exists.
   */
  exists(path: string): boolean {
    return this.getNode(path) !== null
  }

  /**
   * Check if path is a directory.
   */
  isDirectory(path: string): boolean {
    const node = this.getNode(path)
    return node !== null && node.type === 'directory'
  }

  /**
   * Check if path is a file.
   */
  isFile(path: string): boolean {
    const node = this.getNode(path)
    return node !== null && node.type === 'file'
  }

  /**
   * Change current working directory.
   */
  cd(path: string): FSResult<string> {
    const normalized = this.normalizePath(path)
    const node = this.getNode(normalized)

    if (!node) {
      return { success: false, error: `No such directory: ${path}` }
    }

    if (node.type !== 'directory') {
      return { success: false, error: `Not a directory: ${path}` }
    }

    this.state.cwd = normalized
    this.persist()
    return { success: true, data: normalized }
  }

  /**
   * List directory contents.
   */
  ls(path?: string, options?: { all?: boolean; long?: boolean }): FSResult<DirectoryEntry[]> {
    const targetPath = path ? this.normalizePath(path) : this.state.cwd
    const node = this.getNode(targetPath)

    if (!node) {
      return { success: false, error: `No such directory: ${path || this.state.cwd}` }
    }

    if (node.type !== 'directory') {
      // If it's a file, return just that file
      return {
        success: true,
        data: [{
          name: node.name,
          type: 'file',
          size: node.content?.length || 0,
          modifiedAt: node.modifiedAt,
        }],
      }
    }

    const entries: DirectoryEntry[] = []
    const children = node.children || {}

    for (const [name, child] of Object.entries(children)) {
      // Skip hidden files unless -a flag
      if (!options?.all && name.startsWith('.')) {
        continue
      }

      entries.push({
        name,
        type: child.type,
        size: child.type === 'file' ? (child.content?.length || 0) : 0,
        modifiedAt: child.modifiedAt,
      })
    }

    // Unix convention: directories first, then alphabetical within each group
    entries.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    return { success: true, data: entries }
  }

  /**
   * Get completions for tab completion.
   */
  getCompletions(partialPath: string): string[] {
    // Handle empty input
    if (!partialPath) {
      const result = this.ls(undefined, { all: true })
      if (!result.success) return []
      return result.data.map(e => e.name + (e.type === 'directory' ? '/' : ''))
    }

    // Split into directory part and prefix
    const lastSlash = partialPath.lastIndexOf('/')
    let dirPath: string
    let prefix: string

    if (lastSlash === -1) {
      // No slash - complete in current directory
      dirPath = this.state.cwd
      prefix = partialPath
    } else if (lastSlash === 0) {
      // Starts with / - completing from root
      dirPath = '/'
      prefix = partialPath.slice(1)
    } else {
      dirPath = partialPath.slice(0, lastSlash) || '/'
      prefix = partialPath.slice(lastSlash + 1)
    }

    const result = this.ls(dirPath, { all: true })
    if (!result.success) return []

    const matches = result.data
      .filter(e => e.name.startsWith(prefix))
      .map(e => {
        const fullPath = lastSlash === -1
          ? e.name
          : partialPath.slice(0, lastSlash + 1) + e.name
        return fullPath + (e.type === 'directory' ? '/' : '')
      })

    return matches
  }

  /**
   * Create an empty file or update timestamp.
   */
  touch(path: string): FSResult<void> {
    const normalized = this.normalizePath(path)
    const parentPath = normalized.substring(0, normalized.lastIndexOf('/')) || '/'
    const fileName = normalized.substring(normalized.lastIndexOf('/') + 1)

    if (!fileName) {
      return { success: false, error: 'Invalid filename' }
    }

    const parent = this.getNode(parentPath)
    if (!parent) {
      return { success: false, error: `No such directory: ${parentPath}` }
    }
    if (parent.type !== 'directory') {
      return { success: false, error: `Not a directory: ${parentPath}` }
    }

    const now = Date.now()
    const existing = parent.children?.[fileName]

    if (existing) {
      // Update timestamp
      existing.modifiedAt = now
    } else {
      // Create new file
      parent.children = parent.children || {}
      parent.children[fileName] = {
        type: 'file',
        name: fileName,
        content: '',
        createdAt: now,
        modifiedAt: now,
      }
    }

    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Read file contents.
   */
  cat(path: string): FSResult<string> {
    const node = this.getNode(path)

    if (!node) {
      return { success: false, error: `No such file: ${path}` }
    }

    if (node.type !== 'file') {
      return { success: false, error: `Is a directory: ${path}` }
    }

    return { success: true, data: node.content || '' }
  }

  /**
   * Create a directory.
   */
  mkdir(path: string): FSResult<void> {
    const normalized = this.normalizePath(path)
    const parentPath = normalized.substring(0, normalized.lastIndexOf('/')) || '/'
    const dirName = normalized.substring(normalized.lastIndexOf('/') + 1)

    if (!dirName) {
      return { success: false, error: 'Invalid directory name' }
    }

    const parent = this.getNode(parentPath)
    if (!parent) {
      return { success: false, error: `No such directory: ${parentPath}` }
    }
    if (parent.type !== 'directory') {
      return { success: false, error: `Not a directory: ${parentPath}` }
    }

    if (parent.children?.[dirName]) {
      return { success: false, error: `Already exists: ${path}` }
    }

    const now = Date.now()
    parent.children = parent.children || {}
    parent.children[dirName] = {
      type: 'directory',
      name: dirName,
      children: {},
      createdAt: now,
      modifiedAt: now,
    }

    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Remove a file or directory.
   */
  rm(path: string, options?: { recursive?: boolean }): FSResult<void> {
    const normalized = this.normalizePath(path)

    if (normalized === '/') {
      return { success: false, error: 'Cannot remove root directory' }
    }

    const parentPath = normalized.substring(0, normalized.lastIndexOf('/')) || '/'
    const name = normalized.substring(normalized.lastIndexOf('/') + 1)

    const parent = this.getNode(parentPath)
    if (!parent || parent.type !== 'directory' || !parent.children) {
      return { success: false, error: `No such file or directory: ${path}` }
    }

    const node = parent.children[name]
    if (!node) {
      return { success: false, error: `No such file or directory: ${path}` }
    }

    if (node.type === 'directory') {
      const hasChildren = Object.keys(node.children || {}).length > 0
      if (hasChildren && !options?.recursive) {
        return { success: false, error: `Directory not empty: ${path}. Use rm -r to remove recursively.` }
      }
    }

    // If deleting cwd or an ancestor, move cwd up to avoid orphaned state
    // e.g., if cwd is /home/user/projects and we delete /home/user
    if (this.state.cwd === normalized || this.state.cwd.startsWith(normalized + '/')) {
      this.state.cwd = parentPath
    }

    delete parent.children[name]
    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Remove an empty directory.
   */
  rmdir(path: string): FSResult<void> {
    const node = this.getNode(path)

    if (!node) {
      return { success: false, error: `No such directory: ${path}` }
    }

    if (node.type !== 'directory') {
      return { success: false, error: `Not a directory: ${path}` }
    }

    const hasChildren = Object.keys(node.children || {}).length > 0
    if (hasChildren) {
      return { success: false, error: `Directory not empty: ${path}` }
    }

    return this.rm(path)
  }

  /**
   * Deep copy a node.
   */
  private deepCopyNode(node: FileSystemNode, newName?: string): FileSystemNode {
    const now = Date.now()
    const copy: FileSystemNode = {
      type: node.type,
      name: newName || node.name,
      createdAt: now,
      modifiedAt: now,
    }

    if (node.type === 'file') {
      copy.content = node.content
    } else {
      copy.children = {}
      for (const [childName, childNode] of Object.entries(node.children || {})) {
        copy.children[childName] = this.deepCopyNode(childNode)
      }
    }

    return copy
  }

  /**
   * Copy a file or directory.
   */
  cp(src: string, dest: string): FSResult<void> {
    const srcNode = this.getNode(src)
    if (!srcNode) {
      return { success: false, error: `No such file or directory: ${src}` }
    }

    const normalizedDest = this.normalizePath(dest)
    const destNode = this.getNode(normalizedDest)

    let targetPath: string
    let targetName: string

    if (destNode && destNode.type === 'directory') {
      // Copy into directory
      targetPath = normalizedDest
      targetName = srcNode.name
    } else {
      // Copy to new name
      targetPath = normalizedDest.substring(0, normalizedDest.lastIndexOf('/')) || '/'
      targetName = normalizedDest.substring(normalizedDest.lastIndexOf('/') + 1)
    }

    const targetDir = this.getNode(targetPath)
    if (!targetDir || targetDir.type !== 'directory') {
      return { success: false, error: `No such directory: ${targetPath}` }
    }

    targetDir.children = targetDir.children || {}
    targetDir.children[targetName] = this.deepCopyNode(srcNode, targetName)

    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Move/rename a file or directory.
   */
  mv(src: string, dest: string): FSResult<void> {
    const srcNormalized = this.normalizePath(src)
    const srcNode = this.getNode(srcNormalized)

    if (!srcNode) {
      return { success: false, error: `No such file or directory: ${src}` }
    }

    if (srcNormalized === '/') {
      return { success: false, error: 'Cannot move root directory' }
    }

    const normalizedDest = this.normalizePath(dest)
    const destNode = this.getNode(normalizedDest)

    let targetPath: string
    let targetName: string

    if (destNode && destNode.type === 'directory') {
      // Move into directory
      targetPath = normalizedDest
      targetName = srcNode.name
    } else {
      // Move to new name
      targetPath = normalizedDest.substring(0, normalizedDest.lastIndexOf('/')) || '/'
      targetName = normalizedDest.substring(normalizedDest.lastIndexOf('/') + 1)
    }

    const targetDir = this.getNode(targetPath)
    if (!targetDir || targetDir.type !== 'directory') {
      return { success: false, error: `No such directory: ${targetPath}` }
    }

    // Get source parent
    const srcParentPath = srcNormalized.substring(0, srcNormalized.lastIndexOf('/')) || '/'
    const srcName = srcNormalized.substring(srcNormalized.lastIndexOf('/') + 1)
    const srcParent = this.getNode(srcParentPath)

    if (!srcParent || srcParent.type !== 'directory' || !srcParent.children) {
      return { success: false, error: `Cannot access source: ${src}` }
    }

    // Move the node
    targetDir.children = targetDir.children || {}
    targetDir.children[targetName] = srcNode
    srcNode.name = targetName
    delete srcParent.children[srcName]

    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Write content to file (overwrite).
   */
  writeFile(path: string, content: string): FSResult<void> {
    const normalized = this.normalizePath(path)
    const node = this.getNode(normalized)

    if (node) {
      if (node.type !== 'file') {
        return { success: false, error: `Is a directory: ${path}` }
      }
      node.content = content
      node.modifiedAt = Date.now()
    } else {
      // Create new file
      const parentPath = normalized.substring(0, normalized.lastIndexOf('/')) || '/'
      const fileName = normalized.substring(normalized.lastIndexOf('/') + 1)

      const parent = this.getNode(parentPath)
      if (!parent || parent.type !== 'directory') {
        return { success: false, error: `No such directory: ${parentPath}` }
      }

      const now = Date.now()
      parent.children = parent.children || {}
      parent.children[fileName] = {
        type: 'file',
        name: fileName,
        content,
        createdAt: now,
        modifiedAt: now,
      }
    }

    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Append content to file.
   */
  appendFile(path: string, content: string): FSResult<void> {
    const normalized = this.normalizePath(path)
    const node = this.getNode(normalized)

    if (node) {
      if (node.type !== 'file') {
        return { success: false, error: `Is a directory: ${path}` }
      }
      node.content = (node.content || '') + content
      node.modifiedAt = Date.now()
    } else {
      // Create new file with content
      return this.writeFile(path, content)
    }

    this.persist()
    return { success: true, data: undefined }
  }

  /**
   * Find files matching a pattern.
   */
  find(startPath: string, pattern: string): FSResult<string[]> {
    const normalized = this.normalizePath(startPath)
    const startNode = this.getNode(normalized)

    if (!startNode) {
      return { success: false, error: `No such directory: ${startPath}` }
    }

    const matches: string[] = []
    // Convert glob pattern to regex: * -> .* (any chars), ? -> . (single char)
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'))

    const search = (node: FileSystemNode, currentPath: string) => {
      if (regex.test(node.name)) {
        matches.push(currentPath)
      }

      if (node.type === 'directory' && node.children) {
        for (const [name, child] of Object.entries(node.children)) {
          const childPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`
          search(child, childPath)
        }
      }
    }

    search(startNode, normalized)
    return { success: true, data: matches }
  }

  /**
   * Search file contents for a pattern.
   */
  grep(pattern: string, path: string): FSResult<{ path: string; line: number; content: string }[]> {
    const normalized = this.normalizePath(path)
    const node = this.getNode(normalized)

    if (!node) {
      return { success: false, error: `No such file or directory: ${path}` }
    }

    const results: { path: string; line: number; content: string }[] = []
    const regex = new RegExp(pattern)

    const searchFile = (filePath: string, content: string) => {
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        if (regex.test(line)) {
          results.push({
            path: filePath,
            line: index + 1,
            content: line,
          })
        }
      })
    }

    const searchNode = (n: FileSystemNode, currentPath: string) => {
      if (n.type === 'file' && n.content) {
        searchFile(currentPath, n.content)
      } else if (n.type === 'directory' && n.children) {
        for (const [name, child] of Object.entries(n.children)) {
          const childPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`
          searchNode(child, childPath)
        }
      }
    }

    searchNode(node, normalized)
    return { success: true, data: results }
  }

  /**
   * Get all file paths (for git operations).
   */
  getAllFilePaths(startPath?: string): string[] {
    const normalized = startPath ? this.normalizePath(startPath) : '/'
    const node = this.getNode(normalized)

    if (!node) return []

    const paths: string[] = []

    const collect = (n: FileSystemNode, currentPath: string) => {
      if (n.type === 'file') {
        paths.push(currentPath)
      } else if (n.type === 'directory' && n.children) {
        for (const [name, child] of Object.entries(n.children)) {
          const childPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`
          collect(child, childPath)
        }
      }
    }

    collect(node, normalized)
    return paths
  }

  /**
   * Get storage usage in bytes.
   */
  getStorageUsage(): number {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? new Blob([data]).size : 0
    } catch {
      return 0
    }
  }

  /**
   * Get the current state (for git snapshot).
   */
  getState(): FileSystemState {
    return this.state
  }

  /**
   * Restore filesystem from a snapshot.
   */
  restoreFromSnapshot(snapshot: Record<string, string>): void {
    // Reset to default structure
    this.state.root = createDefaultFileSystem()

    // Recreate files from snapshot
    for (const [path, content] of Object.entries(snapshot)) {
      // Ensure parent directories exist
      const parts = path.split('/').filter(Boolean)
      let current = this.state.root

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        if (!current.children) {
          current.children = {}
        }
        if (!current.children[part]) {
          const now = Date.now()
          current.children[part] = {
            type: 'directory',
            name: part,
            children: {},
            createdAt: now,
            modifiedAt: now,
          }
        }
        current = current.children[part]
      }

      // Create the file
      const fileName = parts[parts.length - 1]
      if (current.children) {
        const now = Date.now()
        current.children[fileName] = {
          type: 'file',
          name: fileName,
          content,
          createdAt: now,
          modifiedAt: now,
        }
      }
    }

    this.persist()
  }
}

// Export singleton instance
export const fileSystem = new FileSystemService()

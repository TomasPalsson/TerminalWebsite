/**
 * Environment Variable Service
 *
 * Manages shell environment variables with localStorage persistence.
 * Loads variables from .zshrc on initialization.
 */

import { fileSystem } from './filesystem'

const STORAGE_KEY = 'terminal-env'

// Default environment variables
const DEFAULT_ENV: Record<string, string> = {
  HOME: '/home/user',
  USER: 'user',
  SHELL: '/bin/zsh',
  PWD: '/home/user',
  TERM: 'xterm-256color',
}

class EnvService {
  private variables: Record<string, string> = {}
  private initialized = false

  /**
   * Initialize the environment service.
   */
  initialize(): void {
    if (!this.initialized) {
      // Start with defaults
      this.variables = { ...DEFAULT_ENV }

      // Try to load from localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved)
          this.variables = { ...this.variables, ...parsed }
        }
      } catch {
        // Ignore
      }

      this.initialized = true
    }

    // Always reload from .zshrc to pick up any changes
    this.loadFromZshrc()
  }

  /**
   * Parse and load exports from .zshrc
   */
  private loadFromZshrc(): void {
    fileSystem.initialize()
    const result = fileSystem.cat('/home/user/.zshrc')

    if (result.success && result.data) {
      const lines = result.data.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        // Match export VAR=value or export VAR="value"
        const match = trimmed.match(/^export\s+([A-Za-z_][A-Za-z0-9_]*)=["']?([^"']*)["']?$/)
        if (match) {
          const [, name, value] = match
          this.variables[name] = value
        }
      }
    }
  }

  /**
   * Save variables to localStorage.
   */
  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.variables))
    } catch {
      // Ignore
    }
  }

  /**
   * Get all variables.
   */
  getAll(): Record<string, string> {
    return { ...this.variables }
  }

  /**
   * Get a variable value.
   */
  get(name: string): string | undefined {
    // PWD is dynamic
    if (name === 'PWD') {
      fileSystem.initialize()
      return fileSystem.getCwd()
    }
    return this.variables[name]
  }

  /**
   * Set a variable.
   */
  set(name: string, value: string): void {
    this.variables[name] = value
    this.persist()
  }

  /**
   * Remove a variable.
   */
  unset(name: string): boolean {
    if (name in this.variables) {
      delete this.variables[name]
      this.persist()
      return true
    }
    return false
  }

  /**
   * Reset to defaults.
   */
  reset(): void {
    this.variables = { ...DEFAULT_ENV }
    this.initialized = false
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore
    }
  }

  /**
   * Expand variables in a string.
   * Replaces $VAR and ${VAR} with their values.
   */
  expand(input: string): string {
    // Replace ${VAR} format
    let result = input.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name) => {
      return this.get(name) ?? ''
    })

    // Replace $VAR format (but not $$)
    result = result.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => {
      return this.get(name) ?? ''
    })

    return result
  }
}

// Export singleton instance
export const envService = new EnvService()

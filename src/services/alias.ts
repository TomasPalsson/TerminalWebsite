/**
 * Alias Service
 *
 * Manages command aliases with localStorage persistence.
 */

const STORAGE_KEY = 'terminal-aliases'

// Default aliases
const DEFAULT_ALIASES: Record<string, string> = {
  'lsd': 'ls',
  'll': 'ls -l',
  'la': 'ls -a',
  'cls': 'clear',
  'c': 'clear',
  'q': 'exit',
}

class AliasService {
  private aliases: Record<string, string> = {}
  private initialized = false

  /**
   * Initialize the alias service (load from storage or use defaults).
   */
  initialize(): void {
    if (this.initialized) return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        this.aliases = JSON.parse(saved)
      } else {
        // Use defaults on first run
        this.aliases = { ...DEFAULT_ALIASES }
        this.persist()
      }
    } catch {
      this.aliases = { ...DEFAULT_ALIASES }
    }

    this.initialized = true
  }

  /**
   * Save aliases to localStorage.
   */
  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.aliases))
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Get all aliases.
   */
  getAll(): Record<string, string> {
    return { ...this.aliases }
  }

  /**
   * Get a specific alias.
   */
  get(name: string): string | undefined {
    return this.aliases[name]
  }

  /**
   * Set an alias.
   */
  set(name: string, command: string): void {
    this.aliases[name] = command
    this.persist()
  }

  /**
   * Remove an alias.
   */
  remove(name: string): boolean {
    if (this.aliases[name]) {
      delete this.aliases[name]
      this.persist()
      return true
    }
    return false
  }

  /**
   * Reset aliases to defaults.
   */
  reset(): void {
    this.aliases = { ...DEFAULT_ALIASES }
    this.persist()
  }

  /**
   * Expand a command line, replacing aliases.
   * Handles recursive alias expansion (up to 10 levels to prevent infinite loops).
   */
  expand(input: string): string {
    const parts = input.trim().split(/\s+/)
    if (parts.length === 0) return input

    const command = parts[0]
    const args = parts.slice(1).join(' ')

    // Check for alias
    const aliasValue = this.aliases[command]
    if (aliasValue) {
      const expanded = args ? `${aliasValue} ${args}` : aliasValue
      // Recursive expansion (with depth limit)
      return this.expandRecursive(expanded, 1)
    }

    return input
  }

  private expandRecursive(input: string, depth: number): string {
    if (depth >= 10) return input // Prevent infinite loops

    const parts = input.trim().split(/\s+/)
    if (parts.length === 0) return input

    const command = parts[0]
    const args = parts.slice(1).join(' ')

    const aliasValue = this.aliases[command]
    if (aliasValue) {
      const expanded = args ? `${aliasValue} ${args}` : aliasValue
      return this.expandRecursive(expanded, depth + 1)
    }

    return input
  }
}

// Export singleton instance
export const aliasService = new AliasService()

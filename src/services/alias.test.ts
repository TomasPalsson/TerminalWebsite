import { describe, it, expect, beforeEach, vi } from 'vitest'
import { aliasService } from './alias'

describe('aliasService', () => {
  beforeEach(() => {
    // Reset the service state by accessing private properties
    // @ts-expect-error - accessing private property for testing
    aliasService.initialized = false
    // @ts-expect-error - accessing private property for testing
    aliasService.aliases = {}
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initialize', () => {
    it('loads default aliases on first run', () => {
      aliasService.initialize()

      const aliases = aliasService.getAll()
      expect(aliases['lsd']).toBe('ls')
      expect(aliases['ll']).toBe('ls -l')
      expect(aliases['la']).toBe('ls -a')
      expect(aliases['cls']).toBe('clear')
      expect(aliases['c']).toBe('clear')
      expect(aliases['q']).toBe('exit')
    })

    it('loads saved aliases from localStorage', () => {
      const savedAliases = { 'myalias': 'mycommand', 'test': 'echo test' }
      localStorage.setItem('terminal-aliases', JSON.stringify(savedAliases))

      aliasService.initialize()

      const aliases = aliasService.getAll()
      expect(aliases['myalias']).toBe('mycommand')
      expect(aliases['test']).toBe('echo test')
    })

    it('only initializes once', () => {
      aliasService.initialize()
      aliasService.set('custom', 'command')

      aliasService.initialize() // Second call should be no-op

      expect(aliasService.get('custom')).toBe('command')
    })

    it('handles localStorage parse errors gracefully', () => {
      localStorage.setItem('terminal-aliases', 'invalid json{')

      expect(() => aliasService.initialize()).not.toThrow()

      const aliases = aliasService.getAll()
      expect(aliases['lsd']).toBe('ls') // Falls back to defaults
    })
  })

  describe('getAll', () => {
    it('returns a copy of all aliases', () => {
      aliasService.initialize()

      const aliases1 = aliasService.getAll()
      const aliases2 = aliasService.getAll()

      expect(aliases1).not.toBe(aliases2) // Different objects
      expect(aliases1).toEqual(aliases2) // Same content
    })
  })

  describe('get', () => {
    it('returns alias value if exists', () => {
      aliasService.initialize()

      expect(aliasService.get('ll')).toBe('ls -l')
    })

    it('returns undefined for non-existent alias', () => {
      aliasService.initialize()

      expect(aliasService.get('nonexistent')).toBeUndefined()
    })
  })

  describe('set', () => {
    it('creates new alias', () => {
      aliasService.initialize()

      aliasService.set('myalias', 'echo hello')

      expect(aliasService.get('myalias')).toBe('echo hello')
    })

    it('overwrites existing alias', () => {
      aliasService.initialize()

      aliasService.set('ll', 'ls -la --color')

      expect(aliasService.get('ll')).toBe('ls -la --color')
    })

    it('persists to localStorage', () => {
      aliasService.initialize()

      aliasService.set('myalias', 'mycommand')

      const stored = JSON.parse(localStorage.getItem('terminal-aliases') || '{}')
      expect(stored['myalias']).toBe('mycommand')
    })
  })

  describe('remove', () => {
    it('removes existing alias and returns true', () => {
      aliasService.initialize()

      const result = aliasService.remove('ll')

      expect(result).toBe(true)
      expect(aliasService.get('ll')).toBeUndefined()
    })

    it('returns false for non-existent alias', () => {
      aliasService.initialize()

      const result = aliasService.remove('nonexistent')

      expect(result).toBe(false)
    })

    it('persists removal to localStorage', () => {
      aliasService.initialize()

      aliasService.remove('ll')

      const stored = JSON.parse(localStorage.getItem('terminal-aliases') || '{}')
      expect(stored['ll']).toBeUndefined()
    })
  })

  describe('reset', () => {
    it('restores default aliases', () => {
      aliasService.initialize()
      aliasService.set('custom', 'command')
      aliasService.remove('ll')

      aliasService.reset()

      const aliases = aliasService.getAll()
      expect(aliases['custom']).toBeUndefined()
      expect(aliases['ll']).toBe('ls -l')
    })

    it('persists reset to localStorage', () => {
      aliasService.initialize()
      aliasService.set('custom', 'command')

      aliasService.reset()

      const stored = JSON.parse(localStorage.getItem('terminal-aliases') || '{}')
      expect(stored['custom']).toBeUndefined()
      expect(stored['ll']).toBe('ls -l')
    })
  })

  describe('expand', () => {
    beforeEach(() => {
      aliasService.initialize()
    })

    it('expands a simple alias', () => {
      const result = aliasService.expand('ll')

      expect(result).toBe('ls -l')
    })

    it('preserves arguments after alias', () => {
      const result = aliasService.expand('ll /home')

      expect(result).toBe('ls -l /home')
    })

    it('returns input unchanged for non-alias commands', () => {
      const result = aliasService.expand('git status')

      expect(result).toBe('git status')
    })

    it('expands nested aliases', () => {
      aliasService.set('level1', 'level2')
      aliasService.set('level2', 'echo hello')

      const result = aliasService.expand('level1')

      expect(result).toBe('echo hello')
    })

    it('handles recursive alias expansion with depth limit', () => {
      aliasService.set('recursive1', 'recursive2')
      aliasService.set('recursive2', 'recursive3')
      aliasService.set('recursive3', 'recursive4')
      aliasService.set('recursive4', 'recursive5')
      aliasService.set('recursive5', 'recursive6')
      aliasService.set('recursive6', 'recursive7')
      aliasService.set('recursive7', 'recursive8')
      aliasService.set('recursive8', 'recursive9')
      aliasService.set('recursive9', 'recursive10')
      aliasService.set('recursive10', 'recursive11')
      aliasService.set('recursive11', 'echo done')

      const result = aliasService.expand('recursive1')

      // Should stop at depth 10, so 'recursive11' won't be expanded
      expect(result).toBe('recursive11')
    })

    it('handles empty input', () => {
      const result = aliasService.expand('')

      expect(result).toBe('')
    })

    it('handles whitespace-only input', () => {
      const result = aliasService.expand('   ')

      expect(result).toBe('   ')
    })

    it('preserves multiple arguments', () => {
      const result = aliasService.expand('ll -a /home /tmp')

      expect(result).toBe('ls -l -a /home /tmp')
    })
  })
})

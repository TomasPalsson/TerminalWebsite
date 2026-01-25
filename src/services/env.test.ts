import { describe, it, expect, beforeEach, vi } from 'vitest'
import { envService } from './env'
import { fileSystem } from './filesystem'

// Mock the filesystem module
vi.mock('./filesystem', () => ({
  fileSystem: {
    initialize: vi.fn(),
    cat: vi.fn().mockReturnValue({ success: false }),
    getCwd: vi.fn().mockReturnValue('/home/user'),
  },
}))

describe('envService', () => {
  beforeEach(() => {
    // Reset the service state
    // @ts-expect-error - accessing private property for testing
    envService.initialized = false
    // @ts-expect-error - accessing private property for testing
    envService.variables = {}
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('initialize', () => {
    it('sets default environment variables', () => {
      envService.initialize()

      expect(envService.get('HOME')).toBe('/home/user')
      expect(envService.get('USER')).toBe('user')
      expect(envService.get('SHELL')).toBe('/bin/zsh')
      expect(envService.get('TERM')).toBe('xterm-256color')
    })

    it('loads saved variables from localStorage', () => {
      const savedEnv = { CUSTOM_VAR: 'custom_value', EDITOR: 'nano' }
      localStorage.setItem('terminal-env', JSON.stringify(savedEnv))

      envService.initialize()

      expect(envService.get('CUSTOM_VAR')).toBe('custom_value')
      expect(envService.get('EDITOR')).toBe('nano')
    })

    it('merges saved variables with defaults', () => {
      const savedEnv = { EDITOR: 'vim' }
      localStorage.setItem('terminal-env', JSON.stringify(savedEnv))

      envService.initialize()

      // Saved variable
      expect(envService.get('EDITOR')).toBe('vim')
      // Default variable still present
      expect(envService.get('HOME')).toBe('/home/user')
    })

    it('loads exports from .zshrc', () => {
      vi.mocked(fileSystem.cat).mockReturnValue({
        success: true,
        data: 'export MY_VAR="my_value"\nexport ANOTHER=test\n',
      })

      envService.initialize()

      expect(envService.get('MY_VAR')).toBe('my_value')
      expect(envService.get('ANOTHER')).toBe('test')
    })

    it('handles localStorage parse errors gracefully', () => {
      localStorage.setItem('terminal-env', 'invalid json')

      expect(() => envService.initialize()).not.toThrow()
      expect(envService.get('HOME')).toBe('/home/user') // Falls back to defaults
    })
  })

  describe('get', () => {
    beforeEach(() => {
      vi.mocked(fileSystem.cat).mockReturnValue({ success: false })
      envService.initialize()
    })

    it('returns variable value', () => {
      envService.set('TEST_VAR', 'test_value')
      expect(envService.get('TEST_VAR')).toBe('test_value')
    })

    it('returns undefined for non-existent variable', () => {
      expect(envService.get('NONEXISTENT')).toBeUndefined()
    })

    it('returns dynamic PWD from filesystem', () => {
      vi.mocked(fileSystem.getCwd).mockReturnValue('/tmp')
      expect(envService.get('PWD')).toBe('/tmp')
    })
  })

  describe('set', () => {
    beforeEach(() => {
      vi.mocked(fileSystem.cat).mockReturnValue({ success: false })
      envService.initialize()
    })

    it('sets new variable', () => {
      envService.set('NEW_VAR', 'new_value')
      expect(envService.get('NEW_VAR')).toBe('new_value')
    })

    it('overwrites existing variable', () => {
      envService.set('HOME', '/custom/home')
      expect(envService.get('HOME')).toBe('/custom/home')
    })

    it('persists to localStorage', () => {
      envService.set('PERSIST_VAR', 'persist_value')

      const stored = JSON.parse(localStorage.getItem('terminal-env') || '{}')
      expect(stored['PERSIST_VAR']).toBe('persist_value')
    })
  })

  describe('unset', () => {
    beforeEach(() => {
      vi.mocked(fileSystem.cat).mockReturnValue({ success: false })
      envService.initialize()
    })

    it('removes existing variable and returns true', () => {
      envService.set('TO_REMOVE', 'value')
      const result = envService.unset('TO_REMOVE')

      expect(result).toBe(true)
      expect(envService.get('TO_REMOVE')).toBeUndefined()
    })

    it('returns false for non-existent variable', () => {
      const result = envService.unset('NONEXISTENT')
      expect(result).toBe(false)
    })

    it('persists removal to localStorage', () => {
      envService.set('TO_REMOVE', 'value')
      envService.unset('TO_REMOVE')

      const stored = JSON.parse(localStorage.getItem('terminal-env') || '{}')
      expect(stored['TO_REMOVE']).toBeUndefined()
    })
  })

  describe('getAll', () => {
    beforeEach(() => {
      vi.mocked(fileSystem.cat).mockReturnValue({ success: false })
      envService.initialize()
    })

    it('returns copy of all variables', () => {
      const vars1 = envService.getAll()
      const vars2 = envService.getAll()

      expect(vars1).not.toBe(vars2) // Different objects
      expect(vars1).toEqual(vars2) // Same content
    })

    it('includes default and custom variables', () => {
      envService.set('CUSTOM', 'value')
      const vars = envService.getAll()

      expect(vars['HOME']).toBe('/home/user')
      expect(vars['CUSTOM']).toBe('value')
    })
  })

  describe('reset', () => {
    beforeEach(() => {
      vi.mocked(fileSystem.cat).mockReturnValue({ success: false })
      envService.initialize()
    })

    it('restores default variables', () => {
      envService.set('CUSTOM', 'value')
      envService.set('HOME', '/custom')

      envService.reset()
      // Re-initialize to pick up defaults
      envService.initialize()

      expect(envService.get('CUSTOM')).toBeUndefined()
      expect(envService.get('HOME')).toBe('/home/user')
    })

    it('clears localStorage', () => {
      envService.set('CUSTOM', 'value')
      envService.reset()

      expect(localStorage.getItem('terminal-env')).toBeNull()
    })
  })

  describe('expand', () => {
    beforeEach(() => {
      vi.mocked(fileSystem.cat).mockReturnValue({ success: false })
      vi.mocked(fileSystem.getCwd).mockReturnValue('/home/user')
      envService.initialize()
    })

    it('expands $VAR format', () => {
      envService.set('MY_VAR', 'expanded_value')
      const result = envService.expand('echo $MY_VAR')

      expect(result).toBe('echo expanded_value')
    })

    it('expands ${VAR} format', () => {
      envService.set('MY_VAR', 'expanded_value')
      const result = envService.expand('echo ${MY_VAR}')

      expect(result).toBe('echo expanded_value')
    })

    it('expands multiple variables', () => {
      envService.set('VAR1', 'one')
      envService.set('VAR2', 'two')
      const result = envService.expand('$VAR1 and $VAR2')

      expect(result).toBe('one and two')
    })

    it('expands mixed formats', () => {
      envService.set('VAR1', 'one')
      envService.set('VAR2', 'two')
      const result = envService.expand('$VAR1 and ${VAR2}')

      expect(result).toBe('one and two')
    })

    it('replaces undefined variable with empty string', () => {
      const result = envService.expand('echo $UNDEFINED')
      expect(result).toBe('echo ')
    })

    it('expands HOME variable', () => {
      const result = envService.expand('cd $HOME')
      expect(result).toBe('cd /home/user')
    })

    it('expands PWD dynamically', () => {
      vi.mocked(fileSystem.getCwd).mockReturnValue('/tmp')
      const result = envService.expand('echo $PWD')
      expect(result).toBe('echo /tmp')
    })

    it('handles text without variables', () => {
      const result = envService.expand('plain text')
      expect(result).toBe('plain text')
    })

    it('handles adjacent variables', () => {
      envService.set('A', 'x')
      envService.set('B', 'y')
      const result = envService.expand('$A$B')
      expect(result).toBe('xy')
    })

    it('expands ${VAR} in middle of word', () => {
      envService.set('EXT', 'txt')
      const result = envService.expand('file.${EXT}')
      expect(result).toBe('file.txt')
    })
  })
})

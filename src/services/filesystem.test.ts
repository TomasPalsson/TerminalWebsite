import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fileSystem } from './filesystem'

describe('fileSystem', () => {
  beforeEach(() => {
    localStorage.clear()
    // @ts-expect-error - accessing private property for testing
    fileSystem.initialized = false
    fileSystem.reset()
    fileSystem.initialize()
  })

  describe('initialize', () => {
    it('creates default filesystem structure', () => {
      expect(fileSystem.isDirectory('/home/user')).toBe(true)
      expect(fileSystem.isDirectory('/home/user/projects')).toBe(true)
      expect(fileSystem.isDirectory('/home/user/documents')).toBe(true)
      expect(fileSystem.isDirectory('/etc')).toBe(true)
      expect(fileSystem.isDirectory('/tmp')).toBe(true)
    })

    it('creates default files', () => {
      expect(fileSystem.isFile('/home/user/.zshrc')).toBe(true)
      expect(fileSystem.isFile('/home/user/projects/README.md')).toBe(true)
      expect(fileSystem.isFile('/home/user/projects/hello.py')).toBe(true)
      expect(fileSystem.isFile('/etc/passwd')).toBe(true)
    })

    it('sets default cwd to /home/user', () => {
      expect(fileSystem.getCwd()).toBe('/home/user')
    })

    it('loads saved state from localStorage', () => {
      fileSystem.touch('/tmp/test.txt')
      fileSystem.persist()

      // Simulate re-initialization
      // @ts-expect-error - accessing private property for testing
      fileSystem.initialized = false
      fileSystem.initialize()

      expect(fileSystem.exists('/tmp/test.txt')).toBe(true)
    })
  })

  describe('getCwd', () => {
    it('returns current working directory', () => {
      expect(fileSystem.getCwd()).toBe('/home/user')
    })

    it('returns updated cwd after cd', () => {
      fileSystem.cd('/tmp')
      expect(fileSystem.getCwd()).toBe('/tmp')
    })
  })

  describe('resolvePath', () => {
    it('returns absolute path unchanged', () => {
      expect(fileSystem.resolvePath('/home/user')).toBe('/home/user')
    })

    it('resolves relative path from cwd', () => {
      fileSystem.cd('/home/user')
      expect(fileSystem.resolvePath('projects')).toBe('/home/user/projects')
    })

    it('resolves . as current directory', () => {
      fileSystem.cd('/home/user')
      expect(fileSystem.resolvePath('.')).toBe('/home/user')
    })

    it('resolves .. as parent directory', () => {
      fileSystem.cd('/home/user/projects')
      expect(fileSystem.resolvePath('..')).toBe('/home/user')
    })

    it('handles multiple .. in path', () => {
      fileSystem.cd('/home/user/projects')
      expect(fileSystem.resolvePath('../..')).toBe('/home')
    })

    it('handles .. at root', () => {
      expect(fileSystem.resolvePath('/..')).toBe('/')
    })

    it('removes duplicate slashes', () => {
      expect(fileSystem.resolvePath('//home//user')).toBe('/home/user')
    })

    it('handles mixed . and ..', () => {
      fileSystem.cd('/home/user')
      expect(fileSystem.resolvePath('./projects/../documents')).toBe('/home/user/documents')
    })
  })

  describe('exists', () => {
    it('returns true for existing directory', () => {
      expect(fileSystem.exists('/home/user')).toBe(true)
    })

    it('returns true for existing file', () => {
      expect(fileSystem.exists('/home/user/.zshrc')).toBe(true)
    })

    it('returns false for non-existent path', () => {
      expect(fileSystem.exists('/nonexistent')).toBe(false)
    })

    it('returns true for root', () => {
      expect(fileSystem.exists('/')).toBe(true)
    })
  })

  describe('isDirectory', () => {
    it('returns true for directories', () => {
      expect(fileSystem.isDirectory('/home/user')).toBe(true)
    })

    it('returns false for files', () => {
      expect(fileSystem.isDirectory('/home/user/.zshrc')).toBe(false)
    })

    it('returns false for non-existent paths', () => {
      expect(fileSystem.isDirectory('/nonexistent')).toBe(false)
    })
  })

  describe('isFile', () => {
    it('returns true for files', () => {
      expect(fileSystem.isFile('/home/user/.zshrc')).toBe(true)
    })

    it('returns false for directories', () => {
      expect(fileSystem.isFile('/home/user')).toBe(false)
    })

    it('returns false for non-existent paths', () => {
      expect(fileSystem.isFile('/nonexistent')).toBe(false)
    })
  })

  describe('cd', () => {
    it('changes to existing directory', () => {
      const result = fileSystem.cd('/tmp')
      expect(result.success).toBe(true)
      expect(fileSystem.getCwd()).toBe('/tmp')
    })

    it('fails for non-existent directory', () => {
      const result = fileSystem.cd('/nonexistent')
      expect(result.success).toBe(false)
      expect(result.error).toContain('No such directory')
    })

    it('fails for file path', () => {
      const result = fileSystem.cd('/home/user/.zshrc')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Not a directory')
    })

    it('handles relative paths', () => {
      fileSystem.cd('/home')
      const result = fileSystem.cd('user')
      expect(result.success).toBe(true)
      expect(fileSystem.getCwd()).toBe('/home/user')
    })

    it('handles ..', () => {
      fileSystem.cd('/home/user/projects')
      const result = fileSystem.cd('..')
      expect(result.success).toBe(true)
      expect(fileSystem.getCwd()).toBe('/home/user')
    })
  })

  describe('ls', () => {
    it('lists current directory', () => {
      fileSystem.cd('/home/user')
      const result = fileSystem.ls()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.some(e => e.name === 'projects')).toBe(true)
      expect(result.data!.some(e => e.name === 'documents')).toBe(true)
    })

    it('lists specified directory', () => {
      const result = fileSystem.ls('/etc')
      expect(result.success).toBe(true)
      expect(result.data!.some(e => e.name === 'passwd')).toBe(true)
    })

    it('hides hidden files by default', () => {
      const result = fileSystem.ls('/home/user')
      expect(result.success).toBe(true)
      expect(result.data!.some(e => e.name === '.zshrc')).toBe(false)
    })

    it('shows hidden files with all option', () => {
      const result = fileSystem.ls('/home/user', { all: true })
      expect(result.success).toBe(true)
      expect(result.data!.some(e => e.name === '.zshrc')).toBe(true)
    })

    it('returns file info when given a file path', () => {
      const result = fileSystem.ls('/home/user/.zshrc')
      expect(result.success).toBe(true)
      expect(result.data!.length).toBe(1)
      expect(result.data![0].name).toBe('.zshrc')
      expect(result.data![0].type).toBe('file')
    })

    it('fails for non-existent path', () => {
      const result = fileSystem.ls('/nonexistent')
      expect(result.success).toBe(false)
      expect(result.error).toContain('No such directory')
    })

    it('sorts directories first', () => {
      const result = fileSystem.ls('/home/user', { all: true })
      expect(result.success).toBe(true)

      const directories = result.data!.filter(e => e.type === 'directory')
      const files = result.data!.filter(e => e.type === 'file')

      // All directories should come before all files
      const lastDirIndex = result.data!.findLastIndex(e => e.type === 'directory')
      const firstFileIndex = result.data!.findIndex(e => e.type === 'file')

      if (directories.length > 0 && files.length > 0) {
        expect(lastDirIndex).toBeLessThan(firstFileIndex)
      }
    })
  })

  describe('touch', () => {
    it('creates new empty file', () => {
      const result = fileSystem.touch('/tmp/newfile.txt')
      expect(result.success).toBe(true)
      expect(fileSystem.isFile('/tmp/newfile.txt')).toBe(true)
    })

    it('updates timestamp of existing file', () => {
      const result = fileSystem.touch('/home/user/.zshrc')
      expect(result.success).toBe(true)
    })

    it('updates existing directory timestamp when path ends with /', () => {
      // /tmp/ resolves to /tmp which is a directory
      // touch on an existing item updates its timestamp
      const result = fileSystem.touch('/tmp/')
      expect(result.success).toBe(true)
    })

    it('fails when parent directory does not exist', () => {
      const result = fileSystem.touch('/nonexistent/file.txt')
      expect(result.success).toBe(false)
      expect(result.error).toContain('No such directory')
    })

    it('fails when parent is a file', () => {
      const result = fileSystem.touch('/home/user/.zshrc/file.txt')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Not a directory')
    })
  })

  describe('cat', () => {
    it('reads file content', () => {
      const result = fileSystem.cat('/home/user/.zshrc')
      expect(result.success).toBe(true)
      expect(result.data).toContain('export')
    })

    it('fails for non-existent file', () => {
      const result = fileSystem.cat('/nonexistent')
      expect(result.success).toBe(false)
      expect(result.error).toContain('No such file')
    })

    it('fails for directory', () => {
      const result = fileSystem.cat('/home/user')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Is a directory')
    })
  })

  describe('mkdir', () => {
    it('creates new directory', () => {
      const result = fileSystem.mkdir('/tmp/newdir')
      expect(result.success).toBe(true)
      expect(fileSystem.isDirectory('/tmp/newdir')).toBe(true)
    })

    it('fails when directory already exists', () => {
      const result = fileSystem.mkdir('/home/user')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Already exists')
    })

    it('fails when parent does not exist', () => {
      const result = fileSystem.mkdir('/nonexistent/newdir')
      expect(result.success).toBe(false)
      expect(result.error).toContain('No such directory')
    })

    it('fails for invalid name', () => {
      const result = fileSystem.mkdir('/tmp/')
      expect(result.success).toBe(false)
    })
  })

  describe('rm', () => {
    it('removes file', () => {
      fileSystem.touch('/tmp/toremove.txt')
      const result = fileSystem.rm('/tmp/toremove.txt')
      expect(result.success).toBe(true)
      expect(fileSystem.exists('/tmp/toremove.txt')).toBe(false)
    })

    it('removes empty directory', () => {
      fileSystem.mkdir('/tmp/emptydir')
      const result = fileSystem.rm('/tmp/emptydir')
      expect(result.success).toBe(true)
      expect(fileSystem.exists('/tmp/emptydir')).toBe(false)
    })

    it('fails to remove non-empty directory without recursive flag', () => {
      fileSystem.mkdir('/tmp/nonempty')
      fileSystem.touch('/tmp/nonempty/file.txt')
      const result = fileSystem.rm('/tmp/nonempty')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Directory not empty')
    })

    it('removes non-empty directory with recursive flag', () => {
      fileSystem.mkdir('/tmp/nonempty')
      fileSystem.touch('/tmp/nonempty/file.txt')
      const result = fileSystem.rm('/tmp/nonempty', { recursive: true })
      expect(result.success).toBe(true)
      expect(fileSystem.exists('/tmp/nonempty')).toBe(false)
    })

    it('fails for non-existent path', () => {
      const result = fileSystem.rm('/nonexistent')
      expect(result.success).toBe(false)
    })

    it('cannot remove root', () => {
      const result = fileSystem.rm('/')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot remove root')
    })

    it('updates cwd when removing current directory', () => {
      fileSystem.mkdir('/tmp/testdir')
      fileSystem.cd('/tmp/testdir')
      fileSystem.rm('/tmp/testdir')
      expect(fileSystem.getCwd()).toBe('/tmp')
    })
  })

  describe('cp', () => {
    it('copies file to new location', () => {
      const result = fileSystem.cp('/home/user/.zshrc', '/tmp/zshrc-copy')
      expect(result.success).toBe(true)
      expect(fileSystem.isFile('/tmp/zshrc-copy')).toBe(true)

      const original = fileSystem.cat('/home/user/.zshrc')
      const copy = fileSystem.cat('/tmp/zshrc-copy')
      expect(original.data).toBe(copy.data)
    })

    it('copies file into directory', () => {
      const result = fileSystem.cp('/home/user/.zshrc', '/tmp')
      expect(result.success).toBe(true)
      expect(fileSystem.isFile('/tmp/.zshrc')).toBe(true)
    })

    it('fails for non-existent source', () => {
      const result = fileSystem.cp('/nonexistent', '/tmp/copy')
      expect(result.success).toBe(false)
    })

    it('fails for non-existent destination directory', () => {
      const result = fileSystem.cp('/home/user/.zshrc', '/nonexistent/copy')
      expect(result.success).toBe(false)
    })
  })

  describe('mv', () => {
    it('moves file to new location', () => {
      fileSystem.touch('/tmp/tomove.txt')
      const result = fileSystem.mv('/tmp/tomove.txt', '/tmp/moved.txt')
      expect(result.success).toBe(true)
      expect(fileSystem.exists('/tmp/tomove.txt')).toBe(false)
      expect(fileSystem.isFile('/tmp/moved.txt')).toBe(true)
    })

    it('moves file into directory', () => {
      fileSystem.touch('/tmp/tomove.txt')
      fileSystem.mkdir('/tmp/targetdir')
      const result = fileSystem.mv('/tmp/tomove.txt', '/tmp/targetdir')
      expect(result.success).toBe(true)
      expect(fileSystem.isFile('/tmp/targetdir/tomove.txt')).toBe(true)
    })

    it('renames file', () => {
      fileSystem.touch('/tmp/oldname.txt')
      const result = fileSystem.mv('/tmp/oldname.txt', '/tmp/newname.txt')
      expect(result.success).toBe(true)
      expect(fileSystem.exists('/tmp/oldname.txt')).toBe(false)
      expect(fileSystem.isFile('/tmp/newname.txt')).toBe(true)
    })

    it('fails for non-existent source', () => {
      const result = fileSystem.mv('/nonexistent', '/tmp/target')
      expect(result.success).toBe(false)
    })

    it('cannot move root', () => {
      const result = fileSystem.mv('/', '/newroot')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot move root')
    })
  })

  describe('writeFile', () => {
    it('creates new file with content', () => {
      const result = fileSystem.writeFile('/tmp/newfile.txt', 'Hello World')
      expect(result.success).toBe(true)

      const content = fileSystem.cat('/tmp/newfile.txt')
      expect(content.data).toBe('Hello World')
    })

    it('overwrites existing file', () => {
      fileSystem.writeFile('/tmp/file.txt', 'Original')
      const result = fileSystem.writeFile('/tmp/file.txt', 'Updated')
      expect(result.success).toBe(true)

      const content = fileSystem.cat('/tmp/file.txt')
      expect(content.data).toBe('Updated')
    })

    it('fails when target is directory', () => {
      const result = fileSystem.writeFile('/tmp', 'content')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Is a directory')
    })

    it('fails when parent does not exist', () => {
      const result = fileSystem.writeFile('/nonexistent/file.txt', 'content')
      expect(result.success).toBe(false)
    })
  })

  describe('appendFile', () => {
    it('appends to existing file', () => {
      fileSystem.writeFile('/tmp/file.txt', 'Hello')
      const result = fileSystem.appendFile('/tmp/file.txt', ' World')
      expect(result.success).toBe(true)

      const content = fileSystem.cat('/tmp/file.txt')
      expect(content.data).toBe('Hello World')
    })

    it('creates file if not exists', () => {
      const result = fileSystem.appendFile('/tmp/newfile.txt', 'Content')
      expect(result.success).toBe(true)

      const content = fileSystem.cat('/tmp/newfile.txt')
      expect(content.data).toBe('Content')
    })
  })

  describe('find', () => {
    it('finds files matching pattern', () => {
      const result = fileSystem.find('/home/user', '*.py')
      expect(result.success).toBe(true)
      expect(result.data!.some(p => p.includes('hello.py'))).toBe(true)
    })

    it('finds files in subdirectories', () => {
      fileSystem.mkdir('/tmp/subdir')
      fileSystem.touch('/tmp/subdir/test.txt')

      const result = fileSystem.find('/tmp', '*.txt')
      expect(result.success).toBe(true)
      expect(result.data!.some(p => p.includes('test.txt'))).toBe(true)
    })

    it('fails for non-existent start path', () => {
      const result = fileSystem.find('/nonexistent', '*')
      expect(result.success).toBe(false)
    })
  })

  describe('grep', () => {
    it('finds matching lines in file', () => {
      const result = fileSystem.grep('export', '/home/user/.zshrc')
      expect(result.success).toBe(true)
      expect(result.data!.length).toBeGreaterThan(0)
      expect(result.data![0].content).toContain('export')
    })

    it('searches recursively in directory', () => {
      const result = fileSystem.grep('def', '/home/user/projects')
      expect(result.success).toBe(true)
      expect(result.data!.some(m => m.path.includes('hello.py'))).toBe(true)
    })

    it('fails for non-existent path', () => {
      const result = fileSystem.grep('pattern', '/nonexistent')
      expect(result.success).toBe(false)
    })

    it('returns line numbers', () => {
      const result = fileSystem.grep('export', '/home/user/.zshrc')
      expect(result.success).toBe(true)
      expect(result.data![0].line).toBeGreaterThan(0)
    })
  })

  describe('getAllFilePaths', () => {
    it('returns all file paths', () => {
      const paths = fileSystem.getAllFilePaths()
      expect(paths.length).toBeGreaterThan(0)
      expect(paths.some(p => p.includes('.zshrc'))).toBe(true)
    })

    it('returns paths from specified directory', () => {
      const paths = fileSystem.getAllFilePaths('/home/user/projects')
      expect(paths.every(p => p.startsWith('/home/user/projects'))).toBe(true)
    })
  })

  describe('getCompletions', () => {
    it('returns completions for partial path', () => {
      const completions = fileSystem.getCompletions('pro')
      expect(completions.some(c => c.startsWith('projects'))).toBe(true)
    })

    it('adds / suffix for directories', () => {
      const completions = fileSystem.getCompletions('/home/use')
      expect(completions.some(c => c.endsWith('/'))).toBe(true)
    })

    it('returns all entries for empty input', () => {
      const completions = fileSystem.getCompletions('')
      expect(completions.length).toBeGreaterThan(0)
    })
  })
})

import { describe, it, expect } from 'vitest'
import { completeInput } from './tabCompletion'

const options = {
  fsCommands: ['cd', 'cat'],
  commandNames: ['cat', 'cd', 'clear', 'echo'],
  getPathCompletions: (prefix: string) =>
    ['projects/', 'projects/README.md', 'photos/'].filter((p) => p.startsWith(prefix)),
}

describe('completeInput', () => {
  it('returns null for empty input or no candidates', () => {
    expect(completeInput('', null, options)).toBeNull()
    expect(completeInput('zzz', null, options)).toBeNull()
    expect(completeInput('cd nothing', null, options)).toBeNull()
  })

  it('extends a command to the longest common prefix first, then cycles', () => {
    const first = completeInput('c', null, options)
    expect(first?.text).toBe('cat')
    expect(first?.suggestions).toEqual(['cat', 'cd', 'clear'])
    const second = completeInput('cat', first!.tabState, options)
    expect(second?.text).toBe('cat')
    const third = completeInput('cat', second!.tabState, options)
    expect(third?.text).toBe('cd')
  })

  it('completes a single command without suggestions', () => {
    const result = completeInput('ec', null, options)
    expect(result?.text).toBe('echo')
    expect(result?.suggestions).toBeNull()
    expect(result?.tabState.index).toBe(0)
  })

  it('completes filesystem paths for fs commands and keeps earlier args', () => {
    const first = completeInput('cd p', null, options)
    expect(first?.text).toBe('cd projects/')
    expect(first?.suggestions).toEqual(['projects/', 'projects/README.md', 'photos/'])
    const second = completeInput('cd projects/', null, options)
    expect(second?.text).toBe('cd projects/')
    expect(second?.suggestions).toEqual(['projects/', 'projects/README.md'])
    const third = completeInput('cd projects/', second!.tabState, options)
    expect(third?.text).toBe('cd projects/')
    const fourth = completeInput('cd projects/', third!.tabState, options)
    expect(fourth?.text).toBe('cd projects/README.md')
  })
})

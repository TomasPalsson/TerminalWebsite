import { describe, it, expect } from 'vitest'
// CommandMap first: it registers every command and HelpCommand reads it back (circular import)
import { commandMap } from './CommandMap'
import { HelpCommand, plainHelp } from './HelpCommand'
import type { KeyPressContextType } from '../../context/KeypressedContext'

const context = { headless: true } as unknown as KeyPressContextType
const registered = commandMap.size

describe('plainHelp', () => {
  it('lists one category per line and wraps long ones to the screen width', () => {
    expect(registered).toBeGreaterThan(0)
    const lines = plainHelp(58).split('\n')
    expect(lines[0]).toContain('help <name>')
    expect(lines.some((l) => l.startsWith('System') && l.includes('scene'))).toBe(true)
    expect(lines.some((l) => l.startsWith('Code') && l.includes('python'))).toBe(true)
    lines.forEach((l) => expect(l.length).toBeLessThanOrEqual(58))
    // Filesystem is too wide for one row and continues indented
    const fs = lines.findIndex((l) => l.startsWith('Filesystem'))
    expect(lines[fs + 1].startsWith(' '.repeat(12))).toBe(true)
    expect(lines.length).toBeLessThan(15)
  })
})

describe('HelpCommand.plain', () => {
  it('renders the listing without arguments', () => {
    expect(HelpCommand.plain!([], context)).toBe(plainHelp())
  })

  it('renders a command summary plus flattened usage', () => {
    const text = HelpCommand.plain!(['echo'], context)!
    expect(text.startsWith('echo — ')).toBe(true)
    expect(text).toContain('Usage:')
  })

  it('reports unknown commands', () => {
    expect(HelpCommand.plain!(['nope'], context)).toBe('Command not found: nope')
  })
})

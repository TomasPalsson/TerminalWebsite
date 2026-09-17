import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import TerminalHandler from './TerminalHandler'
import { KeyPressProvider } from '../context/KeypressedContext'

const press = (key: string, init: KeyboardEventInit = {}) => {
  act(() => {
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }))
  })
}

const type = (chars: string) => {
  for (const ch of chars) press(ch)
}

/** The live prompt line from the most recent buffer sync */
const lastPrompt = (buffer: string[][][]) => buffer.at(-1)?.[0].at(-1)
const lastBuffer = (buffer: string[][][]) => buffer.at(-1)?.[0] ?? []

function renderTerminal(headless = true) {
  const onBufferChange = vi.fn()
  render(
    <KeyPressProvider>
      <TerminalHandler headless={headless} onBufferChange={onBufferChange} />
    </KeyPressProvider>
  )
  return { buffer: onBufferChange.mock.calls as string[][][] }
}

async function runCommand(cmd: string, buffer: string[][][]) {
  type(cmd)
  press('Enter')
  await waitFor(() => expect(lastPrompt(buffer)).toBe('$ '))
}

describe('TerminalHandler input handling', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('runs a command on Enter and echoes its output', async () => {
    const { buffer } = renderTerminal()
    await runCommand('echo hello', buffer)
    expect(lastBuffer(buffer)).toContain('hello')
  })

  it('expands !! inline to the previous command as the user types', async () => {
    const { buffer } = renderTerminal()
    await runCommand('echo hello', buffer)
    type('!!')
    expect(lastPrompt(buffer)).toBe('$ echo hello')
  })

  it('expands !$ inline to the previous command\'s last argument', async () => {
    const { buffer } = renderTerminal()
    await runCommand('echo one two', buffer)
    type('echo !$')
    expect(lastPrompt(buffer)).toBe('$ echo two')
  })

  it('recalls history with ArrowUp and clears it with ArrowDown', async () => {
    const { buffer } = renderTerminal()
    await runCommand('echo first', buffer)
    await runCommand('echo second', buffer)
    press('ArrowUp')
    expect(lastPrompt(buffer)).toBe('$ echo second')
    press('ArrowUp')
    expect(lastPrompt(buffer)).toBe('$ echo first')
    press('ArrowDown')
    press('ArrowDown')
    expect(lastPrompt(buffer)).toBe('$ ')
  })

  it('enters reverse search on ctrl+r, shows the newest match and accepts it on Enter', async () => {
    const { buffer } = renderTerminal(false)
    await runCommand('echo alpha', buffer)
    await runCommand('help', buffer)
    press('r', { ctrlKey: true })
    expect(lastPrompt(buffer)).toBe('$ ')
    type('alp')
    expect(screen.getByText('echo alpha')).toBeInTheDocument()
    press('Enter')
    expect(lastPrompt(buffer)).toBe('$ echo alpha')
    expect(screen.queryByText('search')).not.toBeInTheDocument()
  })

  it('completes a command name on Tab and clears suggestions when typing resumes', async () => {
    const { buffer } = renderTerminal(false)
    type('ec')
    press('Tab')
    expect(lastPrompt(buffer)).toBe('$ echo')
    type(' hi')
    expect(lastPrompt(buffer)).toBe('$ echo hi')
    await runCommand('', buffer)
    expect(lastBuffer(buffer)).toContain('hi')
  })

  it('cycles through multiple command completions on repeated Tab', () => {
    const { buffer } = renderTerminal(false)
    type('c')
    press('Tab')
    const first = lastPrompt(buffer)
    expect(first).toBe('$ clear')
    // Second Tab lands on index 0 (the same candidate); third moves on
    press('Tab')
    expect(lastPrompt(buffer)).toBe(first)
    press('Tab')
    expect(lastPrompt(buffer)).not.toBe(first)
    expect(screen.getByText('clear')).toBeInTheDocument()
  })
})

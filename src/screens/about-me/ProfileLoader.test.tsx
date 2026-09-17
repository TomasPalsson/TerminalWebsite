import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ProfileLoader } from './ProfileLoader'

describe('ProfileLoader', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('streams the first status line character by character', () => {
    render(<ProfileLoader />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('generating profile')

    act(() => vi.advanceTimersByTime(28 * 5))
    expect(status).toHaveTextContent('Fetch')
    expect(status).not.toHaveTextContent('Fetching profile data…')

    act(() => vi.advanceTimersByTime(28 * 30))
    expect(status).toHaveTextContent('Fetching profile data…')
  })

  it('moves on to the next line after a pause', () => {
    render(<ProfileLoader />)
    const status = screen.getByRole('status')

    act(() => vi.advanceTimersByTime(28 * 30 + 350))
    expect(status).toHaveTextContent('Fetching profile data…')
    act(() => vi.advanceTimersByTime(28 * 10))
    expect(status).toHaveTextContent('Reading e')
  })
})

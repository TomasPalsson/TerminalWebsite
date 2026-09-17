import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ProfileLoader } from './ProfileLoader'

function blurred(container: HTMLElement): string {
  return (container.querySelector('[style*="blur"]') as HTMLElement).style.filter
}

describe('ProfileLoader', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts fully blurred and advances the step counter', () => {
    const { container } = render(<ProfileLoader />)
    expect(screen.getByRole('status')).toHaveTextContent('step 0/50')
    expect(blurred(container)).toContain('blur(24px)')

    act(() => vi.advanceTimersByTime(90 * 10))
    expect(screen.getByRole('status')).toHaveTextContent('step 10/50')
  })

  it('sharpens to zero blur at the final step and stops', () => {
    const { container } = render(<ProfileLoader />)

    act(() => vi.advanceTimersByTime(90 * 60))
    expect(screen.getByRole('status')).toHaveTextContent('step 50/50')
    expect(blurred(container)).toContain('blur(0px)')
  })
})

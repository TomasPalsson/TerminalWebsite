import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('profile service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
  })

  describe('formatMonth', () => {
    it('formats a YYYY-MM date as "Mon YYYY"', async () => {
      const { formatMonth } = await import('./profile')
      expect(formatMonth('2026-08')).toBe('Aug 2026')
    })

    it('passes a bare year through unchanged', async () => {
      const { formatMonth } = await import('./profile')
      expect(formatMonth('2023')).toBe('2023')
    })
  })

  describe('formatPeriod', () => {
    it('formats a month start with a null end as "Present"', async () => {
      const { formatPeriod } = await import('./profile')
      expect(formatPeriod('2025-12', null)).toBe('Dec 2025 - Present')
    })

    it('formats year-only start/end', async () => {
      const { formatPeriod } = await import('./profile')
      expect(formatPeriod('2023', '2026')).toBe('2023 - 2026')
    })

    it('formats a month end', async () => {
      const { formatPeriod } = await import('./profile')
      expect(formatPeriod('2021', '2023-06')).toBe('2021 - Jun 2023')
    })
  })

  describe('visible', () => {
    it('keeps items with no show field', async () => {
      const { visible } = await import('./profile')
      const items = [{ name: 'a' }, { name: 'b' }]
      expect(visible(items)).toEqual(items)
    })

    it('keeps items whose show includes website', async () => {
      const { visible } = await import('./profile')
      const items = [{ name: 'a', show: ['website' as const] }]
      expect(visible(items)).toEqual(items)
    })

    it('drops items whose show excludes website', async () => {
      const { visible } = await import('./profile')
      const items = [
        { name: 'a', show: ['cv' as const] },
        { name: 'b', show: ['website' as const] },
      ]
      expect(visible(items)).toEqual([{ name: 'b', show: ['website'] }])
    })
  })

  describe('getProfile', () => {
    it('only fetches once for two calls (cached)', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ name: 'Test' }),
      })
      vi.stubGlobal('fetch', fetchMock)

      const { getProfile } = await import('./profile')
      const [a, b] = await Promise.all([getProfile(), getProfile()])

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(a).toEqual({ name: 'Test' })
      expect(b).toEqual({ name: 'Test' })
    })

    it('clears the cache on a rejected fetch so a retry can succeed', async () => {
      const fetchMock = vi
        .fn()
        .mockRejectedValueOnce(new Error('network down'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ name: 'Retry' }),
        })
      vi.stubGlobal('fetch', fetchMock)

      const { getProfile } = await import('./profile')
      await expect(getProfile()).rejects.toThrow('network down')

      const profile = await getProfile()
      expect(profile).toEqual({ name: 'Retry' })
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('rejects and clears the cache when the response is not ok', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 })
      vi.stubGlobal('fetch', fetchMock)

      const { getProfile } = await import('./profile')
      await expect(getProfile()).rejects.toThrow()
      expect(fetchMock).toHaveBeenCalledTimes(1)

      await expect(getProfile()).rejects.toThrow()
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
  })
})

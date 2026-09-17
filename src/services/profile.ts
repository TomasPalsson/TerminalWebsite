import type { Profile, ShowTarget } from '@/types/profile'

const PROFILE_URL = 'https://api.tomas.im/profile'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Formats "YYYY-MM" as "Mon YYYY"; passes "YYYY" through unchanged.
function formatDatePart(date: string): string {
  const match = date.match(/^(\d{4})-(\d{2})$/)
  if (!match) return date
  const monthIndex = parseInt(match[2], 10) - 1
  return `${MONTHS[monthIndex] ?? match[2]} ${match[1]}`
}

/** "Dec 2025" / "2023" style single date, e.g. for certification issue dates. */
export function formatMonth(date: string): string {
  return formatDatePart(date)
}

/** "Dec 2025 - Present" / "2023 - 2026" style range. */
export function formatPeriod(start: string, end: string | null): string {
  return `${formatDatePart(start)} - ${end === null ? 'Present' : formatDatePart(end)}`
}

/** Filters items to those visible on the website (default: shown everywhere). */
export function visible<T extends { show?: ShowTarget[] }>(items: T[]): T[] {
  return items.filter((item) => !item.show || item.show.includes('website'))
}

let cachedProfile: Promise<Profile> | null = null

/** Fetches the shared profile JSON, caching the in-flight/resolved promise for the page load. */
export function getProfile(): Promise<Profile> {
  if (!cachedProfile) {
    cachedProfile = fetch(PROFILE_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`)
        return res.json() as Promise<Profile>
      })
      .catch((err) => {
        cachedProfile = null
        throw err
      })
  }
  return cachedProfile
}

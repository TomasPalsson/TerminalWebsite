import { useEffect, useState } from 'react'
import { getProfile } from '@/services/profile'
import type { Profile } from '@/types/profile'

export type UseProfileReturn = {
  profile: Profile | null
  error: Error | null
  loading: boolean
}

/**
 * Loads the shared profile JSON via the cached profile service.
 */
export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getProfile()
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error('Failed to load profile'))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { profile, error, loading }
}

export default useProfile

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Activity {
  id: string
  type: string
  wallet: string
  username?: string
  game?: string
  value?: number
  message: string
  icon: string
  timestamp: string
}

export function useActivity(limit: number = 20) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchActivities = useCallback(async () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/activity?limit=${limit}`, {
        signal: abortControllerRef.current.signal,
      })
      if (!res.ok) throw new Error('Failed to fetch activity')

      const data = await res.json()
      setActivities(data.activities)
    } catch (e) {
      // Ignore abort errors
      if (e instanceof Error && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : 'Unknown error')
      // Return empty array when API fails - no mock data
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchActivities()

    // Poll for new activities every 30 seconds
    const interval = setInterval(fetchActivities, 30000)
    return () => {
      clearInterval(interval)
      // Cleanup abort controller on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchActivities])

  return { activities, isLoading, error, refetch: fetchActivities }
}

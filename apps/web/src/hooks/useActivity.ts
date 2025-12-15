'use client'

import { useState, useEffect, useCallback } from 'react'

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

  const fetchActivities = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/activity?limit=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch activity')

      const data = await res.json()
      setActivities(data.activities)
    } catch (e) {
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
    return () => clearInterval(interval)
  }, [fetchActivities])

  return { activities, isLoading, error, refetch: fetchActivities }
}

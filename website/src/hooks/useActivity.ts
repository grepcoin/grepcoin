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
      // Fall back to mock data
      setActivities(getMockActivities())
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

function getMockActivities(): Activity[] {
  return [
    { id: '1', type: 'score', wallet: '0x1234', username: 'RegexMaster', game: 'Grep Rails', value: 2500, message: 'scored 2,500 in Grep Rails', icon: '🎮', timestamp: new Date().toISOString() },
    { id: '2', type: 'achievement', wallet: '0x5678', username: 'PatternPro', value: 50, message: 'unlocked "Speed Demon" achievement', icon: '⚡', timestamp: new Date().toISOString() },
    { id: '3', type: 'streak', wallet: '0x9abc', username: 'GrepGuru', game: 'Stack Panic', value: 15, message: 'hit 15x streak in Stack Panic', icon: '🔥', timestamp: new Date().toISOString() },
    { id: '4', type: 'reward', wallet: '0xdef0', username: 'StackSurfer', game: 'Merge Miners', value: 100, message: 'earned 100 GREP in daily challenge', icon: '💰', timestamp: new Date().toISOString() },
    { id: '5', type: 'score', wallet: '0x1357', username: 'MergeMaster', game: 'Quantum Grep', value: 3200, message: 'scored 3,200 in Quantum Grep', icon: '⚛️', timestamp: new Date().toISOString() },
  ]
}

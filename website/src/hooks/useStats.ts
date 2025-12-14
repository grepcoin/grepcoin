'use client'

import { useState, useEffect } from 'react'

interface GlobalStats {
  totalPlayers: number
  totalGrepEarned: string
  totalGamesPlayed: string
  activeGames: number
  todayGamesPlayed: number
  todayGrepEarned: number
  achievementsUnlocked: number
}

export function useStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/stats')
        if (!res.ok) throw new Error('Failed to fetch stats')

        const data = await res.json()
        setStats(data.stats)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
        // Return zeros when API fails - no mock data
        setStats({
          totalPlayers: 0,
          totalGrepEarned: '0',
          totalGamesPlayed: '0',
          activeGames: 8,
          todayGamesPlayed: 0,
          todayGrepEarned: 0,
          achievementsUnlocked: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, isLoading, error }
}

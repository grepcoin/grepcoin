'use client'

import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  rank: number
  walletAddress: string
  username?: string
  avatar?: string
  totalScore: number
  totalGrep: number
  gamesPlayed: number
  bestStreak: number
  stakingTier: string
}

interface UseLeaderboardOptions {
  period?: 'all' | 'daily' | 'weekly'
  limit?: number
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const { period = 'all', limit = 10 } = options
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/leaderboard?period=${period}&limit=${limit}`)
        if (!res.ok) throw new Error('Failed to fetch leaderboard')

        const data = await res.json()
        setLeaderboard(data.leaderboard)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
        // Return empty array when API fails - no mock data
        setLeaderboard([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [period, limit])

  return { leaderboard, isLoading, error }
}

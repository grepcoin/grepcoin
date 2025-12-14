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
        // Fall back to mock data if API fails
        setLeaderboard(getMockLeaderboard())
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [period, limit])

  return { leaderboard, isLoading, error }
}

// Mock data fallback for development/demo
function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    { rank: 1, walletAddress: '0x1234...abcd', username: 'RegexMaster', totalScore: 125000, totalGrep: 15000, gamesPlayed: 342, bestStreak: 23, stakingTier: 'diamond' },
    { rank: 2, walletAddress: '0x5678...efgh', username: 'PatternPro', totalScore: 118500, totalGrep: 12500, gamesPlayed: 298, bestStreak: 21, stakingTier: 'gold' },
    { rank: 3, walletAddress: '0x9abc...ijkl', username: 'GrepGuru', totalScore: 98000, totalGrep: 11200, gamesPlayed: 256, bestStreak: 18, stakingTier: 'gold' },
    { rank: 4, walletAddress: '0xdef0...mnop', username: 'StackSurfer', totalScore: 87500, totalGrep: 9800, gamesPlayed: 223, bestStreak: 16, stakingTier: 'silver' },
    { rank: 5, walletAddress: '0x1357...qrst', username: 'MergeMaster', totalScore: 76000, totalGrep: 8500, gamesPlayed: 189, bestStreak: 15, stakingTier: 'silver' },
  ]
}

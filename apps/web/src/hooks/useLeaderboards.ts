'use client'

import { useState, useEffect, useCallback } from 'react'

interface LeaderboardEntry {
  rank: number
  wallet: string
  username: string | null
  avatar: string | null
  score: number
  grepEarned: number
  gamesPlayed?: number
  playedAt?: string
  isCurrentUser?: boolean
}

interface GameInfo {
  slug: string
  name: string
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  period: string
  updatedAt: string
  game?: GameInfo
}

interface UserRanking {
  rank: number | null
  totalPlayers: number
  score: number
  grepEarned: number
  gamesPlayed: number
}

interface RankingsResponse {
  userRanking: UserRanking
  nearbyPlayers: LeaderboardEntry[]
  period: string
  updatedAt: string
}

interface UseLeaderboardsOptions {
  limit?: number
  period?: 'all' | 'weekly' | 'daily'
  game?: string
}

export function useLeaderboards(options: UseLeaderboardsOptions = {}) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.limit) params.set('limit', String(options.limit))
      if (options.period) params.set('period', options.period)

      const endpoint = options.game
        ? `/api/leaderboards/${options.game}?${params.toString()}`
        : `/api/leaderboards?${params.toString()}`

      const res = await fetch(endpoint)

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Game not found')
        }
        throw new Error('Failed to fetch leaderboard')
      }

      const data: LeaderboardResponse = await res.json()
      setLeaderboard(data.leaderboard)
      setGameInfo(data.game || null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [options.limit, options.period, options.game])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    leaderboard,
    gameInfo,
    isLoading,
    error,
    refetch: fetchLeaderboard,
  }
}

interface UsePlayerRankingOptions {
  period?: 'all' | 'weekly' | 'daily'
  nearby?: number
}

export function usePlayerRanking(options: UsePlayerRankingOptions = {}) {
  const [ranking, setRanking] = useState<UserRanking | null>(null)
  const [nearbyPlayers, setNearbyPlayers] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRanking = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.period) params.set('period', options.period)
      if (options.nearby) params.set('nearby', String(options.nearby))

      const res = await fetch(`/api/leaderboards/rankings?${params.toString()}`)

      if (res.status === 401) {
        // Not authenticated, return empty state
        setRanking(null)
        setNearbyPlayers([])
        return
      }

      if (!res.ok) {
        throw new Error('Failed to fetch ranking')
      }

      const data: RankingsResponse = await res.json()
      setRanking(data.userRanking)
      setNearbyPlayers(data.nearbyPlayers)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [options.period, options.nearby])

  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  return {
    ranking,
    nearbyPlayers,
    isLoading,
    error,
    refetch: fetchRanking,
  }
}

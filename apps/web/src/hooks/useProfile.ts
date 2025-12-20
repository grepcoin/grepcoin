'use client'

import { useState, useEffect } from 'react'

interface GameStats {
  game: string
  gameSlug: string
  highScore: number
  bestStreak: number
  gamesPlayed: number
}

interface UserProfile {
  walletAddress: string
  username: string
  avatar: string | null
  createdAt: string
  stakingTier: string
  stakingMultiplier: number
  stats: {
    totalGrepEarned: number
    gamesPlayed: number
    achievementsUnlocked: number
  }
  gameStats: GameStats[]
}

export function useProfile(walletAddress: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!walletAddress) {
      setIsLoading(false)
      return
    }

    const fetchProfile = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/users/${walletAddress}`)
        if (!res.ok) throw new Error('Failed to fetch profile')

        const data = await res.json()
        setProfile(data.user)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [walletAddress])

  return { profile, isLoading, error }
}

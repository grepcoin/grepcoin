'use client'

import { useState, useEffect } from 'react'

interface Achievement {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  reward: number
  type: string
  target?: number
  gameSlug?: string
  unlockedBy: number
  // For user-specific
  progress?: number
  unlocked?: boolean
  unlockedAt?: string
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAchievements = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/achievements')
        if (!res.ok) throw new Error('Failed to fetch achievements')

        const data = await res.json()
        setAchievements(data.achievements)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
        // Fall back to mock data
        setAchievements(getMockAchievements())
      } finally {
        setIsLoading(false)
      }
    }

    fetchAchievements()
  }, [])

  return { achievements, isLoading, error }
}

export function useUserAchievements(walletAddress: string | null) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [summary, setSummary] = useState({ total: 0, unlocked: 0, totalRewards: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!walletAddress) {
      setIsLoading(false)
      return
    }

    const fetchUserAchievements = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/achievements/${walletAddress}`)
        if (!res.ok) throw new Error('Failed to fetch achievements')

        const data = await res.json()
        setAchievements(data.achievements)
        setSummary(data.summary)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAchievements()
  }, [walletAddress])

  return { achievements, summary, isLoading, error }
}

function getMockAchievements(): Achievement[] {
  return [
    { id: '1', slug: 'first-steps', name: 'First Steps', description: 'Complete your first game', icon: '🎮', rarity: 'common', reward: 10, type: 'games', target: 1, unlockedBy: 95 },
    { id: '2', slug: 'combo-starter', name: 'Combo Starter', description: 'Achieve a 5x combo streak', icon: '🔥', rarity: 'common', reward: 25, type: 'streak', target: 5, unlockedBy: 72 },
    { id: '3', slug: 'pattern-pro', name: 'Pattern Pro', description: 'Match 50 regex patterns', icon: '🎯', rarity: 'uncommon', reward: 50, type: 'score', target: 50, unlockedBy: 45 },
    { id: '4', slug: 'speed-demon', name: 'Speed Demon', description: 'Clear a level in under 30 seconds', icon: '⚡', rarity: 'uncommon', reward: 40, type: 'speed', target: 30, unlockedBy: 38 },
    { id: '5', slug: 'stack-master', name: 'Stack Master', description: 'Return 100 functions in Stack Panic', icon: '📚', rarity: 'rare', reward: 75, type: 'score', target: 100, unlockedBy: 22 },
    { id: '6', slug: 'quantum-mind', name: 'Quantum Mind', description: 'Complete all Quantum Grep levels', icon: '⚛️', rarity: 'rare', reward: 100, type: 'games', target: 6, unlockedBy: 15 },
    { id: '7', slug: 'git-wizard', name: 'Git Wizard', description: 'Resolve 50 merge conflicts', icon: '🧙', rarity: 'epic', reward: 150, type: 'score', target: 50, unlockedBy: 8 },
    { id: '8', slug: 'perfect-run', name: 'Perfect Run', description: 'Complete any game without losing a life', icon: '💎', rarity: 'epic', reward: 200, type: 'perfect', target: 1, unlockedBy: 5 },
    { id: '9', slug: 'unstoppable', name: 'Unstoppable', description: 'Achieve a 25x combo streak', icon: '🌟', rarity: 'legendary', reward: 300, type: 'streak', target: 25, unlockedBy: 2 },
    { id: '10', slug: 'arcade-champion', name: 'Arcade Champion', description: 'Reach #1 on any game leaderboard', icon: '👑', rarity: 'legendary', reward: 500, type: 'leaderboard', target: 1, unlockedBy: 0.5 },
  ]
}

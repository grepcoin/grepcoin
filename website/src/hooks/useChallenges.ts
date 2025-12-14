'use client'

import { useState, useEffect } from 'react'

interface Challenge {
  id: string
  game: {
    slug: string
    name: string
    icon: string
    color: string
  }
  type: string
  target: number
  reward: number
  multiplier: number
  completions: number
}

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [resetIn, setResetIn] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/challenges')
        if (!res.ok) throw new Error('Failed to fetch challenges')

        const data = await res.json()
        setChallenges(data.challenges)
        setResetIn(data.resetIn)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
        // Fall back to mock data
        setChallenges(getMockChallenges())
        // Calculate time until midnight
        const now = new Date()
        const midnight = new Date(now)
        midnight.setDate(midnight.getDate() + 1)
        midnight.setHours(0, 0, 0, 0)
        setResetIn(midnight.getTime() - now.getTime())
      } finally {
        setIsLoading(false)
      }
    }

    fetchChallenges()

    // Update countdown every minute
    const interval = setInterval(() => {
      setResetIn((prev) => Math.max(0, prev - 60000))
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return { challenges, resetIn, isLoading, error }
}

function getMockChallenges(): Challenge[] {
  return [
    { id: '1', game: { slug: 'grep-rails', name: 'Grep Rails', icon: 'Train', color: 'from-grep-purple to-grep-pink' }, type: 'score', target: 500, reward: 50, multiplier: 1.5, completions: 234 },
    { id: '2', game: { slug: 'stack-panic', name: 'Stack Panic', icon: 'Layers', color: 'from-grep-orange to-grep-yellow' }, type: 'streak', target: 10, reward: 75, multiplier: 2, completions: 156 },
    { id: '3', game: { slug: 'merge-miners', name: 'Merge Miners', icon: 'GitMerge', color: 'from-grep-green to-grep-cyan' }, type: 'speed', target: 60, reward: 40, multiplier: 1, completions: 312 },
    { id: '4', game: { slug: 'quantum-grep', name: 'Quantum Grep', icon: 'Atom', color: 'from-grep-cyan to-grep-blue' }, type: 'perfect', target: 1, reward: 100, multiplier: 2.5, completions: 89 },
  ]
}

'use client'

import { useState, useEffect, useRef } from 'react'

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
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const fetchChallenges = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/challenges', {
          signal: abortController.signal,
        })
        if (!res.ok) throw new Error('Failed to fetch challenges')

        const data = await res.json()
        if (!abortController.signal.aborted) {
          setChallenges(data.challenges)
          setResetIn(data.resetIn)
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : 'Unknown error')
        // Return empty array when API fails - no mock data
        setChallenges([])
        // Calculate time until midnight
        const now = new Date()
        const midnight = new Date(now)
        midnight.setDate(midnight.getDate() + 1)
        midnight.setHours(0, 0, 0, 0)
        setResetIn(midnight.getTime() - now.getTime())
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchChallenges()

    // Update countdown every minute
    const interval = setInterval(() => {
      setResetIn((prev) => Math.max(0, prev - 60000))
    }, 60000)

    return () => {
      clearInterval(interval)
      abortController.abort()
    }
  }, [])

  return { challenges, resetIn, isLoading, error }
}

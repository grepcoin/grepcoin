'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

interface SubmitResult {
  success: boolean
  grepEarned?: number
  multiplier?: number
  error?: string
}

export function useGameScore(gameSlug: string) {
  const { isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastResult, setLastResult] = useState<SubmitResult | null>(null)

  const submitScore = useCallback(
    async (score: number, streak: number = 0, duration: number = 0): Promise<SubmitResult> => {
      if (!isAuthenticated) {
        const result = { success: false, error: 'Not authenticated' }
        setLastResult(result)
        return result
      }

      setIsSubmitting(true)

      try {
        const res = await fetch(`/api/games/${gameSlug}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score, streak, duration }),
        })

        if (!res.ok) {
          const error = await res.json()
          const result = { success: false, error: error.error || 'Failed to submit score' }
          setLastResult(result)
          return result
        }

        const data = await res.json()
        const result = {
          success: true,
          grepEarned: data.grepEarned,
          multiplier: data.multiplier,
        }
        setLastResult(result)
        return result
      } catch (e) {
        const result = {
          success: false,
          error: e instanceof Error ? e.message : 'Network error',
        }
        setLastResult(result)
        return result
      } finally {
        setIsSubmitting(false)
      }
    },
    [gameSlug, isAuthenticated]
  )

  return { submitScore, isSubmitting, lastResult }
}

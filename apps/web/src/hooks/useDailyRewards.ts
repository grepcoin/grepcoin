'use client'

import { useState, useEffect, useCallback } from 'react'

interface DailyRewardsData {
  streak: number
  claimedToday: boolean
  nextReward: number
  totalClaimed: number
}

export function useDailyRewards() {
  const [data, setData] = useState<DailyRewardsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/rewards/daily')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (e) {
      setError('Failed to load rewards')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const claimReward = async () => {
    const res = await fetch('/api/rewards/daily', { method: 'POST' })
    if (res.ok) {
      await fetchData()
      return true
    }
    return false
  }

  return {
    ...data,
    isLoading,
    error,
    claimReward,
    refetch: fetchData
  }
}

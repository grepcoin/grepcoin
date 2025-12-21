'use client'

import { useState, useEffect } from 'react'
import { CURRENT_SEASON, SeasonChallenge, SeasonReward } from '@/lib/seasons'

interface ChallengeProgress {
  challengeId: string
  current: number
  completed: boolean
}

interface SeasonData {
  points: number
  claimedRewards: string[]
  challengeProgress: ChallengeProgress[]
}

export function useSeasonProgress() {
  const [data, setData] = useState<SeasonData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seasons/progress')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const claimReward = async (rewardId: string) => {
    const res = await fetch('/api/seasons/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId }),
    })
    const result = await res.json()
    if (result.success && data) {
      setData({ ...data, claimedRewards: [...data.claimedRewards, rewardId] })
    }
    return result
  }

  const availableRewards = CURRENT_SEASON.rewards.filter(
    r => (data?.points || 0) >= r.requiredPoints && !data?.claimedRewards.includes(r.id)
  )

  const nextReward = CURRENT_SEASON.rewards.find(
    r => (data?.points || 0) < r.requiredPoints
  )

  return {
    season: CURRENT_SEASON,
    points: data?.points || 0,
    claimedRewards: data?.claimedRewards || [],
    challengeProgress: data?.challengeProgress || [],
    availableRewards,
    nextReward,
    isLoading,
    claimReward,
  }
}

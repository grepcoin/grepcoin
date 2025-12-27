'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'

interface RewardTier {
  rankStart: number
  rankEnd: number
  grepAmount: number
  badgeId?: string
  multiplierBonus?: number
}

interface UpcomingDistribution {
  period: 'WEEKLY' | 'MONTHLY'
  nextDate: Date
  tiers: RewardTier[]
  totalPool: number
}

interface PastDistribution {
  id: string
  period: string
  startDate: string
  endDate: string
  status: string
  totalPool: number
  winnersCount: number
  userReward?: {
    rank: number
    grepAmount: number
    badgeId?: string
    status: string
    claimedAt?: string
  }
}

interface ProjectedReward {
  rank: number
  grepAmount: number
  badgeId?: string
  multiplierBonus?: number
}

interface ClaimableReward {
  id: string
  period: string
  rank: number
  grepAmount: number
  badgeId?: string
  badgeName?: string
  badgeIcon?: string
  multiplier?: number
  createdAt: string
  distributionEnd: string
}

interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

// Hook to get reward schedule
export function useRewardSchedule(type?: 'weekly' | 'monthly') {
  const { isConnected } = useAccount()
  const [upcoming, setUpcoming] = useState<UpcomingDistribution[]>([])
  const [past, setPast] = useState<PastDistribution[]>([])
  const [projected, setProjected] = useState<{
    weekly: ProjectedReward | null
    monthly: ProjectedReward | null
  } | null>(null)
  const [countdown, setCountdown] = useState<{
    weekly: Countdown
    monthly: Countdown
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (type) {
          params.set('type', type)
        }
        if (isConnected) {
          params.set('projected', 'true')
        }

        const res = await fetch(`/api/leaderboards/rewards?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch reward schedule')

        const data = await res.json()
        setUpcoming(data.upcoming)
        setPast(data.past)
        setProjected(data.projected)
        setCountdown(data.countdown)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()

    // Refresh every minute to update countdown
    const interval = setInterval(fetchSchedule, 60000)
    return () => clearInterval(interval)
  }, [type, isConnected])

  return { upcoming, past, projected, countdown, isLoading, error }
}

// Hook to get user's claimable rewards
export function useMyRewards() {
  const { isConnected } = useAccount()
  const [rewards, setRewards] = useState<ClaimableReward[]>([])
  const [totalClaimable, setTotalClaimable] = useState(0)
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRewards = useCallback(async () => {
    if (!isConnected) {
      setRewards([])
      setTotalClaimable(0)
      setCount(0)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/leaderboards/rewards/claim')
      if (!res.ok) throw new Error('Failed to fetch claimable rewards')

      const data = await res.json()
      setRewards(data.rewards)
      setTotalClaimable(data.totalClaimable)
      setCount(data.count)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [isConnected])

  useEffect(() => {
    fetchRewards()
  }, [fetchRewards])

  return { rewards, totalClaimable, count, isLoading, error, refetch: fetchRewards }
}

// Hook to claim rewards
export function useClaimReward() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const claimReward = async (rewardId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/leaderboards/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to claim reward')
      }

      const data = await res.json()
      return data
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      setError(errorMessage)
      throw e
    } finally {
      setIsLoading(false)
    }
  }

  return { claimReward, isLoading, error }
}

// Combined hook for convenience
export function useLeaderboardRewards(type?: 'weekly' | 'monthly') {
  const schedule = useRewardSchedule(type)
  const myRewards = useMyRewards()
  const { claimReward, isLoading: isClaiming, error: claimError } = useClaimReward()

  const handleClaim = async (rewardId: string) => {
    const result = await claimReward(rewardId)
    // Refetch rewards after successful claim
    if (result.success) {
      myRewards.refetch()
    }
    return result
  }

  return {
    ...schedule,
    myRewards: myRewards.rewards,
    totalClaimable: myRewards.totalClaimable,
    claimableCount: myRewards.count,
    isLoadingRewards: myRewards.isLoading,
    rewardsError: myRewards.error,
    claimReward: handleClaim,
    isClaiming,
    claimError,
    refetchRewards: myRewards.refetch,
  }
}

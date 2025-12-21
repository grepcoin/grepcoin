'use client'

import { useState, useEffect } from 'react'
import { getTier, getNextTier, REFERRAL_TIERS } from '@/lib/referrals'

interface ReferralStats {
  referralCode: string
  referralCount: number
  totalEarned: number
  pendingRewards: number
  referrals: Array<{
    id: string
    wallet: string
    joinedAt: Date
    gamesPlayed: number
    earned: number
  }>
}

export function useReferrals() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/referrals/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const currentTier = stats ? getTier(stats.referralCount) : REFERRAL_TIERS[0]
  const nextTier = stats ? getNextTier(stats.referralCount) : REFERRAL_TIERS[1]
  const progressToNext = nextTier && stats
    ? ((stats.referralCount - currentTier.minReferrals) / (nextTier.minReferrals - currentTier.minReferrals)) * 100
    : 100

  const claimRewards = async () => {
    const res = await fetch('/api/referrals/claim', { method: 'POST' })
    const data = await res.json()
    if (data.success && stats) {
      setStats({ ...stats, pendingRewards: 0, totalEarned: stats.totalEarned + stats.pendingRewards })
    }
    return data
  }

  return {
    stats,
    currentTier,
    nextTier,
    progressToNext,
    isLoading,
    claimRewards,
  }
}

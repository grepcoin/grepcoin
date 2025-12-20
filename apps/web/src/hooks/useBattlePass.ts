'use client'

import { useState, useEffect, useCallback } from 'react'

interface BattlePassReward {
  id: string
  level: number
  tier: 'FREE' | 'PREMIUM'
  type: 'GREP' | 'BADGE' | 'MULTIPLIER' | 'NFT'
  value: unknown
}

interface BattlePass {
  id: string
  season: number
  name: string
  startDate: string
  endDate: string
  levels: number
  xpPerLevel: number
  rewards: BattlePassReward[]
}

interface BattlePassProgress {
  level: number
  xp: number
  xpInCurrentLevel: number
  xpForNextLevel: number
  isPremium: boolean
  claimedLevels: number[]
}

export function useBattlePass() {
  const [battlePass, setBattlePass] = useState<BattlePass | null>(null)
  const [progress, setProgress] = useState<BattlePassProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBattlePass = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/battle-pass')

      if (res.status === 404) {
        setError('No active battle pass')
        setBattlePass(null)
        setProgress(null)
        return
      }

      if (!res.ok) {
        throw new Error('Failed to fetch battle pass')
      }

      const data = await res.json()
      setBattlePass(data.battlePass)
      setProgress(data.progress)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBattlePass()
  }, [fetchBattlePass])

  const claimReward = async (level: number) => {
    const res = await fetch('/api/battle-pass/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to claim reward')
    }

    const data = await res.json()

    // Update progress with new claimed levels
    if (progress) {
      setProgress({
        ...progress,
        claimedLevels: data.progress.claimedLevels,
      })
    }

    return data.claimedRewards
  }

  const addXp = async (xpAmount: number, source?: string) => {
    const res = await fetch('/api/battle-pass/xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xpAmount, source }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to add XP')
    }

    const data = await res.json()

    // Update progress with new XP and level
    setProgress(data.progress)

    return {
      xpGained: data.xpGained,
      leveledUp: data.leveledUp,
    }
  }

  const canClaimReward = (level: number): boolean => {
    if (!progress) return false
    return progress.level >= level && !progress.claimedLevels.includes(level)
  }

  const getRewardsForLevel = (level: number): BattlePassReward[] => {
    if (!battlePass) return []
    return battlePass.rewards.filter((r) => r.level === level)
  }

  const getDaysRemaining = (): number => {
    if (!battlePass) return 0
    const now = new Date()
    const endDate = new Date(battlePass.endDate)
    const diff = endDate.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const getProgressPercentage = (): number => {
    if (!progress) return 0
    return (progress.xpInCurrentLevel / progress.xpForNextLevel) * 100
  }

  return {
    battlePass,
    progress,
    isLoading,
    error,
    claimReward,
    addXp,
    canClaimReward,
    getRewardsForLevel,
    getDaysRemaining,
    getProgressPercentage,
    refetch: fetchBattlePass,
  }
}

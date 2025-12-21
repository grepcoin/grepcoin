'use client'
import { useState, useEffect, useCallback } from 'react'
import { Achievement, ACHIEVEMENTS, AchievementTier } from '@/lib/achievements-v2'

interface UserProgress { achievementId: string; progress: number; claimedTiers: AchievementTier[] }

export function useAchievementsV2() {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/achievements-v2')
      .then(res => res.json())
      .then(data => { setUserProgress(data.progress || []); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [])

  const achievements = ACHIEVEMENTS.map(a => ({
    ...a,
    progress: userProgress.find(p => p.achievementId === a.id)?.progress || 0,
    claimedTiers: userProgress.find(p => p.achievementId === a.id)?.claimedTiers || [],
  }))

  const claimTier = useCallback(async (achievementId: string, tier: AchievementTier) => {
    const res = await fetch('/api/achievements-v2/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ achievementId, tier }),
    })
    const data = await res.json()
    if (data.success) {
      setUserProgress(prev => prev.map(p =>
        p.achievementId === achievementId
          ? { ...p, claimedTiers: [...p.claimedTiers, tier] }
          : p
      ))
    }
    return data
  }, [])

  return { achievements, isLoading, claimTier }
}

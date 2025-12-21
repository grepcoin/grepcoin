'use client'
import { useAchievementsV2 } from '@/hooks/useAchievementsV2'
import { AchievementCardV2 } from './AchievementCardV2'

export function AchievementsListV2() {
  const { achievements, isLoading, claimTier } = useAchievementsV2()

  if (isLoading) return <div className="animate-pulse bg-gray-800 rounded-lg h-64" />

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Achievements</h2>
      {achievements.map(a => (
        <AchievementCardV2 key={a.id} achievement={a} onClaimTier={tier => claimTier(a.id, tier)} />
      ))}
    </div>
  )
}

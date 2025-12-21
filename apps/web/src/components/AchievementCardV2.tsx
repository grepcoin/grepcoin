'use client'
import { Achievement, AchievementTier, TIER_COLORS } from '@/lib/achievements-v2'

interface Props {
  achievement: Achievement & { progress: number; claimedTiers: AchievementTier[] }
  onClaimTier: (tier: AchievementTier) => void
}

export function AchievementCardV2({ achievement, onClaimTier }: Props) {
  const currentTierIdx = achievement.tiers.findIndex(t => achievement.progress < t.target)
  const currentTier = achievement.tiers[currentTierIdx] || achievement.tiers[achievement.tiers.length - 1]
  const percent = Math.min(100, (achievement.progress / currentTier.target) * 100)

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl">{achievement.icon}</span>
        <div>
          <p className="font-bold">{achievement.name}</p>
          <p className="text-sm text-gray-400">{achievement.description}</p>
        </div>
      </div>
      <div className="flex gap-2 mb-3">
        {achievement.tiers.map(t => {
          const unlocked = achievement.progress >= t.target
          const claimed = achievement.claimedTiers.includes(t.tier)
          return (
            <button key={t.tier} onClick={() => unlocked && !claimed && onClaimTier(t.tier)}
              className={`flex-1 py-2 rounded border-2 text-xs uppercase ${TIER_COLORS[t.tier]} ${
                claimed ? 'bg-gray-700 opacity-50' : unlocked ? 'bg-gray-700' : 'bg-gray-900 opacity-30'
              }`}>
              {claimed ? '✓' : t.tier}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-xs text-gray-400">{achievement.progress.toLocaleString()}/{currentTier.target.toLocaleString()}</span>
      </div>
    </div>
  )
}

'use client'

import { useSeasonProgress } from '@/hooks/useSeasonProgress'
import { getTimeRemaining, getSeasonProgress } from '@/lib/seasons'

export function SeasonBanner() {
  const { season, points, nextReward } = useSeasonProgress()
  const progress = getSeasonProgress(season.startDate, season.endDate)
  const timeRemaining = getTimeRemaining(season.endDate)

  return (
    <div
      className="rounded-xl p-6 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${season.colors.secondary}, ${season.colors.primary})` }}
    >
      <div className="absolute inset-0 opacity-20">
        {season.theme === 'winter' && (
          <div className="text-6xl animate-pulse">❄️ ⛄ ❄️ 🎿 ❄️</div>
        )}
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{season.name}</h2>
            <p className="text-sm opacity-80">{timeRemaining}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{points}</p>
            <p className="text-sm opacity-80">Season Points</p>
          </div>
        </div>

        <div className="bg-black/30 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-white/80 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {nextReward && (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl">{nextReward.icon}</span>
            <div>
              <p className="font-semibold">{nextReward.name}</p>
              <p className="text-sm opacity-80">
                {nextReward.requiredPoints - points} more points needed
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useSeasonProgress } from '@/hooks/useSeasonProgress'

export function SeasonRewards() {
  const { season, points, claimedRewards, claimReward, isLoading } = useSeasonProgress()

  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-48" />
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4">Reward Track</h3>

      <div className="relative">
        <div className="absolute top-8 left-0 right-0 h-2 bg-gray-700 rounded-full">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, (points / season.rewards[season.rewards.length - 1].requiredPoints) * 100)}%` }}
          />
        </div>

        <div className="flex justify-between relative">
          {season.rewards.map((reward, i) => {
            const unlocked = points >= reward.requiredPoints
            const claimed = claimedRewards.includes(reward.id)
            const canClaim = unlocked && !claimed

            return (
              <div key={reward.id} className="flex flex-col items-center">
                <button
                  onClick={() => canClaim && claimReward(reward.id)}
                  disabled={!canClaim}
                  className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition-transform hover:scale-110 ${
                    claimed ? 'bg-emerald-600' :
                    unlocked ? 'bg-yellow-500 animate-pulse' :
                    'bg-gray-700'
                  }`}
                >
                  {claimed ? '✓' : reward.icon}
                </button>
                <p className="text-xs mt-2 text-center max-w-[80px]">{reward.name}</p>
                <p className="text-xs text-gray-500">{reward.requiredPoints} pts</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

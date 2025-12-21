'use client'

import { useSeasonProgress } from '@/hooks/useSeasonProgress'

export function SeasonChallenges() {
  const { season, challengeProgress, isLoading } = useSeasonProgress()

  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-48" />
  }

  const getProgress = (challengeId: string) => {
    return challengeProgress.find(p => p.challengeId === challengeId)
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4">Season Challenges</h3>

      <div className="space-y-4">
        {season.challenges.map(challenge => {
          const progress = getProgress(challenge.id)
          const percent = progress
            ? Math.min(100, (progress.current / challenge.target) * 100)
            : 0

          return (
            <div key={challenge.id} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div>
                    <p className="font-semibold">{challenge.name}</p>
                    <p className="text-sm text-gray-400">{challenge.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    challenge.type === 'daily' ? 'bg-blue-600' :
                    challenge.type === 'weekly' ? 'bg-purple-600' :
                    'bg-yellow-600'
                  }`}>
                    {challenge.type}
                  </span>
                  <p className="text-sm text-emerald-400 mt-1">+{challenge.points} pts</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${progress?.completed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400">
                  {progress?.current || 0}/{challenge.target}
                </span>
                {progress?.completed && <span className="text-emerald-400">✓</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

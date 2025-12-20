'use client'

import { useBattlePass } from '@/hooks/useBattlePass'
import { BattlePassReward } from '@/components/BattlePassReward'
import { BattlePassProgress } from '@/components/BattlePassProgress'

export default function BattlePassPage() {
  const { battlePass, progress, isLoading, claimReward } = useBattlePass()

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  }

  if (!battlePass) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      No active Battle Pass
    </div>
  }

  const currentLevel = progress?.level || 1
  const currentXp = progress?.xpInCurrentLevel || 0
  const xpToNext = progress?.xpForNextLevel || 1000

  const handleClaimReward = async (level: number) => {
    try {
      await claimReward(level)
    } catch (error) {
      console.error('Failed to claim reward:', error)
      alert(error instanceof Error ? error.message : 'Failed to claim reward')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">{battlePass.name}</h1>
        <p className="text-gray-400 mb-8">Season {battlePass.season}</p>

        <BattlePassProgress
          level={currentLevel}
          xp={currentXp}
          xpToNext={xpToNext}
        />

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {battlePass.rewards?.map((reward: any) => (
              <BattlePassReward
                key={reward.id}
                reward={reward}
                isUnlocked={currentLevel >= reward.level}
                isClaimed={progress?.claimedLevels?.includes(reward.level) || false}
                onClaim={() => handleClaimReward(reward.level)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

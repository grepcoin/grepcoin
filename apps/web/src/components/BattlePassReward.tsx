'use client'

interface Reward {
  id: string
  level: number
  tier: 'FREE' | 'PREMIUM'
  type: 'GREP' | 'BADGE' | 'MULTIPLIER' | 'NFT'
  value: any
}

interface Props {
  reward: Reward
  isUnlocked: boolean
  isClaimed: boolean
  onClaim: () => void
}

export function BattlePassReward({ reward, isUnlocked, isClaimed, onClaim }: Props) {
  const getTypeIcon = () => {
    switch (reward.type) {
      case 'GREP': return '🪙'
      case 'BADGE': return '🏅'
      case 'MULTIPLIER': return '⚡'
      case 'NFT': return '🎨'
      default: return '🎁'
    }
  }

  const getTierColor = () => {
    return reward.tier === 'PREMIUM' ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-600 bg-gray-800'
  }

  const getRewardDisplay = () => {
    if (reward.type === 'GREP') {
      const amount = typeof reward.value === 'object' && reward.value?.amount ? reward.value.amount : reward.value
      return <p className="text-emerald-400 font-bold">{Number(amount).toLocaleString()} GREP</p>
    }
    if (reward.type === 'MULTIPLIER') {
      const multiplier = typeof reward.value === 'object' && reward.value?.multiplier ? reward.value.multiplier : reward.value
      return <p className="text-purple-400 font-bold">{multiplier}x Multiplier</p>
    }
    if (reward.type === 'BADGE') {
      const name = typeof reward.value === 'object' && reward.value?.name ? reward.value.name : 'Special Badge'
      return <p className="text-blue-400 font-bold">{name}</p>
    }
    if (reward.type === 'NFT') {
      const name = typeof reward.value === 'object' && reward.value?.name ? reward.value.name : 'Exclusive NFT'
      return <p className="text-pink-400 font-bold">{name}</p>
    }
    return null
  }

  const getRewardDescription = () => {
    if (typeof reward.value === 'object' && reward.value?.description) {
      return reward.value.description
    }
    return `Level ${reward.level} ${reward.tier.toLowerCase()} reward`
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${getTierColor()} ${!isUnlocked ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{getTypeIcon()}</span>
        <span className="text-sm text-gray-400">Level {reward.level}</span>
      </div>

      <h3 className="font-bold text-lg">{reward.type} Reward</h3>
      <p className="text-gray-400 text-sm mb-3">{getRewardDescription()}</p>

      {getRewardDisplay()}

      {reward.tier === 'PREMIUM' && (
        <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded mb-2 mt-2">
          PREMIUM
        </span>
      )}

      <div className="mt-3">
        {isClaimed ? (
          <button disabled className="w-full py-2 bg-emerald-900 text-emerald-400 rounded">
            ✓ Claimed
          </button>
        ) : isUnlocked ? (
          <button
            onClick={onClaim}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
          >
            Claim Reward
          </button>
        ) : (
          <button disabled className="w-full py-2 bg-gray-700 text-gray-500 rounded cursor-not-allowed">
            Locked
          </button>
        )}
      </div>
    </div>
  )
}

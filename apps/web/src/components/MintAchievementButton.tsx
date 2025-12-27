'use client'

import { useAchievementMint } from '@/hooks/useAchievementMint'

interface Props {
  achievementId: string
  achievementName: string
  isMinted: boolean
  isUnlocked: boolean
}

export function MintAchievementButton({ achievementId, achievementName: _achievementName, isMinted, isUnlocked }: Props) {
  const { mintAchievement, isPending, isSuccess, error } = useAchievementMint()

  if (!isUnlocked) {
    return (
      <button disabled className="px-4 py-2 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed">
        Locked
      </button>
    )
  }

  if (isMinted || isSuccess) {
    return (
      <button disabled className="px-4 py-2 bg-emerald-900 text-emerald-400 rounded-lg">
        ✓ Minted as NFT
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={() => mintAchievement(achievementId)}
        disabled={isPending}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50"
      >
        {isPending ? 'Minting...' : 'Mint as NFT'}
      </button>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  )
}

'use client'

import { ReferralTier } from '@/lib/referrals'

interface Props {
  current: number
  nextTier: ReferralTier
  progress: number
}

export function ReferralProgress({ current, nextTier, progress }: Props) {
  const remaining = nextTier.minReferrals - current

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold">Progress to {nextTier.name}</h3>
          <p className="text-sm text-gray-400">{remaining} more referrals needed</p>
        </div>
        <span className="text-3xl">{nextTier.icon}</span>
      </div>

      <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full ${nextTier.color} transition-all`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-400 mt-2">
        <span>{current} referrals</span>
        <span>{nextTier.minReferrals} needed</span>
      </div>

      <div className="mt-4 p-4 bg-gray-900 rounded-lg">
        <p className="font-semibold mb-2">Unlock at {nextTier.name}:</p>
        <ul className="text-sm text-gray-400 space-y-1">
          {nextTier.perks.map((perk, i) => (
            <li key={i}>• {perk}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

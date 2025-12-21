'use client'

import { ReferralTier } from '@/lib/referrals'

interface Props {
  tier: ReferralTier
  isCurrent?: boolean
}

export function ReferralTierCard({ tier, isCurrent }: Props) {
  return (
    <div className={`rounded-xl p-6 ${tier.color} ${isCurrent ? 'ring-2 ring-white' : 'opacity-80'}`}>
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl">{tier.icon}</span>
        <div>
          <h3 className="text-xl font-bold">{tier.name}</h3>
          {isCurrent && <span className="text-sm bg-white/20 px-2 py-0.5 rounded">Current</span>}
        </div>
      </div>

      <div className="space-y-2">
        {tier.perks.map((perk, i) => (
          <div key={i} className="flex items-center gap-2">
            <span>✓</span>
            <span className="text-sm">{perk}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-sm opacity-80">
          Requires {tier.minReferrals}+ referrals
        </p>
      </div>
    </div>
  )
}

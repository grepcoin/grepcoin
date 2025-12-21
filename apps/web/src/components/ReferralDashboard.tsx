'use client'

import { useReferrals } from '@/hooks/useReferrals'
import { ReferralTierCard } from './ReferralTierCard'
import { ReferralProgress } from './ReferralProgress'
import { ReferralList } from './ReferralList'

export function ReferralDashboard() {
  const { stats, currentTier, nextTier, progressToNext, isLoading, claimRewards } = useReferrals()

  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
  }

  if (!stats) {
    return <div className="text-center text-gray-400 py-8">Failed to load referral data</div>
  }

  const referralUrl = `https://grepcoin.xyz?ref=${stats.referralCode}`

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <ReferralTierCard tier={currentTier} isCurrent />

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">{stats.referralCount}</p>
              <p className="text-sm text-gray-400">Total Referrals</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{stats.totalEarned.toLocaleString()}</p>
              <p className="text-sm text-gray-400">GREP Earned</p>
            </div>
          </div>

          {stats.pendingRewards > 0 && (
            <button
              onClick={claimRewards}
              className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold"
            >
              Claim {stats.pendingRewards} GREP
            </button>
          )}
        </div>
      </div>

      {nextTier && (
        <ReferralProgress
          current={stats.referralCount}
          nextTier={nextTier}
          progress={progressToNext}
        />
      )}

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Your Referral Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm"
          />
          <button
            onClick={() => navigator.clipboard.writeText(referralUrl)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
          >
            Copy
          </button>
        </div>
      </div>

      <ReferralList referrals={stats.referrals} />
    </div>
  )
}

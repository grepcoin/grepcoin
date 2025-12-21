'use client'

import { useState } from 'react'
import { Trophy, Calendar, Gift, Coins, TrendingUp, Crown, Medal, Award, Clock } from 'lucide-react'
import { useLeaderboardRewards } from '@/hooks/useLeaderboardRewards'
import { useAccount } from 'wagmi'

interface LeaderboardRewardsProps {
  type?: 'weekly' | 'monthly'
}

export default function LeaderboardRewards({ type }: LeaderboardRewardsProps) {
  const { isConnected } = useAccount()
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly'>('weekly')

  const {
    upcoming,
    past,
    projected,
    countdown,
    isLoading,
    error,
  } = useLeaderboardRewards(type || selectedPeriod)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-grep-orange border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        {error}
      </div>
    )
  }

  const currentUpcoming = upcoming.find((u) => u.period === (type || selectedPeriod).toUpperCase())
  const currentCountdown = countdown?.[type || selectedPeriod]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <Trophy className="w-4 h-4 text-gray-400" />
    }
  }

  const formatTime = (value: number) => value.toString().padStart(2, '0')

  return (
    <div className="space-y-6">
      {/* Period Selector (if no type provided) */}
      {!type && (
        <div className="flex gap-2 bg-dark-800 rounded-lg p-1">
          <button
            onClick={() => setSelectedPeriod('weekly')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'weekly'
                ? 'bg-grep-orange text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setSelectedPeriod('monthly')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'monthly'
                ? 'bg-grep-orange text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
        </div>
      )}

      {/* Countdown to Next Distribution */}
      {currentCountdown && currentCountdown.total > 0 && (
        <div className="bg-gradient-to-r from-grep-purple/20 to-grep-pink/20 border border-grep-purple/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-grep-orange" />
              Next Distribution
            </h3>
            <span className="text-sm text-gray-400">
              {selectedPeriod === 'weekly' ? 'Every Sunday' : '1st of Month'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-grep-orange">
                {formatTime(currentCountdown.days)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-grep-orange">
                {formatTime(currentCountdown.hours)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-grep-orange">
                {formatTime(currentCountdown.minutes)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-grep-orange">
                {formatTime(currentCountdown.seconds)}
              </div>
              <div className="text-xs text-gray-400 mt-1">Seconds</div>
            </div>
          </div>
        </div>
      )}

      {/* Reward Tiers */}
      {currentUpcoming && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          <div className="bg-dark-700/50 px-6 py-4 border-b border-dark-600">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-grep-orange" />
              Reward Tiers
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Total Pool: <span className="text-grep-orange font-bold">{currentUpcoming.totalPool.toLocaleString()} GREP</span>
            </p>
          </div>

          <div className="divide-y divide-dark-600">
            {currentUpcoming.tiers.map((tier, index) => (
              <div key={index} className="px-6 py-4 hover:bg-dark-700/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-dark-700 border border-dark-600 flex items-center justify-center">
                      {getRankIcon(tier.rankStart)}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {tier.rankStart === tier.rankEnd
                          ? `Rank #${tier.rankStart}`
                          : `Ranks #${tier.rankStart}-${tier.rankEnd}`}
                      </div>
                      {tier.badgeId && (
                        <div className="text-sm text-gray-400 mt-1">
                          Includes special badge
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 text-grep-orange font-bold text-lg">
                      <Coins className="w-5 h-5" />
                      {tier.grepAmount.toLocaleString()}
                    </div>
                    {tier.multiplierBonus && (
                      <div className="text-sm text-green-400 mt-1">
                        +{((tier.multiplierBonus - 1) * 100).toFixed(0)}% multiplier
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User's Projected Rewards (if connected) */}
      {isConnected && projected && (
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Your Projected Rewards
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekly Projection */}
            <div className="bg-dark-800/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Weekly</div>
              {projected.weekly ? (
                <div>
                  <div className="flex items-center gap-2 text-2xl font-bold text-white mb-2">
                    {getRankIcon(projected.weekly.rank)}
                    <span>Rank #{projected.weekly.rank}</span>
                  </div>
                  <div className="flex items-center gap-2 text-grep-orange font-bold text-xl">
                    <Coins className="w-5 h-5" />
                    {projected.weekly.grepAmount.toLocaleString()} GREP
                  </div>
                  {projected.weekly.multiplierBonus && (
                    <div className="text-sm text-green-400 mt-2">
                      +{((projected.weekly.multiplierBonus - 1) * 100).toFixed(0)}% multiplier bonus
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 italic">Not in top 10</div>
              )}
            </div>

            {/* Monthly Projection */}
            <div className="bg-dark-800/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Monthly</div>
              {projected.monthly ? (
                <div>
                  <div className="flex items-center gap-2 text-2xl font-bold text-white mb-2">
                    {getRankIcon(projected.monthly.rank)}
                    <span>Rank #{projected.monthly.rank}</span>
                  </div>
                  <div className="flex items-center gap-2 text-grep-orange font-bold text-xl">
                    <Coins className="w-5 h-5" />
                    {projected.monthly.grepAmount.toLocaleString()} GREP
                  </div>
                  {projected.monthly.multiplierBonus && (
                    <div className="text-sm text-green-400 mt-2">
                      +{((projected.monthly.multiplierBonus - 1) * 100).toFixed(0)}% multiplier bonus
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 italic">Not in top 25</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Past Winners */}
      {past.length > 0 && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
          <div className="bg-dark-700/50 px-6 py-4 border-b border-dark-600">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-grep-orange" />
              Past Distributions
            </h3>
          </div>

          <div className="divide-y divide-dark-600">
            {past.map((distribution) => (
              <div key={distribution.id} className="px-6 py-4 hover:bg-dark-700/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">
                      {distribution.period} - {new Date(distribution.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {distribution.winnersCount} winners • {distribution.totalPool.toLocaleString()} GREP pool
                    </div>
                  </div>

                  {distribution.userReward && (
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-grep-orange font-bold">
                        {getRankIcon(distribution.userReward.rank)}
                        <span>{distribution.userReward.grepAmount.toLocaleString()} GREP</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {distribution.userReward.status === 'CLAIMED' ? (
                          <span className="text-green-400">Claimed</span>
                        ) : (
                          <span className="text-yellow-400">Pending</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

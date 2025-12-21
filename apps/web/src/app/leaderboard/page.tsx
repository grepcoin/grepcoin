'use client'

import { useState } from 'react'
import { Trophy, Medal, Award, Users, Coins, TrendingUp, ChevronDown, Gift } from 'lucide-react'
import { useLeaderboards, usePlayerRanking } from '@/hooks/useLeaderboards'
import { useAccount } from 'wagmi'
import LeaderboardRewards from '@/components/LeaderboardRewards'
import RewardClaimModal from '@/components/RewardClaimModal'
import { useMyRewards, useClaimReward } from '@/hooks/useLeaderboardRewards'

type Period = 'all' | 'weekly' | 'daily'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'weekly', label: 'This Week' },
  { value: 'daily', label: 'Today' },
]

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-400" />
    case 2:
      return <Medal className="w-6 h-6 text-gray-300" />
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>
  }
}

function getRankBadgeClass(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50'
    case 2:
      return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50'
    case 3:
      return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50'
    default:
      return 'bg-dark-800 border-dark-600'
  }
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('all')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'rewards'>('leaderboard')
  const [selectedReward, setSelectedReward] = useState<any>(null)
  const { isConnected } = useAccount()

  const { leaderboard, isLoading, error } = useLeaderboards({
    limit: 50,
    period,
  })

  const { ranking, nearbyPlayers } = usePlayerRanking({
    period,
    nearby: 3,
  })

  const { rewards, totalClaimable, count: rewardCount, refetch: refetchRewards } = useMyRewards()
  const { claimReward } = useClaimReward()

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Leaderboard
            </h1>
            <p className="text-gray-400 mt-1">Top GREP earners on the platform</p>
          </div>

          {/* Period Selector (only shown on leaderboard tab) */}
          {activeTab === 'leaderboard' && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white hover:border-dark-500 transition-colors"
              >
                {PERIOD_OPTIONS.find(p => p.value === period)?.label}
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-10 overflow-hidden">
                  {PERIOD_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPeriod(option.value)
                        setDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-dark-700 transition-colors ${
                        period === option.value ? 'text-grep-orange' : 'text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 bg-dark-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'leaderboard'
                ? 'bg-grep-orange text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-5 h-5" />
            Rankings
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 relative ${
              activeTab === 'rewards'
                ? 'bg-grep-orange text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gift className="w-5 h-5" />
            Rewards
            {rewardCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {rewardCount}
              </span>
            )}
          </button>
        </div>

        {/* Claimable Rewards Banner */}
        {isConnected && rewardCount > 0 && activeTab === 'leaderboard' && (
          <div className="mb-6 bg-gradient-to-r from-grep-orange/20 to-grep-pink/20 border border-grep-orange/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-grep-orange" />
                <div>
                  <div className="font-bold text-white">
                    You have {rewardCount} reward{rewardCount > 1 ? 's' : ''} to claim!
                  </div>
                  <div className="text-sm text-gray-400">
                    Total: {totalClaimable.toLocaleString()} GREP
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('rewards')}
                className="px-4 py-2 bg-grep-orange text-white font-medium rounded-lg hover:bg-grep-orange/80 transition-colors"
              >
                View Rewards
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'leaderboard' ? (
          <>
            {/* Your Ranking Card (if connected) */}
            {isConnected && ranking && ranking.rank !== null && (
              <div className="mb-8 p-6 bg-gradient-to-r from-grep-purple/20 to-grep-pink/20 border border-grep-purple/30 rounded-xl">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Your Ranking
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-grep-orange">#{ranking.rank}</p>
                    <p className="text-gray-400 text-sm">Rank</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-400">{ranking.grepEarned.toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">GREP Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-400">{ranking.score.toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">Total Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">{ranking.gamesPlayed}</p>
                    <p className="text-gray-400 text-sm">Games Played</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-4 text-center">
                  You're in the top {Math.round((ranking.rank / ranking.totalPlayers) * 100)}% of {ranking.totalPlayers.toLocaleString()} players
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-grep-orange border-t-transparent rounded-full" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20 text-red-400">
                {error}
              </div>
            )}

        {/* Leaderboard Table */}
        {!isLoading && !error && (
          <div className="bg-dark-800 rounded-xl border border-dark-600 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-dark-700/50 border-b border-dark-600 text-gray-400 text-sm font-medium">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-right">Score</div>
              <div className="col-span-2 text-right flex items-center justify-end gap-1">
                <Coins className="w-4 h-4 text-grep-orange" />
                GREP
              </div>
              <div className="col-span-2 text-right">Games</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-dark-600">
              {leaderboard.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  No players found for this period. Be the first to play!
                </div>
              ) : (
                leaderboard.map(entry => (
                  <div
                    key={entry.wallet}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-dark-700/30 ${
                      entry.isCurrentUser ? 'bg-grep-purple/10' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getRankBadgeClass(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                    </div>

                    {/* Player */}
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-grep-purple to-grep-pink flex items-center justify-center text-white font-bold">
                        {entry.username?.[0]?.toUpperCase() || entry.wallet[2].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {entry.username || formatAddress(entry.wallet)}
                          {entry.isCurrentUser && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-grep-purple/30 text-grep-purple rounded">You</span>
                          )}
                        </p>
                        {entry.username && (
                          <p className="text-gray-500 text-sm">{formatAddress(entry.wallet)}</p>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 text-right">
                      <span className="text-white font-medium">{entry.score.toLocaleString()}</span>
                    </div>

                    {/* GREP Earned */}
                    <div className="col-span-2 text-right">
                      <span className="text-grep-orange font-bold">{entry.grepEarned.toLocaleString()}</span>
                    </div>

                    {/* Games Played */}
                    <div className="col-span-2 text-right">
                      <span className="text-gray-400">{entry.gamesPlayed || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

            {/* Stats Summary */}
            {!isLoading && !error && leaderboard.length > 0 && (
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-dark-800 rounded-lg p-4 text-center border border-dark-600">
                  <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{leaderboard.length}</p>
                  <p className="text-gray-400 text-sm">Active Players</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-4 text-center border border-dark-600">
                  <Coins className="w-6 h-6 text-grep-orange mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {leaderboard.reduce((sum, e) => sum + e.grepEarned, 0).toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Total GREP Earned</p>
                </div>
                <div className="bg-dark-800 rounded-lg p-4 text-center border border-dark-600">
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {leaderboard.reduce((sum, e) => sum + (e.gamesPlayed || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">Total Games Played</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Rewards Tab */}
            {/* My Claimable Rewards Section */}
            {isConnected && rewards.length > 0 && (
              <div className="mb-8 bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
                <div className="bg-dark-700/50 px-6 py-4 border-b border-dark-600">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-grep-orange" />
                    Your Rewards ({rewardCount})
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Total claimable: <span className="text-grep-orange font-bold">{totalClaimable.toLocaleString()} GREP</span>
                  </p>
                </div>

                <div className="divide-y divide-dark-600">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="px-6 py-4 hover:bg-dark-700/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-dark-700 border border-dark-600 flex items-center justify-center">
                            {reward.rank === 1 && <Trophy className="w-6 h-6 text-yellow-400" />}
                            {reward.rank === 2 && <Medal className="w-6 h-6 text-gray-300" />}
                            {reward.rank === 3 && <Award className="w-6 h-6 text-amber-600" />}
                            {reward.rank > 3 && <Trophy className="w-6 h-6 text-gray-400" />}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {reward.period} • Rank #{reward.rank}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {new Date(reward.distributionEnd).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedReward(reward)}
                          className="px-4 py-2 bg-grep-orange text-white font-medium rounded-lg hover:bg-grep-orange/80 transition-colors"
                        >
                          Claim {reward.grepAmount.toLocaleString()} GREP
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards Schedule and Information */}
            <LeaderboardRewards />
          </>
        )}
      </div>

      {/* Reward Claim Modal */}
      {selectedReward && (
        <RewardClaimModal
          isOpen={!!selectedReward}
          onClose={() => {
            setSelectedReward(null)
            refetchRewards()
          }}
          reward={selectedReward}
          onClaim={claimReward}
        />
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import {
  ArrowLeft,
  Trophy,
  Coins,
  Gamepad2,
  Star,
  TrendingUp,
  Calendar,
  Users,
  Gift,
  Lock,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { useUserAchievements } from '@/hooks/useAchievements'

const RARITY_COLORS = {
  common: { bg: 'from-gray-500 to-gray-600', text: 'text-gray-400', border: 'border-gray-500' },
  uncommon: { bg: 'from-green-500 to-green-600', text: 'text-green-400', border: 'border-green-500' },
  rare: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-400', border: 'border-blue-500' },
  epic: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-400', border: 'border-purple-500' },
  legendary: { bg: 'from-yellow-500 to-orange-500', text: 'text-yellow-400', border: 'border-yellow-500' },
}

const TIER_COLORS: Record<string, string> = {
  none: 'text-gray-400',
  bronze: 'text-orange-400',
  silver: 'text-gray-300',
  gold: 'text-yellow-400',
  platinum: 'text-cyan-400',
  diamond: 'text-purple-400',
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const { profile, isLoading: profileLoading } = useProfile(address?.toLowerCase() || null)
  const { achievements, summary, isLoading: achievementsLoading } = useUserAchievements(address?.toLowerCase() || null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'games'>('stats')

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-dark-800 flex items-center justify-center">
            <Lock className="w-10 h-10 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-6">Connect your wallet to view your profile</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </main>
    )
  }

  const isLoading = profileLoading || achievementsLoading

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800/50 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-grep-purple to-grep-pink flex items-center justify-center text-4xl">
              {profile?.avatar || '🎮'}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile?.username || 'Anonymous Player'}</h1>
                {profile?.stakingTier && profile.stakingTier !== 'none' && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium bg-dark-700 ${TIER_COLORS[profile.stakingTier]}`}>
                    {profile.stakingTier.charAt(0).toUpperCase() + profile.stakingTier.slice(1)} Tier
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span>{address ? formatAddress(address) : ''}</span>
                <button onClick={copyAddress} className="p-1 hover:text-white transition-colors">
                  {copied ? <Check className="w-4 h-4 text-grep-green" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`https://basescan.org/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              {profile?.createdAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-grep-green">{profile?.stats.totalGrepEarned.toLocaleString() || 0}</div>
                <div className="text-sm text-gray-400">GREP Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-grep-purple">{profile?.stats.gamesPlayed || 0}</div>
                <div className="text-sm text-gray-400">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-grep-yellow">{summary.unlocked}/{summary.total}</div>
                <div className="text-sm text-gray-400">Achievements</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['stats', 'achievements', 'games'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-grep-purple to-grep-pink text-white'
                  : 'bg-dark-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'stats' && <TrendingUp className="w-4 h-4 inline mr-2" />}
              {tab === 'achievements' && <Trophy className="w-4 h-4 inline mr-2" />}
              {tab === 'games' && <Gamepad2 className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-grep-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<Coins className="w-6 h-6" />}
                  label="Total GREP Earned"
                  value={profile?.stats.totalGrepEarned.toLocaleString() || '0'}
                  color="text-grep-green"
                />
                <StatCard
                  icon={<Gamepad2 className="w-6 h-6" />}
                  label="Games Played"
                  value={profile?.stats.gamesPlayed.toString() || '0'}
                  color="text-grep-purple"
                />
                <StatCard
                  icon={<Trophy className="w-6 h-6" />}
                  label="Achievements"
                  value={`${summary.unlocked}/${summary.total}`}
                  color="text-grep-yellow"
                />
                <StatCard
                  icon={<Star className="w-6 h-6" />}
                  label="Staking Multiplier"
                  value={`${profile?.stakingMultiplier || 1}x`}
                  color="text-grep-cyan"
                />

                {/* Staking Info */}
                <div className="md:col-span-2 lg:col-span-4 p-6 rounded-2xl bg-dark-800 border border-dark-700">
                  <h3 className="text-xl font-bold mb-4">Staking Status</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-2xl font-bold ${TIER_COLORS[profile?.stakingTier || 'none']}`}>
                        {profile?.stakingTier === 'none' ? 'Not Staking' : `${profile?.stakingTier?.charAt(0).toUpperCase()}${profile?.stakingTier?.slice(1)} Tier`}
                      </div>
                      <p className="text-gray-400 mt-1">
                        {profile?.stakingTier === 'none'
                          ? 'Stake GREP tokens to earn multipliers and bonus plays'
                          : `Earning ${profile?.stakingMultiplier}x rewards on all games`}
                      </p>
                    </div>
                    <Link href="/staking" className="btn-primary">
                      {profile?.stakingTier === 'none' ? 'Start Staking' : 'Manage Staking'}
                    </Link>
                  </div>
                </div>

                {/* Referral Stats */}
                <div className="md:col-span-2 lg:col-span-4 p-6 rounded-2xl bg-dark-800 border border-dark-700">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-grep-pink" />
                    Referral Program
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 p-4 rounded-xl bg-dark-700">
                      <div className="text-sm text-gray-400 mb-1">Your Referral Code</div>
                      <div className="text-xl font-mono font-bold">{address?.slice(-8).toUpperCase()}</div>
                    </div>
                    <div className="text-center px-6">
                      <div className="text-2xl font-bold text-grep-green">100</div>
                      <div className="text-sm text-gray-400">GREP per referral</div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://grepcoin.io/?ref=${address?.slice(-8).toUpperCase()}`)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      className="btn-secondary"
                    >
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div>
                {/* Achievement Summary */}
                <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-dark-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink flex items-center justify-center">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{summary.unlocked}/{summary.total} Unlocked</div>
                      <div className="text-gray-400">+{summary.totalRewards} GREP earned from achievements</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Completion</div>
                    <div className="text-2xl font-bold text-gradient">
                      {summary.total > 0 ? Math.round((summary.unlocked / summary.total) * 100) : 0}%
                    </div>
                  </div>
                </div>

                {/* Achievement Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`relative p-4 rounded-2xl border transition-all ${
                        achievement.unlocked
                          ? `bg-dark-800/80 ${RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS]?.border || 'border-gray-500'}`
                          : 'bg-dark-800/40 border-dark-700 opacity-70'
                      }`}
                    >
                      {/* Glow effect for unlocked */}
                      {achievement.unlocked && (
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS]?.bg || 'from-gray-500 to-gray-600'} opacity-10`} />
                      )}

                      <div className="relative">
                        {/* Icon */}
                        <div className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl ${
                          achievement.unlocked
                            ? `bg-gradient-to-r ${RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS]?.bg || 'from-gray-500 to-gray-600'}`
                            : 'bg-dark-700'
                        }`}>
                          {achievement.unlocked ? achievement.icon : <Lock className="w-5 h-5 text-gray-500" />}
                        </div>

                        {/* Name & Rarity */}
                        <h3 className="font-bold text-center mb-1">{achievement.name}</h3>
                        <div className={`text-xs text-center ${RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS]?.text || 'text-gray-400'} mb-2`}>
                          {achievement.rarity?.toUpperCase()}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-gray-400 text-center mb-3">{achievement.description}</p>

                        {/* Progress bar */}
                        {!achievement.unlocked && achievement.target && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress || 0}/{achievement.target}</span>
                            </div>
                            <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${RARITY_COLORS[achievement.rarity as keyof typeof RARITY_COLORS]?.bg || 'from-gray-500 to-gray-600'}`}
                                style={{ width: `${Math.min(100, ((achievement.progress || 0) / achievement.target) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Reward */}
                        <div className="flex items-center justify-center gap-1 text-sm">
                          <Gift className="w-3 h-3 text-grep-green" />
                          <span className={achievement.unlocked ? 'text-grep-green' : 'text-gray-500'}>
                            +{achievement.reward} GREP
                          </span>
                        </div>

                        {/* Unlock date */}
                        {achievement.unlocked && achievement.unlockedAt && (
                          <div className="text-xs text-center text-gray-500 mt-2">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <div className="space-y-4">
                {profile?.gameStats && profile.gameStats.length > 0 ? (
                  profile.gameStats.map((game) => (
                    <div key={game.gameSlug} className="p-6 rounded-2xl bg-dark-800 border border-dark-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink flex items-center justify-center text-2xl">
                            <Gamepad2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">{game.game}</h3>
                            <div className="text-gray-400">{game.gamesPlayed} games played</div>
                          </div>
                        </div>
                        <div className="flex gap-8 text-center">
                          <div>
                            <div className="text-2xl font-bold text-grep-green">{game.highScore.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">High Score</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-grep-orange">{game.bestStreak}x</div>
                            <div className="text-sm text-gray-400">Best Streak</div>
                          </div>
                          <Link
                            href={`/games/${game.gameSlug}`}
                            className="btn-primary"
                          >
                            Play Again
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <Gamepad2 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Games Played Yet</h3>
                    <p className="text-gray-400 mb-6">Start playing to track your stats!</p>
                    <Link href="/games" className="btn-primary">
                      Browse Games
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="p-6 rounded-2xl bg-dark-800 border border-dark-700">
      <div className={`w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center mb-4 ${color}`}>
        {icon}
      </div>
      <div className={`text-3xl font-bold mb-1 ${color}`}>{value}</div>
      <div className="text-gray-400">{label}</div>
    </div>
  )
}

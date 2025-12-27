'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Trophy, Flame, Target, Coins, Crown, ArrowRight, Sparkles, Gamepad2 } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'

const TIER_COLORS = {
  diamond: { bg: 'from-cyan-400 to-blue-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/50' },
  gold: { bg: 'from-yellow-400 to-orange-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' },
  silver: { bg: 'from-gray-300 to-gray-500', text: 'text-gray-300', glow: 'shadow-gray-500/50' },
  bronze: { bg: 'from-orange-400 to-orange-700', text: 'text-orange-400', glow: 'shadow-orange-500/50' },
  flexible: { bg: 'from-green-400 to-teal-500', text: 'text-green-400', glow: 'shadow-green-500/50' },
  none: { bg: 'from-gray-500 to-gray-600', text: 'text-gray-400', glow: 'shadow-gray-500/50' },
}

const AVATARS = ['🦊', '🐉', '🧙', '🚀', '🎮', '⚡', '🔥', '💎']

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function getTierKey(tier: string): keyof typeof TIER_COLORS {
  const normalized = tier.toLowerCase()
  if (normalized in TIER_COLORS) {
    return normalized as keyof typeof TIER_COLORS
  }
  return 'none'
}

export default function PlayerSpotlight() {
  const { leaderboard, isLoading } = useLeaderboard({ period: 'weekly', limit: 3 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [animatedEarnings, setAnimatedEarnings] = useState(0)

  const players = leaderboard.map((entry, index) => ({
    rank: entry.rank,
    name: entry.username || `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`,
    avatar: AVATARS[index % AVATARS.length],
    tier: getTierKey(entry.stakingTier),
    totalEarned: entry.totalGrep,
    gamesPlayed: entry.gamesPlayed,
    winRate: Math.min(99, Math.floor(70 + Math.random() * 25)),
    streak: entry.bestStreak,
  }))

  const selectedPlayer = players[selectedIndex] || null

  // Use ref to track current animated value without causing effect re-runs
  const animatedEarningsRef = useRef(animatedEarnings)
  animatedEarningsRef.current = animatedEarnings

  useEffect(() => {
    if (!selectedPlayer) return

    const duration = 1500
    const startTime = Date.now()
    const startValue = animatedEarningsRef.current
    const endValue = selectedPlayer.totalEarned

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedEarnings(Math.floor(startValue + (endValue - startValue) * eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }, [selectedPlayer])

  // Show empty state when no players
  if (!isLoading && players.length === 0) {
    return (
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-grep-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-grep-pink/10 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-grep-yellow/20 to-grep-orange/20 border border-grep-yellow/30 mb-6">
            <Crown className="w-4 h-4 text-grep-yellow" />
            <span className="text-sm font-medium text-grep-yellow">Hall of Fame</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            Top <span className="text-gradient">Players</span>
          </h2>

          <div className="p-12 rounded-3xl bg-dark-800/50 border border-dark-700">
            <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold mb-2">No Players Yet</h3>
            <p className="text-gray-400 mb-6">
              Be the first to claim your spot on the leaderboard!
            </p>
            <Link
              href="/games"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink font-semibold hover:opacity-90 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Start Playing
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 w-32 mx-auto bg-dark-700 rounded-full animate-pulse mb-6" />
            <div className="h-12 w-64 mx-auto bg-dark-700 rounded animate-pulse mb-4" />
            <div className="h-6 w-96 mx-auto bg-dark-700 rounded animate-pulse" />
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="h-96 bg-dark-800/50 rounded-3xl animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-dark-800/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!selectedPlayer) return null

  const tierColors = TIER_COLORS[selectedPlayer.tier]

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-grep-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-grep-pink/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-grep-yellow/20 to-grep-orange/20 border border-grep-yellow/30 mb-6">
            <Crown className="w-4 h-4 text-grep-yellow" />
            <span className="text-sm font-medium text-grep-yellow">Hall of Fame</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            Top <span className="text-gradient">Players</span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Meet the legends dominating the leaderboards. Will you be next?
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Featured Player */}
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${tierColors.bg} opacity-20 blur-3xl rounded-3xl`} />

            <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-3xl border border-dark-700 p-8 shadow-2xl">
              {/* Rank badge */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-r from-grep-purple to-grep-pink flex items-center justify-center shadow-lg transform rotate-12">
                <span className="text-2xl font-bold transform -rotate-12">#{selectedPlayer.rank}</span>
              </div>

              {/* Player info */}
              <div className="flex items-center gap-6 mb-8">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-r ${tierColors.bg} flex items-center justify-center text-5xl shadow-lg ${tierColors.glow}`}>
                  {selectedPlayer.avatar}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{selectedPlayer.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tierColors.bg}`}>
                      {selectedPlayer.tier.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-dark-700/50">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <Coins className="w-4 h-4 text-grep-yellow" />
                    Total Earned
                  </div>
                  <div className="text-2xl font-bold text-grep-green">
                    {formatNumber(animatedEarnings)} GREP
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-dark-700/50">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <Target className="w-4 h-4 text-grep-purple" />
                    Games Played
                  </div>
                  <div className="text-2xl font-bold">
                    {formatNumber(selectedPlayer.gamesPlayed)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-dark-700/50">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <Trophy className="w-4 h-4 text-grep-cyan" />
                    Win Rate
                  </div>
                  <div className="text-2xl font-bold text-grep-cyan">
                    {selectedPlayer.winRate}%
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-dark-700/50">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <Flame className="w-4 h-4 text-grep-orange" />
                    Best Streak
                  </div>
                  <div className="text-2xl font-bold text-grep-orange">
                    {selectedPlayer.streak}x
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/games"
                className="flex items-center justify-center gap-2 w-full p-4 rounded-xl bg-gradient-to-r from-grep-purple/10 to-grep-pink/10 border border-grep-purple/20 hover:border-grep-purple/40 transition-colors"
              >
                <span className="font-semibold">Challenge the Leaderboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Player list */}
          <div className="space-y-4">
            {players.map((player, index) => {
              const playerTierColors = TIER_COLORS[player.tier]
              return (
                <button
                  key={player.rank}
                  onClick={() => setSelectedIndex(index)}
                  className={`w-full p-4 rounded-2xl border transition-all text-left ${
                    selectedIndex === index
                      ? 'bg-dark-700/80 border-grep-purple scale-105 shadow-lg'
                      : 'bg-dark-800/50 border-dark-700 hover:border-dark-600 hover:bg-dark-700/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${playerTierColors.bg} flex items-center justify-center text-2xl`}>
                      {player.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{player.name}</span>
                        <span className={`text-xs ${playerTierColors.text}`}>
                          {player.tier.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatNumber(player.totalEarned)} GREP earned
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        player.rank === 1 ? 'text-yellow-400' :
                        player.rank === 2 ? 'text-gray-300' :
                        'text-orange-400'
                      }`}>
                        #{player.rank}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}

            {/* CTA */}
            <Link
              href="/games"
              className="block w-full p-4 rounded-2xl bg-gradient-to-r from-grep-purple/20 to-grep-pink/20 border border-grep-purple/30 hover:border-grep-purple/50 transition-all text-center group"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-grep-purple" />
                <span className="font-semibold">Start Your Journey</span>
                <ArrowRight className="w-5 h-5 text-grep-purple group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Play now and climb the leaderboard
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

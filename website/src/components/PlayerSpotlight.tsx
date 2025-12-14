'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, Flame, Target, Coins, Crown, ArrowRight, Sparkles } from 'lucide-react'

interface Player {
  rank: number
  name: string
  avatar: string
  tier: 'diamond' | 'gold' | 'silver' | 'bronze'
  totalEarned: number
  gamesPlayed: number
  winRate: number
  streak: number
  favoriteGame: string
  achievements: string[]
}

const TOP_PLAYERS: Player[] = [
  {
    rank: 1,
    name: 'regex_master.eth',
    avatar: '🦊',
    tier: 'diamond',
    totalEarned: 125000,
    gamesPlayed: 2847,
    winRate: 94,
    streak: 47,
    favoriteGame: 'Grep Rails',
    achievements: ['👑', '🔥', '💎', '⚡'],
  },
  {
    rank: 2,
    name: 'quantum_pro.eth',
    avatar: '🐉',
    tier: 'diamond',
    totalEarned: 98500,
    gamesPlayed: 2156,
    winRate: 91,
    streak: 32,
    favoriteGame: 'Quantum Grep',
    achievements: ['🏆', '🔥', '💎'],
  },
  {
    rank: 3,
    name: 'stack_wizard',
    avatar: '🧙',
    tier: 'gold',
    totalEarned: 76200,
    gamesPlayed: 1823,
    winRate: 88,
    streak: 28,
    favoriteGame: 'Stack Panic',
    achievements: ['🏆', '⚡', '🎯'],
  },
]

const TIER_COLORS = {
  diamond: { bg: 'from-cyan-400 to-blue-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/50' },
  gold: { bg: 'from-yellow-400 to-orange-500', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' },
  silver: { bg: 'from-gray-300 to-gray-500', text: 'text-gray-300', glow: 'shadow-gray-500/50' },
  bronze: { bg: 'from-orange-400 to-orange-700', text: 'text-orange-400', glow: 'shadow-orange-500/50' },
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export default function PlayerSpotlight() {
  const [selectedPlayer, setSelectedPlayer] = useState(TOP_PLAYERS[0])
  const [animatedEarnings, setAnimatedEarnings] = useState(0)

  useEffect(() => {
    const duration = 1500
    const startTime = Date.now()
    const startValue = animatedEarnings
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
            <div className={`absolute inset-0 bg-gradient-to-r ${TIER_COLORS[selectedPlayer.tier].bg} opacity-20 blur-3xl rounded-3xl`} />

            <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-3xl border border-dark-700 p-8 shadow-2xl">
              {/* Rank badge */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-r from-grep-purple to-grep-pink flex items-center justify-center shadow-lg transform rotate-12">
                <span className="text-2xl font-bold transform -rotate-12">#{selectedPlayer.rank}</span>
              </div>

              {/* Player info */}
              <div className="flex items-center gap-6 mb-8">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-r ${TIER_COLORS[selectedPlayer.tier].bg} flex items-center justify-center text-5xl shadow-lg ${TIER_COLORS[selectedPlayer.tier].glow}`}>
                  {selectedPlayer.avatar}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{selectedPlayer.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${TIER_COLORS[selectedPlayer.tier].bg}`}>
                      {selectedPlayer.tier.toUpperCase()}
                    </span>
                    <div className="flex gap-1">
                      {selectedPlayer.achievements.map((a, i) => (
                        <span key={i} className="text-lg">{a}</span>
                      ))}
                    </div>
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

              {/* Favorite game */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-grep-purple/10 to-grep-pink/10 border border-grep-purple/20">
                <div>
                  <div className="text-sm text-gray-400">Favorite Game</div>
                  <div className="font-bold">{selectedPlayer.favoriteGame}</div>
                </div>
                <Link
                  href={`/games/${selectedPlayer.favoriteGame.toLowerCase().replace(' ', '-')}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2"
                >
                  Challenge
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Player list */}
          <div className="space-y-4">
            {TOP_PLAYERS.map((player, index) => (
              <button
                key={player.rank}
                onClick={() => setSelectedPlayer(player)}
                className={`w-full p-4 rounded-2xl border transition-all text-left ${
                  selectedPlayer.rank === player.rank
                    ? 'bg-dark-700/80 border-grep-purple scale-105 shadow-lg'
                    : 'bg-dark-800/50 border-dark-700 hover:border-dark-600 hover:bg-dark-700/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${TIER_COLORS[player.tier].bg} flex items-center justify-center text-2xl`}>
                    {player.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{player.name}</span>
                      <span className={`text-xs ${TIER_COLORS[player.tier].text}`}>
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
            ))}

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

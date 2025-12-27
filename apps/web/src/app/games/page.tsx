'use client'

import Link from 'next/link'
import { ArrowLeft, Gamepad2, Trophy, Coins, Zap, Swords, Star } from 'lucide-react'
import Leaderboard from '@/components/Leaderboard'
import StakingBadge from '@/components/StakingBadge'
import { useStaking } from '@/context/StakingContext'

const games = [
  {
    id: 'grep-rails',
    name: 'Grep Rails',
    description: 'Build train tracks by matching regex patterns. Collect power-ups and build streaks!',
    difficulty: 'Hard',
    color: 'from-grep-purple to-grep-pink',
    icon: '🚂',
    rewards: '10-50 GREP',
    status: 'live',
  },
  {
    id: 'stack-panic',
    name: 'Stack Panic',
    description: 'Functions piling up! Return them in LIFO order. Watch out for bugs!',
    difficulty: 'Medium',
    color: 'from-grep-orange to-grep-yellow',
    icon: '📚',
    rewards: '5-30 GREP',
    status: 'live',
  },
  {
    id: 'merge-miners',
    name: 'Merge Miners',
    description: 'Mine through Git branches, resolve conflicts, and commit your progress!',
    difficulty: 'Medium',
    color: 'from-grep-green to-grep-cyan',
    icon: '⛏️',
    rewards: '5-40 GREP',
    status: 'live',
  },
  {
    id: 'quantum-grep',
    name: 'Quantum Grep',
    description: 'Observe particles in superposition. Collapse them into the right patterns!',
    difficulty: 'Hard',
    color: 'from-grep-cyan to-grep-blue',
    icon: '⚛️',
    rewards: '10-60 GREP',
    status: 'live',
  },
  {
    id: 'bug-hunter',
    name: 'Bug Hunter',
    description: 'Find and squash bugs in scrolling code snippets before they escape!',
    difficulty: 'Medium',
    color: 'from-red-500 to-orange-500',
    icon: '🐛',
    rewards: '10-60 GREP',
    status: 'live',
  },
  {
    id: 'crypto-snake',
    name: 'Crypto Snake',
    description: 'Classic snake game with blockchain vibes. Collect GREP coins and grow your chain!',
    difficulty: 'Easy',
    color: 'from-green-500 to-cyan-500',
    icon: '🐍',
    rewards: '5-40 GREP',
    status: 'live',
  },
  {
    id: 'syntax-sprint',
    name: 'Syntax Sprint',
    description: 'Build valid JavaScript from falling code tokens. Tetris meets programming!',
    difficulty: 'Hard',
    color: 'from-purple-500 to-pink-500',
    icon: '💻',
    rewards: '15-70 GREP',
    status: 'live',
  },
  {
    id: 'regex-crossword',
    name: 'RegEx Crossword',
    description: 'Solve crossword puzzles where clues are regex patterns. Match rows and columns!',
    difficulty: 'Medium',
    color: 'from-orange-500 to-yellow-500',
    icon: '🧩',
    rewards: '10-80 GREP',
    status: 'live',
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    description: 'Match pairs of code symbols! Build combos and clear 6 levels before time runs out.',
    difficulty: 'Easy',
    color: 'from-purple-500 to-cyan-500',
    icon: '🧠',
    rewards: '5-50 GREP',
    status: 'live',
  },
  {
    id: 'pipe-dream',
    name: 'Pipe Dream',
    description: 'Connect pipes to guide data flow! Place pipes before the flow starts and reach the exit.',
    difficulty: 'Medium',
    color: 'from-cyan-500 to-blue-500',
    icon: '🔧',
    rewards: '10-60 GREP',
    status: 'live',
  },
]

const miniGames = [
  {
    id: 'coin-flip',
    name: 'Coin Flip',
    description: 'Guess heads or tails for instant rewards!',
    icon: '🪙',
    rewards: '5-20 GREP',
    duration: '5 sec',
  },
  {
    id: 'tap-speed',
    name: 'Tap Speed',
    description: 'Tap as fast as you can in 10 seconds!',
    icon: '👆',
    rewards: '10-40 GREP',
    duration: '10 sec',
  },
  {
    id: 'quick-math',
    name: 'Quick Math',
    description: 'Solve 5 equations before time runs out!',
    icon: '🧮',
    rewards: '10-50 GREP',
    duration: '15 sec',
  },
  {
    id: 'color-match',
    name: 'Color Match',
    description: 'Match the color pattern quickly!',
    icon: '🎨',
    rewards: '8-35 GREP',
    duration: '10 sec',
  },
]

export default function GamesPage() {
  const { todayEarned, dailyPlaysLeft, maxDailyPlays, multiplier, isConnected } = useStaking()

  return (
    <main className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800/50 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-playful flex items-center justify-center">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold">
                  GrepCoin <span className="text-gradient">Arcade</span>
                </h1>
                <p className="text-gray-400 mt-1">Play games, earn GREP tokens</p>
              </div>
            </div>
            <StakingBadge compact showEarnings={false} />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-dark-800/30 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-grep-yellow" />
              <span className="text-gray-400">Today's Earnings:</span>
              <span className="font-bold text-grep-green">{todayEarned} GREP</span>
              {isConnected && multiplier > 1 && (
                <span className="text-xs text-grep-purple">({multiplier.toFixed(1)}x boost)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-grep-orange" />
              <span className="text-gray-400">Global Rank:</span>
              <span className="font-bold">{isConnected ? '#1,247' : '--'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-grep-purple" />
              <span className="text-gray-400">Daily Plays Left:</span>
              <span className="font-bold">{dailyPlaysLeft}/{maxDailyPlays}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-display font-bold mb-8">Choose Your Game</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className={`group relative overflow-hidden rounded-3xl bg-dark-800/50 border border-dark-700 hover:border-dark-600 transition-all ${
                game.status === 'coming-soon' ? 'opacity-60' : ''
              }`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

              <div className="relative p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {game.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      game.difficulty === 'Hard'
                        ? 'bg-red-500/20 text-red-400'
                        : game.difficulty === 'Medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {game.difficulty}
                    </span>
                    {game.status === 'coming-soon' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-display font-bold mb-1">{game.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{game.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <Coins className="w-3.5 h-3.5 text-grep-yellow" />
                  <span className="text-xs text-gray-400">Rewards:</span>
                  <span className="text-xs font-bold text-grep-green">{game.rewards}</span>
                </div>

                {game.status === 'live' ? (
                  <Link
                    href={`/games/${game.id}`}
                    className={`block w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r ${game.color} font-semibold text-sm hover:opacity-90 transition-opacity`}
                  >
                    Play Now
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-700 text-gray-500 font-semibold text-sm cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links - Tournaments & Battle Pass */}
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          <Link
            href="/tournaments"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-grep-purple/20 to-grep-pink/20 border border-grep-purple/30 hover:border-grep-purple/50 transition-all p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-grep-purple to-grep-pink flex items-center justify-center">
                <Swords className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold">Tournaments</h3>
                <p className="text-gray-400 text-sm">Compete for massive GREP prizes</p>
              </div>
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-grep-pink/20 text-grep-pink text-xs font-semibold">
              Live Events
            </div>
          </Link>

          <Link
            href="/battle-pass"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-grep-orange/20 to-grep-yellow/20 border border-grep-orange/30 hover:border-grep-orange/50 transition-all p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-grep-orange to-grep-yellow flex items-center justify-center">
                <Star className="w-8 h-8 text-dark-900" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold">Battle Pass</h3>
                <p className="text-gray-400 text-sm">Unlock exclusive rewards each season</p>
              </div>
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-grep-orange/20 text-grep-orange text-xs font-semibold">
              Season 1
            </div>
          </Link>
        </div>

        {/* Mini-Games Section */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">⚡</span>
            <div>
              <h2 className="text-2xl font-display font-bold">Quick Games</h2>
              <p className="text-gray-400 text-sm">Instant play, instant rewards - no skill required!</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {miniGames.map((game) => (
              <Link
                key={game.id}
                href={`/games/mini/${game.id}`}
                className="group relative overflow-hidden rounded-2xl bg-dark-800/50 border border-dark-700 hover:border-grep-cyan/50 transition-all p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-grep-cyan to-grep-blue flex items-center justify-center text-2xl">
                    {game.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{game.name}</h3>
                    <span className="text-xs text-gray-400">{game.duration}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-3">{game.description}</p>
                <div className="flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-grep-yellow" />
                  <span className="text-xs font-bold text-grep-green">{game.rewards}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Staking Multipliers */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-grep-purple/10 to-grep-pink/10 border border-grep-purple/20">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🚀</span>
            <h3 className="text-xl font-display font-bold">Boost Your Earnings with Staking</h3>
          </div>
          <p className="text-gray-400 mb-8">
            Stake GREP tokens to unlock reward multipliers. The more you stake, the more you earn from every game!
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { tier: 'Flexible', icon: '🌱', color: '#10B981', multiplier: '1.1x', minStake: '100', bonus: '+2 plays' },
              { tier: 'Bronze', icon: '🥉', color: '#CD7F32', multiplier: '1.25x', minStake: '1K', bonus: '+5 plays' },
              { tier: 'Silver', icon: '🥈', color: '#C0C0C0', multiplier: '1.5x', minStake: '5K', bonus: '+10 plays' },
              { tier: 'Gold', icon: '🥇', color: '#FFD700', multiplier: '1.75x', minStake: '10K', bonus: '+15 plays' },
              { tier: 'Diamond', icon: '💎', color: '#B9F2FF', multiplier: '2.5x', minStake: '50K', bonus: '+25 plays' },
            ].map((tier) => (
              <div
                key={tier.tier}
                className="p-4 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-dark-500 transition-colors text-center"
              >
                <div className="text-3xl mb-2">{tier.icon}</div>
                <div className="font-bold mb-1" style={{ color: tier.color }}>{tier.tier}</div>
                <div className="text-2xl font-bold text-gradient mb-2">{tier.multiplier}</div>
                <div className="text-xs text-gray-400">
                  Min: {tier.minStake} GREP
                </div>
                <div className="text-xs text-grep-green mt-1">
                  {tier.bonus}/day
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/#staking"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink font-semibold hover:opacity-90 transition-opacity"
            >
              Start Staking
            </Link>
          </div>
        </div>

        {/* How Earning Works */}
        <div className="mt-16 p-8 rounded-3xl bg-dark-800/30 border border-dark-700">
          <h3 className="text-xl font-display font-bold mb-6">How Earning Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-grep-purple/20 flex items-center justify-center text-grep-purple font-bold">1</div>
              <div>
                <h4 className="font-semibold mb-1">Connect Wallet</h4>
                <p className="text-sm text-gray-400">Link your Web3 wallet to track earnings and claim rewards.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-grep-pink/20 flex items-center justify-center text-grep-pink font-bold">2</div>
              <div>
                <h4 className="font-semibold mb-1">Play & Score</h4>
                <p className="text-sm text-gray-400">Higher scores = more GREP. Beat thresholds to unlock bonuses.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-grep-cyan/20 flex items-center justify-center text-grep-cyan font-bold">3</div>
              <div>
                <h4 className="font-semibold mb-1">Claim Rewards</h4>
                <p className="text-sm text-gray-400">Earnings accumulate daily. Claim anytime to your wallet.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard and Staking Status */}
        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 rounded-3xl bg-dark-800/30 border border-dark-700">
            <Leaderboard />
          </div>
          <div className="space-y-6">
            <StakingBadge />
            <div className="p-6 rounded-2xl bg-dark-800/30 border border-dark-700">
              <h4 className="font-semibold mb-4">Daily Rewards Pool</h4>
              <div className="text-3xl font-bold text-gradient mb-2">50,000 GREP</div>
              <p className="text-sm text-gray-400">Distributed among all players based on scores and staking tiers.</p>
              <div className="mt-4 pt-4 border-t border-dark-600">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Pool Status</span>
                  <span className="text-grep-green">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Resets In</span>
                  <span className="font-mono">12:34:56</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

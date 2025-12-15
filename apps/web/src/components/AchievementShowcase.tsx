'use client'

import { useState } from 'react'
import { Trophy, Lock, Star, Zap, Flame, Target, Crown, Sparkles, Gift } from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  reward: number
  progress?: number
  total?: number
  unlocked: boolean
  unlockedBy?: number // percentage of players
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first game',
    icon: '🎮',
    rarity: 'common',
    reward: 10,
    unlocked: true,
    unlockedBy: 95,
  },
  {
    id: 'combo-starter',
    name: 'Combo Starter',
    description: 'Achieve a 5x combo streak',
    icon: '🔥',
    rarity: 'common',
    reward: 25,
    unlocked: true,
    unlockedBy: 72,
  },
  {
    id: 'pattern-pro',
    name: 'Pattern Pro',
    description: 'Match 50 regex patterns',
    icon: '🎯',
    rarity: 'uncommon',
    reward: 50,
    progress: 32,
    total: 50,
    unlocked: false,
    unlockedBy: 45,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Clear a level in under 30 seconds',
    icon: '⚡',
    rarity: 'uncommon',
    reward: 40,
    unlocked: true,
    unlockedBy: 38,
  },
  {
    id: 'stack-master',
    name: 'Stack Master',
    description: 'Return 100 functions in Stack Panic',
    icon: '📚',
    rarity: 'rare',
    reward: 75,
    progress: 67,
    total: 100,
    unlocked: false,
    unlockedBy: 22,
  },
  {
    id: 'quantum-mind',
    name: 'Quantum Mind',
    description: 'Complete all Quantum Grep levels',
    icon: '⚛️',
    rarity: 'rare',
    reward: 100,
    progress: 4,
    total: 6,
    unlocked: false,
    unlockedBy: 15,
  },
  {
    id: 'git-wizard',
    name: 'Git Wizard',
    description: 'Resolve 50 merge conflicts',
    icon: '🧙',
    rarity: 'epic',
    reward: 150,
    progress: 23,
    total: 50,
    unlocked: false,
    unlockedBy: 8,
  },
  {
    id: 'perfect-run',
    name: 'Perfect Run',
    description: 'Complete any game without losing a life',
    icon: '💎',
    rarity: 'epic',
    reward: 200,
    unlocked: false,
    unlockedBy: 5,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Achieve a 25x combo streak',
    icon: '🌟',
    rarity: 'legendary',
    reward: 300,
    unlocked: false,
    unlockedBy: 2,
  },
  {
    id: 'arcade-champion',
    name: 'Arcade Champion',
    description: 'Reach #1 on any game leaderboard',
    icon: '👑',
    rarity: 'legendary',
    reward: 500,
    unlocked: false,
    unlockedBy: 0.5,
  },
]

const RARITY_COLORS = {
  common: { bg: 'from-gray-500 to-gray-600', text: 'text-gray-400', border: 'border-gray-500' },
  uncommon: { bg: 'from-green-500 to-green-600', text: 'text-green-400', border: 'border-green-500' },
  rare: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-400', border: 'border-blue-500' },
  epic: { bg: 'from-purple-500 to-purple-600', text: 'text-purple-400', border: 'border-purple-500' },
  legendary: { bg: 'from-yellow-500 to-orange-500', text: 'text-yellow-400', border: 'border-yellow-500' },
}

export default function AchievementShowcase() {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [hoveredAchievement, setHoveredAchievement] = useState<string | null>(null)

  const filteredAchievements = ACHIEVEMENTS.filter(a => {
    if (filter === 'unlocked') return a.unlocked
    if (filter === 'locked') return !a.unlocked
    return true
  })

  const totalUnlocked = ACHIEVEMENTS.filter(a => a.unlocked).length
  const totalRewards = ACHIEVEMENTS.filter(a => a.unlocked).reduce((sum, a) => sum + a.reward, 0)

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/30 to-dark-900" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-grep-purple/20 to-grep-pink/20 border border-grep-purple/30 mb-6">
            <Trophy className="w-4 h-4 text-grep-purple" />
            <span className="text-sm font-medium text-grep-purple">Achievements</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            Unlock <span className="text-gradient">Greatness</span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Complete challenges, earn badges, and show off your gaming prowess
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">{totalUnlocked}/{ACHIEVEMENTS.length}</div>
              <div className="text-sm text-gray-400">Unlocked</div>
            </div>
            <div className="w-px h-12 bg-dark-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-grep-green">+{totalRewards}</div>
              <div className="text-sm text-gray-400">GREP Earned</div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="inline-flex rounded-xl bg-dark-800 p-1">
            {(['all', 'unlocked', 'locked'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-grep-purple to-grep-pink text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Achievement grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              onMouseEnter={() => setHoveredAchievement(achievement.id)}
              onMouseLeave={() => setHoveredAchievement(null)}
              className={`relative group p-4 rounded-2xl border transition-all cursor-pointer ${
                achievement.unlocked
                  ? `bg-dark-800/80 ${RARITY_COLORS[achievement.rarity].border} hover:scale-105`
                  : 'bg-dark-800/40 border-dark-700 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Rarity glow for unlocked */}
              {achievement.unlocked && (
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${RARITY_COLORS[achievement.rarity].bg} opacity-10 group-hover:opacity-20 transition-opacity`} />
              )}

              <div className="relative">
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-3xl ${
                  achievement.unlocked
                    ? `bg-gradient-to-r ${RARITY_COLORS[achievement.rarity].bg}`
                    : 'bg-dark-700'
                }`}>
                  {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-500" />}
                </div>

                {/* Name */}
                <h3 className="font-bold text-center mb-1">{achievement.name}</h3>

                {/* Rarity */}
                <div className={`text-xs text-center ${RARITY_COLORS[achievement.rarity].text} mb-2`}>
                  {achievement.rarity.toUpperCase()}
                </div>

                {/* Description */}
                <p className="text-xs text-gray-400 text-center mb-3">
                  {achievement.description}
                </p>

                {/* Progress bar for locked achievements with progress */}
                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.total}</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${RARITY_COLORS[achievement.rarity].bg} transition-all`}
                        style={{ width: `${(achievement.progress / (achievement.total || 1)) * 100}%` }}
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

                {/* Unlocked by percentage */}
                {hoveredAchievement === achievement.id && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-10 px-3 py-1.5 rounded-lg bg-dark-900 border border-dark-700 text-xs whitespace-nowrap">
                    <Star className="w-3 h-3 inline mr-1 text-grep-yellow" />
                    {achievement.unlockedBy}% of players unlocked
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legendary showcase */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border border-yellow-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-4xl animate-pulse">
                👑
              </div>
              <div>
                <div className="text-yellow-400 text-sm font-medium mb-1">LEGENDARY ACHIEVEMENT</div>
                <h3 className="text-2xl font-bold mb-1">Arcade Champion</h3>
                <p className="text-gray-400">Reach #1 on any game leaderboard</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-3xl font-bold text-grep-green mb-1">+500 GREP</div>
              <div className="text-sm text-gray-400">Only 0.5% have unlocked this</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

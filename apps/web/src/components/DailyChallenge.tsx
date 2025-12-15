'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Zap, Target, Gift, ArrowRight, Flame, Trophy } from 'lucide-react'

interface Challenge {
  id: string
  game: string
  gameIcon: string
  type: 'score' | 'streak' | 'speed' | 'perfect'
  target: number
  reward: number
  bonusMultiplier: number
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 'daily-1',
    game: 'Grep Rails',
    gameIcon: '🚂',
    type: 'score',
    target: 3000,
    reward: 100,
    bonusMultiplier: 2,
    description: 'Score 3,000 points in a single run',
    difficulty: 'medium',
  },
  {
    id: 'daily-2',
    game: 'Stack Panic',
    gameIcon: '📚',
    type: 'streak',
    target: 10,
    reward: 75,
    bonusMultiplier: 1.5,
    description: 'Achieve a 10x combo streak',
    difficulty: 'easy',
  },
  {
    id: 'daily-3',
    game: 'Quantum Grep',
    gameIcon: '⚛️',
    type: 'perfect',
    target: 3,
    reward: 150,
    bonusMultiplier: 3,
    description: 'Complete 3 levels with perfect matches',
    difficulty: 'hard',
  },
]

const DIFFICULTY_COLORS = {
  easy: 'from-green-500 to-green-600',
  medium: 'from-yellow-500 to-orange-500',
  hard: 'from-orange-500 to-red-500',
  legendary: 'from-purple-500 to-pink-500',
}

function TimeRemaining() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const diff = tomorrow.getTime() - now.getTime()

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-1 font-mono">
      <span className="bg-dark-700 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
      <span>:</span>
      <span className="bg-dark-700 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
      <span>:</span>
      <span className="bg-dark-700 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
    </div>
  )
}

export default function DailyChallenge() {
  const [selectedChallenge, setSelectedChallenge] = useState(0)
  const challenge = DAILY_CHALLENGES[selectedChallenge]

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-grep-orange/5 via-grep-yellow/5 to-grep-orange/5" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-grep-orange/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-grep-yellow/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-dark-800/80 backdrop-blur-xl rounded-3xl border border-dark-700 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-grep-orange to-grep-yellow p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-dark-900">Daily Challenges</h2>
                  <p className="text-dark-900/70">Complete challenges for bonus rewards!</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-dark-900">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Resets in:</span>
                <TimeRemaining />
              </div>
            </div>
          </div>

          {/* Challenges */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {DAILY_CHALLENGES.map((ch, index) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChallenge(index)}
                  className={`p-4 rounded-2xl border transition-all text-left ${
                    selectedChallenge === index
                      ? 'bg-dark-700/80 border-grep-orange scale-105 shadow-lg'
                      : 'bg-dark-800/50 border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{ch.gameIcon}</span>
                    <div>
                      <div className="font-bold">{ch.game}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${DIFFICULTY_COLORS[ch.difficulty]} text-white`}>
                        {ch.difficulty.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{ch.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-grep-green font-bold">
                      <Gift className="w-4 h-4" />
                      +{ch.reward} GREP
                    </div>
                    {ch.bonusMultiplier > 1 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-grep-purple/20 text-grep-purple">
                        {ch.bonusMultiplier}x BONUS
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected challenge detail */}
            <div className="bg-dark-700/50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-grep-orange to-grep-yellow flex items-center justify-center text-4xl">
                  {challenge.gameIcon}
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Today's Featured Challenge</div>
                  <h3 className="text-xl font-bold mb-1">{challenge.description}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-grep-green">
                      <Gift className="w-4 h-4" />
                      {challenge.reward} GREP
                    </span>
                    <span className="flex items-center gap-1 text-grep-purple">
                      <Zap className="w-4 h-4" />
                      {challenge.bonusMultiplier}x Multiplier
                    </span>
                    <span className="flex items-center gap-1 text-grep-cyan">
                      <Target className="w-4 h-4" />
                      {challenge.game}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/games/${challenge.game.toLowerCase().replace(' ', '-')}`}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-grep-orange to-grep-yellow text-dark-900 font-bold text-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
              >
                <Trophy className="w-5 h-5" />
                Accept Challenge
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { StatsChart } from '@/components/StatsChart'
import { GameStatsCard } from '@/components/GameStatsCard'

interface GameStats {
  gameSlug: string
  gameName: string
  totalPlays: number
  highScore: number
  avgScore: number
  totalGrep: number
  lastPlayed: string
  rank: number
  percentile: number
}

interface OverallStats {
  totalPlays: number
  totalGrep: number
  gamesPlayed: number
  currentStreak: number
  longestStreak: number
  averageScore: number
}

export default function StatsPage() {
  const { isConnected } = useAccount()
  const [gameStats, setGameStats] = useState<GameStats[]>([])
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected) {
      fetch('/api/stats/detailed')
        .then(res => res.json())
        .then(data => {
          setGameStats(data.games || [])
          setOverallStats(data.overall || null)
          setIsLoading(false)
        })
    }
  }, [isConnected])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Connect wallet to view your stats
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Statistics</h1>

        {/* Overall Stats */}
        {overallStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-emerald-400">{overallStats.totalPlays}</p>
              <p className="text-gray-400 text-sm">Total Plays</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{overallStats.totalGrep.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">GREP Earned</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{overallStats.gamesPlayed}</p>
              <p className="text-gray-400 text-sm">Games Played</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-400">{overallStats.currentStreak}</p>
              <p className="text-gray-400 text-sm">Current Streak</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-400">{overallStats.longestStreak}</p>
              <p className="text-gray-400 text-sm">Best Streak</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-pink-400">{Math.round(overallStats.averageScore)}</p>
              <p className="text-gray-400 text-sm">Avg Score</p>
            </div>
          </div>
        )}

        {/* Score History Chart */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Score History</h2>
          <StatsChart gameSlug={selectedGame} />
        </div>

        {/* Per-Game Stats */}
        <h2 className="text-xl font-bold mb-4">Per-Game Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gameStats.map(game => (
            <GameStatsCard
              key={game.gameSlug}
              {...game}
              isSelected={selectedGame === game.gameSlug}
              onClick={() => setSelectedGame(
                selectedGame === game.gameSlug ? null : game.gameSlug
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { Trophy, Medal, Crown, TrendingUp, Gamepad2 } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-400" />
    case 2:
      return <Medal className="w-5 h-5 text-gray-300" />
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-sm text-gray-500">#{rank}</span>
  }
}

function getRankStyle(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/30'
    case 2:
      return 'bg-gradient-to-r from-gray-400/20 to-transparent border-gray-400/30'
    case 3:
      return 'bg-gradient-to-r from-amber-600/20 to-transparent border-amber-600/30'
    default:
      return 'bg-dark-800/30 border-dark-700/30'
  }
}

interface LeaderboardProps {
  game?: 'all' | 'grep-rails' | 'stack-panic'
  limit?: number
  showTitle?: boolean
}

export default function Leaderboard({ game = 'all', limit = 10, showTitle = true }: LeaderboardProps) {
  const { leaderboard, isLoading } = useLeaderboard({ limit })

  // Filter by game if specified
  const filteredData = game === 'all'
    ? leaderboard
    : leaderboard.filter(entry => {
        // Match game slug pattern
        const gameSlug = game.replace('-', ' ').toLowerCase()
        return entry.walletAddress.toLowerCase().includes(gameSlug) // Placeholder - real implementation would filter by game
      })

  const displayData = filteredData.slice(0, limit)

  return (
    <div className="w-full">
      {showTitle && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-grep-orange to-grep-yellow flex items-center justify-center">
            <Trophy className="w-5 h-5 text-dark-900" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold">Leaderboard</h3>
            <p className="text-sm text-gray-400">Top GREP earners this week</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-dark-800/30 animate-pulse" />
          ))}
        </div>
      ) : displayData.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl bg-dark-800/30 border border-dark-700/30">
          <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No scores yet</p>
          <p className="text-gray-500 text-sm mt-1">Be the first to play and claim the top spot!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayData.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02] ${getRankStyle(entry.rank)}`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm truncate">
                  {entry.username || `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`}
                </div>
                <div className="text-xs text-gray-500">{entry.gamesPlayed} games played</div>
              </div>

              <div className="text-right">
                <div className="font-bold text-white">{entry.totalScore.toLocaleString()}</div>
                <div className="text-xs text-grep-green flex items-center gap-1 justify-end">
                  <TrendingUp className="w-3 h-3" />
                  +{entry.totalGrep.toLocaleString()} GREP
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Your Position (if not in top 10) */}
      <div className="mt-4 pt-4 border-t border-dark-700">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-grep-purple/10 border border-grep-purple/30">
          <div className="w-8 flex justify-center">
            <span className="text-sm text-gray-400">#--</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-mono text-sm text-gray-400">Connect wallet to see your rank</div>
          </div>

          <button className="px-4 py-2 rounded-lg bg-grep-purple/20 text-grep-purple text-sm font-medium hover:bg-grep-purple/30 transition-colors">
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}

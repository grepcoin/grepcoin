'use client'

import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  address: string
  score: number
  grepEarned: number
  game: string
}

// Mock data - would come from blockchain/API
const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, address: '0x1234...5678', score: 45230, grepEarned: 4523, game: 'Grep Rails' },
  { rank: 2, address: '0xabcd...efgh', score: 38450, grepEarned: 3845, game: 'Stack Panic' },
  { rank: 3, address: '0x9876...5432', score: 32100, grepEarned: 3210, game: 'Grep Rails' },
  { rank: 4, address: '0xdead...beef', score: 28750, grepEarned: 2875, game: 'Stack Panic' },
  { rank: 5, address: '0xcafe...babe', score: 25600, grepEarned: 2560, game: 'Grep Rails' },
  { rank: 6, address: '0xface...book', score: 22340, grepEarned: 2234, game: 'Stack Panic' },
  { rank: 7, address: '0xc0de...c0de', score: 19870, grepEarned: 1987, game: 'Grep Rails' },
  { rank: 8, address: '0xbeef...cafe', score: 17650, grepEarned: 1765, game: 'Grep Rails' },
  { rank: 9, address: '0x4242...4242', score: 15230, grepEarned: 1523, game: 'Stack Panic' },
  { rank: 10, address: '0x1337...h4x0', score: 13450, grepEarned: 1345, game: 'Grep Rails' },
]

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
  const filteredData = game === 'all'
    ? mockLeaderboard
    : mockLeaderboard.filter(e =>
        game === 'grep-rails' ? e.game === 'Grep Rails' : e.game === 'Stack Panic'
      )

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
              <div className="font-mono text-sm truncate">{entry.address}</div>
              <div className="text-xs text-gray-500">{entry.game}</div>
            </div>

            <div className="text-right">
              <div className="font-bold text-white">{entry.score.toLocaleString()}</div>
              <div className="text-xs text-grep-green flex items-center gap-1 justify-end">
                <TrendingUp className="w-3 h-3" />
                +{entry.grepEarned} GREP
              </div>
            </div>
          </div>
        ))}
      </div>

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

'use client'

interface Props {
  gameSlug: string
  gameName: string
  totalPlays: number
  highScore: number
  avgScore: number
  totalGrep: number
  rank: number
  percentile: number
  isSelected: boolean
  onClick: () => void
}

export function GameStatsCard({
  gameName, totalPlays, highScore, avgScore, totalGrep, rank, percentile, isSelected, onClick
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`text-left w-full bg-gray-800 rounded-lg p-4 border-2 transition-all ${
        isSelected ? 'border-emerald-500' : 'border-transparent hover:border-gray-600'
      }`}
    >
      <h3 className="font-bold text-lg mb-3">{gameName}</h3>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-400">Plays</p>
          <p className="font-bold">{totalPlays}</p>
        </div>
        <div>
          <p className="text-gray-400">High Score</p>
          <p className="font-bold text-emerald-400">{highScore.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Avg Score</p>
          <p className="font-bold">{Math.round(avgScore).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">GREP Earned</p>
          <p className="font-bold text-yellow-400">{totalGrep.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between">
        <span className="text-sm">
          Rank: <span className="text-emerald-400 font-bold">#{rank}</span>
        </span>
        <span className="text-sm text-gray-400">
          Top {percentile}%
        </span>
      </div>
    </button>
  )
}

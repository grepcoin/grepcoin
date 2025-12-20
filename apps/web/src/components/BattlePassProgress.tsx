'use client'

interface Props {
  level: number
  xp: number
  xpToNext: number
}

export function BattlePassProgress({ level, xp, xpToNext }: Props) {
  const progress = (xp / xpToNext) * 100

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-4xl font-bold text-emerald-400">{level}</span>
          <span className="text-gray-400 ml-2">Current Level</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{xp.toLocaleString()}</span>
          <span className="text-gray-400"> / {xpToNext.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <p className="text-gray-400 text-sm mt-2">
        {(xpToNext - xp).toLocaleString()} XP to next level
      </p>
    </div>
  )
}

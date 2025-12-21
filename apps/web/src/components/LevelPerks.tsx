'use client'
import { useLevel } from '@/hooks/useLevel'
import { LEVELS } from '@/lib/levels'

export function LevelPerks() {
  const { currentLevel } = useLevel()

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4">Level Rewards</h3>
      <div className="space-y-3">
        {LEVELS.map(level => {
          const unlocked = currentLevel.level >= level.level
          return (
            <div key={level.level} className={`p-3 rounded-lg ${unlocked ? 'bg-gray-700' : 'bg-gray-900 opacity-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`font-bold ${level.color}`}>Lv.{level.level} {level.title}</span>
                {unlocked && <span className="text-emerald-400">✓</span>}
              </div>
              <ul className="text-sm text-gray-400 mt-1">
                {level.perks.map(perk => <li key={perk}>• {perk}</li>)}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

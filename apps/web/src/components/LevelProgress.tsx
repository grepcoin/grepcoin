'use client'
import { useLevel } from '@/hooks/useLevel'
import { LevelBadge } from './LevelBadge'

export function LevelProgress() {
  const { xp, currentLevel, nextLevel, progress, isLoading } = useLevel()

  if (isLoading) return <div className="animate-pulse bg-gray-800 rounded-lg h-24" />

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <LevelBadge level={currentLevel} />
        <span className="text-sm text-gray-400">{xp.toLocaleString()} XP</span>
      </div>
      <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
        <div className={`h-full bg-gradient-to-r from-emerald-500 to-blue-500`} style={{ width: `${progress}%` }} />
      </div>
      {nextLevel && (
        <p className="text-xs text-gray-400 mt-2">
          {nextLevel.xpRequired - xp} XP to {nextLevel.title}
        </p>
      )}
    </div>
  )
}

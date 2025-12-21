'use client'
import { Quest, QuestStatus } from '@/lib/quests'

interface Props {
  quest: Quest & { progress: number; status: QuestStatus }
  onClaim: () => void
}

export function QuestCard({ quest, onClaim }: Props) {
  const percent = Math.min(100, (quest.progress / quest.target) * 100)
  const canClaim = quest.status === 'completed' || quest.progress >= quest.target

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{quest.icon}</span>
        <div className="flex-1">
          <p className="font-bold">{quest.name}</p>
          <p className="text-sm text-gray-400">{quest.description}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-emerald-400">+{quest.reward.grep} GREP</p>
          <p className="text-blue-400">+{quest.reward.xp} XP</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
          <div className={`h-full ${quest.status === 'claimed' ? 'bg-gray-500' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} />
        </div>
        <span className="text-sm text-gray-400">{quest.progress}/{quest.target}</span>
        {quest.status === 'claimed' ? (
          <span className="text-gray-500 text-sm">Claimed ✓</span>
        ) : canClaim ? (
          <button onClick={onClaim} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded text-sm">Claim</button>
        ) : null}
      </div>
    </div>
  )
}

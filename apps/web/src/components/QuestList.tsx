'use client'
import { useQuests } from '@/hooks/useQuests'
import { QuestCard } from './QuestCard'

export function QuestList() {
  const { dailyQuests, weeklyQuests, isLoading, claimReward } = useQuests()

  if (isLoading) return <div className="animate-pulse bg-gray-800 rounded-lg h-64" />

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-3">📅 Daily Quests</h3>
        <div className="space-y-3">
          {dailyQuests.map(q => <QuestCard key={q.id} quest={q} onClaim={() => claimReward(q.id)} />)}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-3">📆 Weekly Quests</h3>
        <div className="space-y-3">
          {weeklyQuests.map(q => <QuestCard key={q.id} quest={q} onClaim={() => claimReward(q.id)} />)}
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'
import { Quest, UserQuest, DAILY_QUESTS, WEEKLY_QUESTS } from '@/lib/quests'

export function useQuests() {
  const [userQuests, setUserQuests] = useState<UserQuest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/quests')
      .then(res => res.json())
      .then(data => { setUserQuests(data.quests || []); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [])

  const allQuests = [...DAILY_QUESTS, ...WEEKLY_QUESTS]
  const quests = allQuests.map(q => ({
    ...q,
    progress: userQuests.find(uq => uq.questId === q.id)?.progress || 0,
    status: userQuests.find(uq => uq.questId === q.id)?.status || 'active',
  }))

  const claimReward = useCallback(async (questId: string) => {
    const res = await fetch('/api/quests/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questId }),
    })
    const data = await res.json()
    if (data.success) {
      setUserQuests(prev => prev.map(q => q.questId === questId ? { ...q, status: 'claimed' } : q))
    }
    return data
  }, [])

  const dailyQuests = quests.filter(q => q.type === 'daily')
  const weeklyQuests = quests.filter(q => q.type === 'weekly')

  return { dailyQuests, weeklyQuests, isLoading, claimReward }
}

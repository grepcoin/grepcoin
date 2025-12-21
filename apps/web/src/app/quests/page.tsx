'use client'

import { useState, useEffect } from 'react'
import { ScrollText, Clock, CheckCircle, Gift, Coins, Sparkles } from 'lucide-react'
import { useAccount } from 'wagmi'
import { DAILY_QUESTS, WEEKLY_QUESTS, type Quest, type UserQuest } from '@/lib/quests'

type QuestTab = 'daily' | 'weekly'

function QuestCard({
  quest,
  userQuest,
  onClaim
}: {
  quest: Quest
  userQuest?: UserQuest
  onClaim: (questId: string) => void
}) {
  const progress = userQuest?.progress || 0
  const progressPercent = Math.min((progress / quest.target) * 100, 100)
  const isCompleted = progress >= quest.target
  const isClaimed = userQuest?.status === 'claimed'

  return (
    <div className={`bg-dark-800 rounded-xl border p-5 transition-colors ${
      isClaimed
        ? 'border-green-500/30 bg-green-500/5'
        : isCompleted
          ? 'border-yellow-500/30 bg-yellow-500/5'
          : 'border-dark-600 hover:border-dark-500'
    }`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center text-2xl flex-shrink-0">
          {quest.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white">{quest.name}</h3>
            {isClaimed && (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
          </div>
          <p className="text-gray-400 text-sm mb-3">{quest.description}</p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{progress.toLocaleString()} / {quest.target.toLocaleString()}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isClaimed ? 'bg-green-500' : isCompleted ? 'bg-yellow-500' : 'bg-grep-purple'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Rewards */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-sm">
              <Coins className="w-4 h-4 text-grep-orange" />
              <span className="text-grep-orange font-medium">{quest.reward.grep} GREP</span>
            </span>
            <span className="flex items-center gap-1 text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-medium">{quest.reward.xp} XP</span>
            </span>
          </div>
        </div>

        {/* Claim Button */}
        <div className="flex-shrink-0">
          {isClaimed ? (
            <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
              Claimed
            </span>
          ) : isCompleted ? (
            <button
              onClick={() => onClaim(quest.id)}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-dark-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <Gift className="w-4 h-4" />
              Claim
            </button>
          ) : (
            <span className="px-4 py-2 bg-dark-700 text-gray-400 rounded-lg text-sm font-medium">
              In Progress
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function QuestsPage() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<QuestTab>('daily')
  const [userQuests, setUserQuests] = useState<Record<string, UserQuest>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQuests = async () => {
      if (!isConnected) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch('/api/quests')
        if (res.ok) {
          const data = await res.json()
          const questMap: Record<string, UserQuest> = {}
          data.quests?.forEach((q: UserQuest) => {
            questMap[q.questId] = q
          })
          setUserQuests(questMap)
        }
      } catch (error) {
        console.error('Failed to fetch quests:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuests()
  }, [isConnected])

  const handleClaim = async (questId: string) => {
    try {
      const res = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      })

      if (res.ok) {
        setUserQuests(prev => ({
          ...prev,
          [questId]: { ...prev[questId], status: 'claimed' },
        }))
      }
    } catch (error) {
      console.error('Failed to claim quest:', error)
    }
  }

  const quests = activeTab === 'daily' ? DAILY_QUESTS : WEEKLY_QUESTS

  const completedCount = quests.filter(q => {
    const uq = userQuests[q.id]
    return uq && (uq.progress >= q.target || uq.status === 'claimed')
  }).length

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-grep-orange" />
            Quests
          </h1>
          <p className="text-gray-400 mt-1">Complete quests to earn GREP and XP rewards</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-4 rounded-lg font-medium transition-colors ${
              activeTab === 'daily'
                ? 'bg-gradient-to-r from-grep-orange to-yellow-500 text-dark-900'
                : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <Clock className="w-5 h-5 inline mr-2" />
            Daily Quests
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-4 rounded-lg font-medium transition-colors ${
              activeTab === 'weekly'
                ? 'bg-gradient-to-r from-grep-purple to-grep-pink text-white'
                : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <ScrollText className="w-5 h-5 inline mr-2" />
            Weekly Quests
          </button>
        </div>

        {/* Progress Summary */}
        <div className="mb-6 p-4 bg-dark-800 rounded-lg border border-dark-600">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">
              {activeTab === 'daily' ? 'Daily' : 'Weekly'} Progress
            </span>
            <span className="text-white font-bold">
              {completedCount} / {quests.length} completed
            </span>
          </div>
          <div className="mt-2 h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                activeTab === 'daily' ? 'bg-grep-orange' : 'bg-grep-purple'
              }`}
              style={{ width: `${(completedCount / quests.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Not Connected State */}
        {!isConnected && (
          <div className="text-center py-20 text-gray-400">
            Connect your wallet to track quest progress
          </div>
        )}

        {/* Loading State */}
        {isConnected && isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-grep-orange border-t-transparent rounded-full" />
          </div>
        )}

        {/* Quests List */}
        {isConnected && !isLoading && (
          <div className="space-y-4">
            {quests.map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                userQuest={userQuests[quest.id]}
                onClaim={handleClaim}
              />
            ))}
          </div>
        )}

        {/* Rewards Info */}
        <div className="mt-8 p-6 bg-dark-800 rounded-xl border border-dark-600">
          <h2 className="text-lg font-semibold text-white mb-4">Quest Rewards</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-dark-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-grep-orange">
                {DAILY_QUESTS.reduce((sum, q) => sum + q.reward.grep, 0)}
              </p>
              <p className="text-gray-400 text-sm">Daily GREP</p>
            </div>
            <div className="p-4 bg-dark-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-400">
                {DAILY_QUESTS.reduce((sum, q) => sum + q.reward.xp, 0)}
              </p>
              <p className="text-gray-400 text-sm">Daily XP</p>
            </div>
            <div className="p-4 bg-dark-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-grep-orange">
                {WEEKLY_QUESTS.reduce((sum, q) => sum + q.reward.grep, 0)}
              </p>
              <p className="text-gray-400 text-sm">Weekly GREP</p>
            </div>
            <div className="p-4 bg-dark-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-400">
                {WEEKLY_QUESTS.reduce((sum, q) => sum + q.reward.xp, 0)}
              </p>
              <p className="text-gray-400 text-sm">Weekly XP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

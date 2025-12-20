'use client'

import { useState, useEffect } from 'react'

interface DailyReward {
  day: number
  reward: number
  claimed: boolean
  available: boolean
}

export function DailyRewards() {
  const [rewards, setRewards] = useState<DailyReward[]>([])
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/rewards/daily')
      const data = await res.json()
      setRewards(data.rewards || generateDefaultRewards(data.streak, data.claimedToday))
      setStreak(data.streak || 0)
    } catch (e) {
      setRewards(generateDefaultRewards(0, false))
    } finally {
      setIsLoading(false)
    }
  }

  const generateDefaultRewards = (currentStreak: number, claimedToday: boolean): DailyReward[] => {
    const baseRewards = [10, 20, 30, 50, 75, 100, 200]
    return baseRewards.map((reward, i) => ({
      day: i + 1,
      reward,
      claimed: i < currentStreak || (i === currentStreak && claimedToday),
      available: i === currentStreak && !claimedToday
    }))
  }

  const claimReward = async () => {
    setClaiming(true)
    try {
      const res = await fetch('/api/rewards/daily', { method: 'POST' })
      if (res.ok) {
        await fetchRewards()
      }
    } finally {
      setClaiming(false)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-48" />
  }

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Daily Rewards</h3>
        <div className="flex items-center gap-2">
          <span className="text-orange-400">🔥</span>
          <span className="font-bold">{streak} Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {rewards.map((reward) => (
          <div
            key={reward.day}
            className={`relative p-3 rounded-lg text-center ${
              reward.claimed
                ? 'bg-emerald-900/50 border-2 border-emerald-500'
                : reward.available
                ? 'bg-yellow-900/50 border-2 border-yellow-500 animate-pulse'
                : 'bg-gray-700/50 border-2 border-gray-600'
            }`}
          >
            <p className="text-xs text-gray-400 mb-1">Day {reward.day}</p>
            <p className="text-lg font-bold">
              {reward.claimed ? '✓' : `${reward.reward}`}
            </p>
            <p className="text-xs text-emerald-400">{reward.claimed ? '' : 'GREP'}</p>

            {reward.available && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-500 rounded-full animate-ping" />
            )}
          </div>
        ))}
      </div>

      {rewards.some(r => r.available) && (
        <button
          onClick={claimReward}
          disabled={claiming}
          className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 rounded-lg font-bold disabled:opacity-50"
        >
          {claiming ? 'Claiming...' : 'Claim Today\'s Reward'}
        </button>
      )}
    </div>
  )
}

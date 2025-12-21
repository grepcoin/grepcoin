'use client'

import { useState } from 'react'
import { useBadges } from '@/hooks/useBadges'
import { BadgeCard } from './BadgeCard'
import { BadgeCategory, BADGES } from '@/lib/badges'

interface Props {
  userId: string
}

const CATEGORIES: { value: BadgeCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'gameplay', label: 'Gameplay' },
  { value: 'social', label: 'Social' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'special', label: 'Special' },
  { value: 'seasonal', label: 'Seasonal' },
]

export function BadgeCollection({ userId }: Props) {
  const { earnedBadges, unearnedBadges, isLoading, toggleDisplay } = useBadges(userId)
  const [category, setCategory] = useState<BadgeCategory | 'all'>('all')
  const [showEarned, setShowEarned] = useState(true)

  const filteredEarned = category === 'all'
    ? earnedBadges
    : earnedBadges.filter(b => b.category === category)

  const filteredUnearned = category === 'all'
    ? unearnedBadges
    : unearnedBadges.filter(b => b.category === category)

  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-64" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1 rounded-lg text-sm ${
                category === cat.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEarned(true)}
            className={`px-3 py-1 rounded-lg text-sm ${showEarned ? 'bg-emerald-600' : 'bg-gray-800'}`}
          >
            Earned ({earnedBadges.length})
          </button>
          <button
            onClick={() => setShowEarned(false)}
            className={`px-3 py-1 rounded-lg text-sm ${!showEarned ? 'bg-gray-600' : 'bg-gray-800'}`}
          >
            Locked ({unearnedBadges.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {showEarned ? (
          filteredEarned.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned
              size="md"
              onToggleDisplay={() => toggleDisplay(badge.id)}
            />
          ))
        ) : (
          filteredUnearned.map(badge => (
            <BadgeCard key={badge.id} badge={badge} earned={false} size="md" />
          ))
        )}
      </div>

      {((showEarned && filteredEarned.length === 0) || (!showEarned && filteredUnearned.length === 0)) && (
        <p className="text-center text-gray-400 py-8">
          No badges in this category
        </p>
      )}
    </div>
  )
}

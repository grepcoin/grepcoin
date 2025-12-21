'use client'

import { BadgeCard } from './BadgeCard'
import { Badge } from '@/lib/badges'

interface Props {
  badges: (Badge & { earnedAt?: Date })[]
  maxDisplay?: number
}

export function BadgeShowcase({ badges, maxDisplay = 5 }: Props) {
  const displayBadges = badges.slice(0, maxDisplay)

  if (displayBadges.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        No badges to display
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {displayBadges.map(badge => (
        <BadgeCard key={badge.id} badge={badge} size="sm" />
      ))}
      {badges.length > maxDisplay && (
        <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center text-gray-400">
          +{badges.length - maxDisplay}
        </div>
      )}
    </div>
  )
}

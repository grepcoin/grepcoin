'use client'

import { Badge, RARITY_COLORS } from '@/lib/badges'

interface Props {
  badge: Badge & { earnedAt?: Date; displayed?: boolean }
  earned?: boolean
  onToggleDisplay?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function BadgeCard({ badge, earned = true, onToggleDisplay, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl',
  }

  return (
    <div className={`relative group ${!earned ? 'opacity-50 grayscale' : ''}`}>
      <div
        className={`${sizeClasses[size]} ${RARITY_COLORS[badge.rarity]} rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}
      >
        <span>{badge.icon}</span>
      </div>

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-gray-900 rounded-lg p-3 shadow-xl min-w-[200px]">
          <p className="font-bold">{badge.name}</p>
          <p className="text-sm text-gray-400">{badge.description}</p>
          <p className={`text-xs mt-1 capitalize ${RARITY_COLORS[badge.rarity].replace('bg-', 'text-')}`}>
            {badge.rarity}
          </p>
          {earned && badge.earnedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Earned: {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {earned && onToggleDisplay && (
        <button
          onClick={onToggleDisplay}
          className={`absolute -top-1 -right-1 w-6 h-6 rounded-full text-xs flex items-center justify-center ${
            badge.displayed ? 'bg-emerald-500' : 'bg-gray-600'
          }`}
        >
          {badge.displayed ? '✓' : '+'}
        </button>
      )}
    </div>
  )
}

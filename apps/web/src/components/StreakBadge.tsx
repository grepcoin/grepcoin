'use client'

interface Props {
  streak: number
  size?: 'sm' | 'md' | 'lg'
}

export function StreakBadge({ streak, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2'
  }

  const getStreakColor = () => {
    if (streak >= 30) return 'from-purple-500 to-pink-500'
    if (streak >= 14) return 'from-yellow-500 to-orange-500'
    if (streak >= 7) return 'from-emerald-500 to-teal-500'
    return 'from-gray-500 to-gray-600'
  }

  const getStreakEmoji = () => {
    if (streak >= 30) return '💎'
    if (streak >= 14) return '🔥'
    if (streak >= 7) return '⚡'
    return '✨'
  }

  return (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r ${getStreakColor()} rounded-full ${sizeClasses[size]}`}>
      <span>{getStreakEmoji()}</span>
      <span className="font-bold">{streak}</span>
      <span className="opacity-75">day{streak !== 1 ? 's' : ''}</span>
    </div>
  )
}

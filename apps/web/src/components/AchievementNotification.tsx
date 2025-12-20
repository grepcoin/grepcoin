'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trophy, X, Gift } from 'lucide-react'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  reward: number
}

interface AchievementNotificationProps {
  achievement: Achievement | null
  onClose: () => void
}

const RARITY_COLORS = {
  common: { bg: 'from-gray-500 to-gray-600', glow: 'shadow-gray-500/50' },
  uncommon: { bg: 'from-green-500 to-green-600', glow: 'shadow-green-500/50' },
  rare: { bg: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/50' },
  epic: { bg: 'from-purple-500 to-purple-600', glow: 'shadow-purple-500/50' },
  legendary: { bg: 'from-yellow-500 to-orange-500', glow: 'shadow-yellow-500/50' },
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      setIsLeaving(false)

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [achievement])

  const handleClose = useCallback(() => {
    setIsLeaving(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }, [onClose])

  if (!achievement || !isVisible) return null

  const colors = RARITY_COLORS[achievement.rarity]

  return (
    <div className="fixed top-20 right-4 z-50">
      <div
        className={`
          relative overflow-hidden rounded-2xl bg-dark-800 border-2
          ${isLeaving ? 'animate-slide-out-right' : 'animate-slide-in-right'}
          ${achievement.rarity === 'legendary' ? 'border-yellow-500' :
            achievement.rarity === 'epic' ? 'border-purple-500' :
            achievement.rarity === 'rare' ? 'border-blue-500' :
            achievement.rarity === 'uncommon' ? 'border-green-500' : 'border-gray-500'}
          shadow-2xl ${colors.glow}
        `}
      >
        {/* Animated background glow */}
        <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} opacity-10 animate-pulse`} />

        {/* Particle effects for legendary */}
        {achievement.rarity === 'legendary' && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative p-4 flex items-start gap-4">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${colors.bg} flex items-center justify-center text-3xl animate-bounce-once`}>
            {achievement.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-grep-yellow" />
              <span className="text-xs font-semibold text-grep-yellow uppercase tracking-wider">
                Achievement Unlocked!
              </span>
            </div>
            <h3 className="text-lg font-bold text-white truncate">{achievement.name}</h3>
            <p className="text-sm text-gray-400 truncate">{achievement.description}</p>
            <div className="flex items-center gap-1 mt-2 text-grep-green font-semibold">
              <Gift className="w-4 h-4" />
              <span>+{achievement.reward} GREP</span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar for auto-close */}
        <div className="h-1 bg-dark-700">
          <div
            className={`h-full bg-gradient-to-r ${colors.bg} animate-shrink-width`}
            style={{ animationDuration: '5s' }}
          />
        </div>
      </div>
    </div>
  )
}

// Hook to manage achievement notifications
export function useAchievementNotifications() {
  const [queue, setQueue] = useState<Achievement[]>([])
  const [current, setCurrent] = useState<Achievement | null>(null)

  const showAchievement = useCallback((achievement: Achievement) => {
    setQueue(prev => [...prev, achievement])
  }, [])

  const showMultipleAchievements = useCallback((achievements: Achievement[]) => {
    setQueue(prev => [...prev, ...achievements])
  }, [])

  const handleClose = useCallback(() => {
    setCurrent(null)
  }, [])

  // Process queue
  useEffect(() => {
    if (!current && queue.length > 0) {
      const [next, ...rest] = queue
      setCurrent(next)
      setQueue(rest)
    }
  }, [current, queue])

  return {
    currentAchievement: current,
    showAchievement,
    showMultipleAchievements,
    handleClose,
    hasQueuedAchievements: queue.length > 0,
  }
}

// Add these animations to your global CSS or tailwind config
// @keyframes slide-in-right {
//   from { transform: translateX(100%); opacity: 0; }
//   to { transform: translateX(0); opacity: 1; }
// }
// @keyframes slide-out-right {
//   from { transform: translateX(0); opacity: 1; }
//   to { transform: translateX(100%); opacity: 0; }
// }
// @keyframes shrink-width {
//   from { width: 100%; }
//   to { width: 0%; }
// }
// @keyframes bounce-once {
//   0%, 100% { transform: scale(1); }
//   50% { transform: scale(1.1); }
// }
// @keyframes float {
//   0%, 100% { transform: translateY(100%); opacity: 0; }
//   50% { opacity: 1; }
//   100% { transform: translateY(-100%); opacity: 0; }
// }

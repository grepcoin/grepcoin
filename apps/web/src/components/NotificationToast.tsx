'use client'

import { useEffect, useState } from 'react'

interface Props {
  id: string
  type: 'success' | 'error' | 'info' | 'achievement' | 'reward'
  title: string
  message?: string
  duration?: number
  onClose: () => void
}

export function NotificationToast({ type, title, message, duration = 5000, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setProgress(prev => Math.max(0, prev - (100 / (duration / 100))))
    }, 100)

    return () => clearInterval(interval)
  }, [duration])

  const getStyles = () => {
    switch (type) {
      case 'success':
        return { bg: 'bg-emerald-900/90', border: 'border-emerald-500', icon: '✓' }
      case 'error':
        return { bg: 'bg-red-900/90', border: 'border-red-500', icon: '✕' }
      case 'achievement':
        return { bg: 'bg-purple-900/90', border: 'border-purple-500', icon: '🏆' }
      case 'reward':
        return { bg: 'bg-yellow-900/90', border: 'border-yellow-500', icon: '🎁' }
      default:
        return { bg: 'bg-gray-800/90', border: 'border-gray-500', icon: 'ℹ' }
    }
  }

  const styles = getStyles()

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} border-l-4
        p-4 rounded-lg shadow-lg min-w-[300px] max-w-[400px]
        transform transition-all duration-300 backdrop-blur-sm
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{styles.icon}</span>
        <div className="flex-1">
          <h4 className="font-bold text-white">{title}</h4>
          {message && <p className="text-gray-300 text-sm">{message}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="mt-2 h-1 bg-gray-700 rounded overflow-hidden">
        <div
          className={`h-full ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'} transition-all duration-100`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

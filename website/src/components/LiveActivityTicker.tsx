'use client'

import { useState, useEffect } from 'react'
import { useActivity } from '@/hooks/useActivity'

interface DisplayActivity {
  id: string
  player: string
  message: string
  icon: string
}

// Mock data generators for when API has no real data
const GAMES = ['Grep Rails', 'Stack Panic', 'Merge Miners', 'Quantum Grep']
const PLAYERS = [
  'regex_master.eth', 'stack_wizard', '0xGamer', 'quantum_pro.eth',
  'git_ninja', 'code_runner', 'pixel_hero.eth', 'chain_player',
]

function generateMockActivity(id: number): DisplayActivity {
  const types = [
    () => {
      const score = Math.floor(Math.random() * 5000) + 500
      const game = GAMES[Math.floor(Math.random() * GAMES.length)]
      return { message: `scored ${score.toLocaleString()} in ${game}`, icon: '🎯' }
    },
    () => {
      const achievements = ['Speed Demon', 'Perfect Run', 'Combo Master', 'Pattern Pro']
      return { message: `unlocked ${achievements[Math.floor(Math.random() * achievements.length)]}`, icon: '🏆' }
    },
    () => {
      const reward = Math.floor(Math.random() * 100) + 10
      return { message: `earned ${reward} GREP`, icon: '💰' }
    },
    () => {
      const streak = Math.floor(Math.random() * 15) + 3
      const game = GAMES[Math.floor(Math.random() * GAMES.length)]
      return { message: `hit ${streak}x combo in ${game}`, icon: '🔥' }
    },
  ]

  const player = PLAYERS[Math.floor(Math.random() * PLAYERS.length)]
  const { message, icon } = types[Math.floor(Math.random() * types.length)]()

  return { id: String(id), player, message, icon }
}

export default function LiveActivityTicker() {
  const { activities: apiActivities } = useActivity(20)
  const [displayActivities, setDisplayActivities] = useState<DisplayActivity[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Use API data if available, otherwise generate mock
    if (apiActivities.length > 0) {
      setDisplayActivities(
        apiActivities.map((a) => ({
          id: a.id,
          player: a.username || `${a.wallet.slice(0, 6)}...${a.wallet.slice(-4)}`,
          message: a.message,
          icon: a.icon,
        }))
      )
    } else {
      // Generate mock activities for demo
      const initial = Array.from({ length: 20 }, (_, i) => generateMockActivity(i))
      setDisplayActivities(initial)

      // Add new mock activity every 3 seconds
      const interval = setInterval(() => {
        setDisplayActivities((prev) => {
          const newActivity = generateMockActivity(Date.now())
          return [newActivity, ...prev.slice(0, 19)]
        })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [apiActivities])

  if (!isClient) return null

  return (
    <div className="w-full overflow-hidden bg-dark-800/50 border-y border-dark-700 py-3">
      <div className="flex animate-scroll-left">
        {/* Double the items for seamless loop */}
        {[...displayActivities, ...displayActivities].map((activity, index) => (
          <div
            key={`${activity.id}-${index}`}
            className="flex items-center gap-2 px-6 whitespace-nowrap"
          >
            <span className="text-lg">{activity.icon}</span>
            <span className="font-semibold text-white">{activity.player}</span>
            <span className="text-gray-400">{activity.message}</span>
            <span className="w-1 h-1 rounded-full bg-dark-600 mx-2" />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 60s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

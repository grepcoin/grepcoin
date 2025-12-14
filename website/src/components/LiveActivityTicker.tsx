'use client'

import { useState, useEffect } from 'react'
import { Gamepad2, Trophy, Coins, Zap, Star } from 'lucide-react'

interface Activity {
  id: number
  type: 'score' | 'achievement' | 'reward' | 'streak' | 'levelup'
  player: string
  game?: string
  value?: number
  message: string
  icon: string
  color: string
}

const GAMES = ['Grep Rails', 'Stack Panic', 'Merge Miners', 'Quantum Grep']
const PLAYERS = [
  'regex_master.eth', 'stack_wizard', '0xGamer', 'quantum_pro.eth',
  'git_ninja', 'code_runner', 'pixel_hero.eth', 'chain_player',
  'defi_gamer', 'nft_collector.eth', 'crypto_arcade', 'web3_player'
]

const ACHIEVEMENTS = [
  { name: 'Speed Demon', icon: '🚀' },
  { name: 'Perfect Run', icon: '💎' },
  { name: 'Combo Master', icon: '🔥' },
  { name: 'Pattern Pro', icon: '🧩' },
  { name: 'Stack Legend', icon: '📚' },
  { name: 'Git Wizard', icon: '⚡' },
]

function generateActivity(id: number): Activity {
  const type = ['score', 'achievement', 'reward', 'streak', 'levelup'][Math.floor(Math.random() * 5)] as Activity['type']
  const player = PLAYERS[Math.floor(Math.random() * PLAYERS.length)]
  const game = GAMES[Math.floor(Math.random() * GAMES.length)]

  switch (type) {
    case 'score':
      const score = Math.floor(Math.random() * 5000) + 500
      return {
        id,
        type,
        player,
        game,
        value: score,
        message: `scored ${score.toLocaleString()} in ${game}`,
        icon: '🎯',
        color: 'text-grep-purple',
      }
    case 'achievement':
      const achievement = ACHIEVEMENTS[Math.floor(Math.random() * ACHIEVEMENTS.length)]
      return {
        id,
        type,
        player,
        message: `unlocked ${achievement.name}`,
        icon: achievement.icon,
        color: 'text-grep-yellow',
      }
    case 'reward':
      const reward = Math.floor(Math.random() * 100) + 10
      return {
        id,
        type,
        player,
        value: reward,
        message: `earned ${reward} GREP`,
        icon: '💰',
        color: 'text-grep-green',
      }
    case 'streak':
      const streak = Math.floor(Math.random() * 15) + 3
      return {
        id,
        type,
        player,
        game,
        value: streak,
        message: `hit ${streak}x combo in ${game}`,
        icon: '🔥',
        color: 'text-grep-orange',
      }
    case 'levelup':
      const level = Math.floor(Math.random() * 20) + 1
      return {
        id,
        type,
        player,
        value: level,
        message: `reached Level ${level}`,
        icon: '⬆️',
        color: 'text-grep-cyan',
      }
  }
}

export default function LiveActivityTicker() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Generate initial activities
    const initial = Array.from({ length: 20 }, (_, i) => generateActivity(i))
    setActivities(initial)

    // Add new activity every 3 seconds
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity = generateActivity(Date.now())
        return [newActivity, ...prev.slice(0, 19)]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  if (!isClient) return null

  return (
    <div className="w-full overflow-hidden bg-dark-800/50 border-y border-dark-700 py-3">
      <div className="flex animate-scroll-left">
        {/* Double the items for seamless loop */}
        {[...activities, ...activities].map((activity, index) => (
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

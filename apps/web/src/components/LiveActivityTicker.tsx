'use client'

import { useState, useEffect } from 'react'
import { useActivity } from '@/hooks/useActivity'
import { Gamepad2 } from 'lucide-react'

interface DisplayActivity {
  id: string
  player: string
  message: string
  icon: string
}

export default function LiveActivityTicker() {
  const { activities: apiActivities, isLoading } = useActivity(20)
  const [displayActivities, setDisplayActivities] = useState<DisplayActivity[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Only use real API data - no mock generation
    if (apiActivities.length > 0) {
      setDisplayActivities(
        apiActivities.map((a) => ({
          id: a.id,
          player: a.username || (a.wallet ? `${a.wallet.slice(0, 6)}...${a.wallet.slice(-4)}` : 'Anonymous'),
          message: a.message,
          icon: a.icon,
        }))
      )
    } else {
      setDisplayActivities([])
    }
  }, [apiActivities])

  if (!isClient) return null

  // Show nothing or a subtle message when there's no activity
  if (!isLoading && displayActivities.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-dark-800/50 border-y border-dark-700 py-3">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Gamepad2 className="w-4 h-4" />
          <span className="text-sm">Be the first to play today and start the activity feed!</span>
        </div>
      </div>
    )
  }

  if (displayActivities.length === 0) {
    return null
  }

  return (
    <div className="w-full overflow-hidden bg-dark-800/50 border-y border-dark-700 py-3">
      <div className="inline-flex animate-scroll-left" style={{ width: 'max-content' }}>
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

    </div>
  )
}

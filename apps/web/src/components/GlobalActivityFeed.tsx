'use client'

import { useActivityFeed } from '@/hooks/useActivityFeed'
import { Activity, ACTIVITY_CONFIG, formatActivityMessage, getRelativeTime } from '@/lib/activity'

export function GlobalActivityFeed() {
  const { activities, isLoading, loadMore, hasMore } = useActivityFeed({ limit: 30 })

  if (isLoading && activities.length === 0) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-96" />
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">🌍 Global Activity</h2>
        <p className="text-sm text-gray-400">See what everyone is doing</p>
      </div>

      <div className="divide-y divide-gray-700 max-h-[600px] overflow-y-auto">
        {activities.map(activity => {
          const config = ACTIVITY_CONFIG[activity.type]
          return (
            <div key={activity.id} className="px-6 py-4 hover:bg-gray-700/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="text-emerald-400 font-medium">
                      {(activity.data.userName as string) || 'Anonymous'}
                    </span>{' '}
                    <span className={config.color}>{formatActivityMessage(activity)}</span>
                  </p>
                  <p className="text-xs text-gray-500">{getRelativeTime(activity.createdAt)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          className="w-full py-3 border-t border-gray-700 hover:bg-gray-700/50 text-sm"
        >
          Load More
        </button>
      )}
    </div>
  )
}

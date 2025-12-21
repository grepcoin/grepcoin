'use client'

import { useState } from 'react'
import { useActivityFeed } from '@/hooks/useActivityFeed'
import { ActivityItem } from './ActivityItem'
import { ActivityType, ACTIVITY_CONFIG } from '@/lib/activity'

interface Props {
  userId?: string
  showFilters?: boolean
}

export function ActivityFeed({ userId, showFilters = true }: Props) {
  const [filter, setFilter] = useState<ActivityType[]>([])
  const { activities, isLoading, hasMore, loadMore, refresh } = useActivityFeed({
    userId,
    filter: filter.length > 0 ? filter : undefined,
  })

  const toggleFilter = (type: ActivityType) => {
    setFilter(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={refresh}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            🔄 Refresh
          </button>
          {Object.entries(ACTIVITY_CONFIG).map(([type, config]) => (
            <button
              key={type}
              onClick={() => toggleFilter(type as ActivityType)}
              className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                filter.includes(type as ActivityType)
                  ? 'bg-emerald-600'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <span>{config.icon}</span>
              <span className="capitalize">{type.replace('_', ' ')}</span>
            </button>
          ))}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl divide-y divide-gray-700">
        {isLoading && activities.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No activity yet</div>
        ) : (
          activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoading}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
        >
          {isLoading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}

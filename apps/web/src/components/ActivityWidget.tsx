'use client'

import { useActivityFeed } from '@/hooks/useActivityFeed'
import { ActivityItem } from './ActivityItem'
import Link from 'next/link'

interface Props {
  limit?: number
}

export function ActivityWidget({ limit = 5 }: Props) {
  const { activities, isLoading } = useActivityFeed({ limit })

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="font-bold">Recent Activity</h3>
        <Link href="/activity" className="text-sm text-emerald-400 hover:underline">
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
      ) : activities.length === 0 ? (
        <div className="p-4 text-center text-gray-400 text-sm">No activity</div>
      ) : (
        <div className="divide-y divide-gray-700">
          {activities.slice(0, limit).map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  )
}

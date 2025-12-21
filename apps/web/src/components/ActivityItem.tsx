'use client'

import { Activity, ACTIVITY_CONFIG, formatActivityMessage, getRelativeTime } from '@/lib/activity'

interface Props {
  activity: Activity
}

export function ActivityItem({ activity }: Props) {
  const config = ACTIVITY_CONFIG[activity.type]
  const message = formatActivityMessage(activity)
  const time = getRelativeTime(activity.createdAt)

  return (
    <div className="px-4 py-3 flex items-start gap-3 hover:bg-gray-700/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">
        {config.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className={config.color}>{message}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>

      {activity.data.grepEarned && (
        <span className="text-emerald-400 text-sm font-medium">
          +{activity.data.grepEarned} GREP
        </span>
      )}
    </div>
  )
}

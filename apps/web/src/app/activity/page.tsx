'use client'

import { ActivityFeed } from '@/components/ActivityFeed'
import { GlobalActivityFeed } from '@/components/GlobalActivityFeed'
import { useState } from 'react'

export default function ActivityPage() {
  const [tab, setTab] = useState<'mine' | 'global'>('mine')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Activity</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('mine')}
            className={`px-4 py-2 rounded-lg ${tab === 'mine' ? 'bg-emerald-600' : 'bg-gray-800'}`}
          >
            My Activity
          </button>
          <button
            onClick={() => setTab('global')}
            className={`px-4 py-2 rounded-lg ${tab === 'global' ? 'bg-emerald-600' : 'bg-gray-800'}`}
          >
            Global Feed
          </button>
        </div>
      </div>

      {tab === 'mine' ? <ActivityFeed /> : <GlobalActivityFeed />}
    </div>
  )
}

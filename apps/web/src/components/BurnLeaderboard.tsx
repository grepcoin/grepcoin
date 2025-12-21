'use client'

import { useState, useEffect } from 'react'

interface BurnEntry {
  address: string
  totalBurned: string
  tier: string
  burnCount: number
}

export function BurnLeaderboard() {
  const [entries, setEntries] = useState<BurnEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/burn/leaderboard')
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.leaderboard || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const tierColors: Record<string, string> = {
    Diamond: 'text-cyan-400',
    Gold: 'text-yellow-400',
    Silver: 'text-gray-300',
    Bronze: 'text-orange-400',
    None: 'text-gray-500',
  }

  if (isLoading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-64" />
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-lg font-bold">🔥 Top Burners</h3>
      </div>

      <div className="divide-y divide-gray-700">
        {entries.map((entry, i) => (
          <div key={entry.address} className="px-6 py-4 flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-500 w-8">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="font-mono text-sm">
                {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
              </p>
              <p className={`text-sm ${tierColors[entry.tier]}`}>
                {entry.tier} • {entry.burnCount} burns
              </p>
            </div>
            <p className="text-red-400 font-bold">
              {parseFloat(entry.totalBurned).toLocaleString()} GREP
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

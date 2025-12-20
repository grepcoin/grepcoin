'use client'

import { useEffect, useState } from 'react'

interface DataPoint {
  date: string
  score: number
}

interface Props {
  gameSlug?: string | null
}

export function StatsChart({ gameSlug }: Props) {
  const [data, setData] = useState<DataPoint[]>([])

  useEffect(() => {
    const url = gameSlug
      ? `/api/stats/history?game=${gameSlug}`
      : '/api/stats/history'

    fetch(url)
      .then(res => res.json())
      .then(d => setData(d.history || []))
  }, [gameSlug])

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500">
        No data available yet. Play some games!
      </div>
    )
  }

  const maxScore = Math.max(...data.map(d => d.score))
  const minScore = Math.min(...data.map(d => d.score))
  const range = maxScore - minScore || 1

  return (
    <div className="h-48 flex items-end gap-1">
      {data.slice(-30).map((point, i) => {
        const height = ((point.score - minScore) / range) * 100 + 10
        return (
          <div key={i} className="flex-1 group relative">
            <div
              className="bg-emerald-600 hover:bg-emerald-500 rounded-t transition-all"
              style={{ height: `${height}%` }}
            />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-700 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {point.score.toLocaleString()} - {new Date(point.date).toLocaleDateString()}
            </div>
          </div>
        )
      })}
    </div>
  )
}

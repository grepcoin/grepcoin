'use client'

export function SkeletonLeaderboard() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/3 mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-700 last:border-0">
          <div className="w-8 h-8 bg-gray-700 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-700 rounded w-1/4" />
          </div>
          <div className="h-5 bg-gray-700 rounded w-16" />
        </div>
      ))}
    </div>
  )
}

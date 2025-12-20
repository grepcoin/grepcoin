'use client'

export function SkeletonProfile() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 bg-gray-700 rounded-full" />
        <div>
          <div className="h-8 bg-gray-700 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-700 rounded w-32" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4">
            <div className="h-8 bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

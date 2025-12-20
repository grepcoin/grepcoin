'use client'

export function SkeletonGame() {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-700" />
      <div className="p-4">
        <div className="h-6 bg-gray-700 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
        <div className="h-10 bg-gray-700 rounded" />
      </div>
    </div>
  )
}

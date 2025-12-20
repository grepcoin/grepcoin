'use client'

interface Props {
  className?: string
}

export function SkeletonCard({ className = '' }: Props) {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-700 rounded w-2/3" />
    </div>
  )
}

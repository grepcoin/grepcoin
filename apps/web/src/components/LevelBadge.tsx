'use client'
import { Level } from '@/lib/levels'

interface Props { level: Level; size?: 'sm' | 'md' | 'lg' }

export function LevelBadge({ level, size = 'md' }: Props) {
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-3 py-1', lg: 'text-base px-4 py-2' }
  return (
    <span className={`${sizes[size]} ${level.color} bg-gray-800 rounded-full font-bold`}>
      Lv.{level.level} {level.title}
    </span>
  )
}

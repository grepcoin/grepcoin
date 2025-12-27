'use client'
import { useState, useEffect } from 'react'
import { getLevel, getNextLevel, getXPProgress } from '@/lib/levels'

export function useLevel(userId?: string) {
  const [xp, setXP] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/levels/me')
      .then(res => res.json())
      .then(data => { setXP(data.xp || 0); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [userId])

  const currentLevel = getLevel(xp)
  const nextLevel = getNextLevel(xp)
  const progress = getXPProgress(xp)

  return { xp, currentLevel, nextLevel, progress, isLoading }
}

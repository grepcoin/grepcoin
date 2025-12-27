'use client'

import { useState, useEffect } from 'react'
import { BADGES } from '@/lib/badges'

interface UserBadge {
  badgeId: string
  earnedAt: Date
  displayed: boolean
}

export function useBadges(userId?: string) {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    fetch(`/api/badges?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setUserBadges(data.badges || [])
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [userId])

  const earnedBadges = BADGES.filter(b =>
    userBadges.some(ub => ub.badgeId === b.id)
  ).map(badge => ({
    ...badge,
    earnedAt: userBadges.find(ub => ub.badgeId === badge.id)?.earnedAt,
    displayed: userBadges.find(ub => ub.badgeId === badge.id)?.displayed ?? false,
  }))

  const unearnedBadges = BADGES.filter(b =>
    !userBadges.some(ub => ub.badgeId === b.id)
  )

  const displayedBadges = earnedBadges.filter(b => b.displayed)

  const toggleDisplay = async (badgeId: string) => {
    await fetch('/api/badges/display', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badgeId }),
    })
    setUserBadges(prev => prev.map(b =>
      b.badgeId === badgeId ? { ...b, displayed: !b.displayed } : b
    ))
  }

  return { earnedBadges, unearnedBadges, displayedBadges, isLoading, toggleDisplay }
}

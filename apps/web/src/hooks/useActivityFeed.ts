'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Activity, ActivityType } from '@/lib/activity'

interface UseActivityFeedOptions {
  userId?: string
  filter?: ActivityType[]
  limit?: number
}

export function useActivityFeed(options: UseActivityFeedOptions = {}) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const fetchActivities = useCallback(async (pageNum: number, append: boolean = false) => {
    const params = new URLSearchParams()
    if (options.userId) params.set('userId', options.userId)
    if (options.filter?.length) params.set('filter', options.filter.join(','))
    params.set('page', String(pageNum))
    params.set('limit', String(options.limit || 20))

    const res = await fetch(`/api/activity?${params}`)
    const data = await res.json()

    if (append) {
      setActivities(prev => [...prev, ...data.activities])
    } else {
      setActivities(data.activities)
    }
    setHasMore(data.hasMore)
    setIsLoading(false)
  }, [options.userId, options.filter, options.limit])

  useEffect(() => {
    fetchActivities(1)
  }, [fetchActivities])

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchActivities(nextPage, true)
  }, [hasMore, isLoading, page, fetchActivities])

  const refresh = useCallback(() => {
    setPage(1)
    setIsLoading(true)
    fetchActivities(1)
  }, [fetchActivities])

  return { activities, isLoading, hasMore, loadMore, refresh }
}

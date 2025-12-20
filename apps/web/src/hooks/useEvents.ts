'use client'

import { useState, useEffect, useCallback } from 'react'

interface EventUser {
  id: string
  walletAddress: string
  username: string | null
  avatar: string | null
}

interface EventParticipant {
  id: string
  score: number
  joinedAt: string
  user: EventUser
}

interface Event {
  id: string
  name: string
  description: string
  type: 'DAILY' | 'WEEKEND' | 'SEASONAL' | 'FLASH'
  gameSlug: string | null
  startTime: string
  endTime: string
  rewards: Record<string, unknown>
  rules: Record<string, unknown>
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED'
  createdAt: string
  participantCount: number
  topParticipants?: EventParticipant[]
  participants?: EventParticipant[]
  isParticipating?: boolean
  userParticipation?: {
    id: string
    score: number
    joinedAt: string
  } | null
}

interface UseEventsOptions {
  status?: string
  type?: string
  limit?: number
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.status) params.set('status', options.status)
      if (options.type) params.set('type', options.type)
      if (options.limit) params.set('limit', String(options.limit))

      const res = await fetch(`/api/events?${params.toString()}`)

      if (!res.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await res.json()
      setEvents(data.events || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [options.status, options.type, options.limit])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  }
}

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = useCallback(async () => {
    if (!eventId) return

    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch(`/api/events/${eventId}`)

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Event not found')
        }
        throw new Error('Failed to fetch event')
      }

      const data = await res.json()
      setEvent(data.event)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  const joinEvent = async () => {
    if (!eventId) return

    const res = await fetch(`/api/events/${eventId}/join`, {
      method: 'POST',
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to join event')
    }

    await fetchEvent()
    return res.json()
  }

  return {
    event,
    isLoading,
    error,
    joinEvent,
    refetch: fetchEvent,
  }
}

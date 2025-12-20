'use client'

import { useState, useEffect, useCallback } from 'react'

interface TournamentUser {
  id: string
  walletAddress: string
  username: string | null
  avatar: string | null
}

interface TournamentParticipant {
  id: string
  score: number
  rank: number | null
  joinedAt: string
  user: TournamentUser
}

interface Tournament {
  id: string
  name: string
  gameSlug: string
  entryFee: number
  prizePool: number
  maxPlayers: number
  startTime: string
  endTime: string
  status: 'REGISTRATION' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  participantCount: number
  topParticipants?: TournamentParticipant[]
  participants?: TournamentParticipant[]
  isParticipating?: boolean
  userParticipation?: {
    id: string
    score: number
    rank: number | null
    joinedAt: string
  } | null
}

interface UseTournamentsOptions {
  status?: string
  gameSlug?: string
  limit?: number
}

export function useTournaments(options: UseTournamentsOptions = {}) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTournaments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.status) params.set('status', options.status)
      if (options.gameSlug) params.set('gameSlug', options.gameSlug)
      if (options.limit) params.set('limit', String(options.limit))

      const res = await fetch(`/api/tournaments?${params.toString()}`)

      if (!res.ok) {
        throw new Error('Failed to fetch tournaments')
      }

      const data = await res.json()
      setTournaments(data.tournaments || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [options.status, options.gameSlug, options.limit])

  useEffect(() => {
    fetchTournaments()
  }, [fetchTournaments])

  return {
    tournaments,
    isLoading,
    error,
    refetch: fetchTournaments,
  }
}

export function useTournament(tournamentId: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTournament = useCallback(async () => {
    if (!tournamentId) return

    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch(`/api/tournaments/${tournamentId}`)

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Tournament not found')
        }
        throw new Error('Failed to fetch tournament')
      }

      const data = await res.json()
      setTournament(data.tournament)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [tournamentId])

  useEffect(() => {
    fetchTournament()
  }, [fetchTournament])

  const joinTournament = async () => {
    if (!tournamentId) return

    const res = await fetch(`/api/tournaments/${tournamentId}/join`, {
      method: 'POST',
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to join tournament')
    }

    await fetchTournament()
    return res.json()
  }

  const submitScore = async (score: number) => {
    if (!tournamentId) return

    const res = await fetch(`/api/tournaments/${tournamentId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to submit score')
    }

    await fetchTournament()
    return res.json()
  }

  const getTimeRemaining = (): { days: number; hours: number; minutes: number } | null => {
    if (!tournament) return null

    const now = new Date()
    let targetDate: Date

    if (tournament.status === 'REGISTRATION') {
      targetDate = new Date(tournament.startTime)
    } else if (tournament.status === 'ACTIVE') {
      targetDate = new Date(tournament.endTime)
    } else {
      return null
    }

    const diff = targetDate.getTime() - now.getTime()
    if (diff <= 0) return null

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    }
  }

  return {
    tournament,
    isLoading,
    error,
    joinTournament,
    submitScore,
    getTimeRemaining,
    refetch: fetchTournament,
  }
}

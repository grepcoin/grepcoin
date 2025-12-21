'use client'
import { useState, useEffect, useCallback } from 'react'
import { AuctionStatus, AuctionWithDetails } from '@/lib/auctions'

interface UseAuctionsOptions {
  status?: AuctionStatus
  endingSoon?: boolean
  itemType?: string
  limit?: number
  autoRefresh?: boolean
}

export function useAuctions(options: UseAuctionsOptions = {}) {
  const [auctions, setAuctions] = useState<AuctionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuctions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.status) params.set('status', options.status)
      if (options.endingSoon) params.set('endingSoon', 'true')
      if (options.itemType) params.set('itemType', options.itemType)
      if (options.limit) params.set('limit', options.limit.toString())

      const response = await fetch(`/api/auctions?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch auctions')
      }

      setAuctions(data.auctions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [options.status, options.endingSoon, options.itemType, options.limit])

  useEffect(() => {
    fetchAuctions()

    // Auto-refresh every 10 seconds if enabled
    if (options.autoRefresh) {
      const interval = setInterval(fetchAuctions, 10000)
      return () => clearInterval(interval)
    }
  }, [fetchAuctions, options.autoRefresh])

  return { auctions, isLoading, error, refetch: fetchAuctions }
}

export function useAuction(id: string | null, autoRefresh = true) {
  const [auction, setAuction] = useState<AuctionWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuction = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      setError(null)

      const response = await fetch(`/api/auctions/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch auction')
      }

      setAuction(data.auction)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAuction()

    // Auto-refresh every 5 seconds for real-time updates
    if (autoRefresh && id) {
      const interval = setInterval(fetchAuction, 5000)
      return () => clearInterval(interval)
    }
  }, [fetchAuction, autoRefresh, id])

  return { auction, isLoading, error, refetch: fetchAuction }
}

export function usePlaceBid() {
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const placeBid = useCallback(async (auctionId: string, amount: number) => {
    try {
      setIsPlacingBid(true)
      setError(null)

      const response = await fetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place bid')
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsPlacingBid(false)
    }
  }, [])

  return { placeBid, isPlacingBid, error }
}

export function useCreateAuction() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAuction = useCallback(
    async (params: {
      itemId: string
      startingPrice: number
      duration: number
      minIncrement?: number
    }) => {
      try {
        setIsCreating(true)
        setError(null)

        const response = await fetch('/api/auctions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create auction')
        }

        return { success: true, data }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsCreating(false)
      }
    },
    []
  )

  return { createAuction, isCreating, error }
}

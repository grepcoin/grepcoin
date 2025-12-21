'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import type { Listing, MarketplaceFilters } from '@/lib/marketplace'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

interface UseMarketplaceResult {
  listings: Listing[]
  isLoading: boolean
  error: string | null
  pagination: PaginationInfo | null
  refetch: () => Promise<void>
}

interface UseSingleListingResult {
  listing: Listing | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseMyListingsResult {
  listings: Listing[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Hook to fetch marketplace listings with filters
export function useMarketplace(filters?: MarketplaceFilters): UseMarketplaceResult {
  const [listings, setListings] = useState<Listing[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchListings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString())
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
      if (filters?.currency) params.append('currency', filters.currency)
      if (filters?.sortBy) params.append('sortBy', filters.sortBy)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const res = await fetch(`/api/marketplace?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch marketplace listings')

      const data = await res.json()
      setListings(data.listings || [])
      setPagination(data.pagination || null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setListings([])
      setPagination(null)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  return { listings, isLoading, error, pagination, refetch: fetchListings }
}

// Hook to fetch a single listing by ID
export function useListing(id: string): UseSingleListingResult {
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchListing = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/marketplace/${id}`)
      if (!res.ok) throw new Error('Failed to fetch listing')

      const data = await res.json()
      setListing(data.listing || null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setListing(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchListing()
  }, [fetchListing])

  return { listing, isLoading, error, refetch: fetchListing }
}

// Hook to fetch user's own active listings
export function useMyListings(): UseMyListingsResult {
  const { isConnected } = useAccount()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyListings = useCallback(async () => {
    if (!isConnected) {
      setIsLoading(false)
      setListings([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all listings and filter by current user
      // In a real implementation, we'd have a dedicated endpoint for user's listings
      const res = await fetch('/api/marketplace')
      if (!res.ok) throw new Error('Failed to fetch your listings')

      const data = await res.json()
      setListings(data.listings || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setListings([])
    } finally {
      setIsLoading(false)
    }
  }, [isConnected])

  useEffect(() => {
    fetchMyListings()
  }, [fetchMyListings])

  return { listings, isLoading, error, refetch: fetchMyListings }
}

// Function to create a new listing
export async function createListing(
  itemId: string,
  price: number,
  currency: 'grep' | 'eth'
): Promise<{ success: boolean; listing?: Listing; error?: string }> {
  try {
    const res = await fetch('/api/marketplace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, price, currency }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to create listing' }
    }

    return { success: true, listing: data.listing }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Function to cancel a listing
export async function cancelListing(
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/marketplace/${listingId}`, {
      method: 'DELETE',
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to cancel listing' }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Function to purchase a listing
export async function buyItem(
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/marketplace/${listingId}/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to purchase item' }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

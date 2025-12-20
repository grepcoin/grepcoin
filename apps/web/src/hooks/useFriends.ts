'use client'

import { useState, useEffect, useCallback } from 'react'

interface Friend {
  friendshipId: string
  id: string
  walletAddress: string
  username: string | null
  avatar: string | null
  acceptedAt: string
}

interface FriendRequest {
  id: string
  createdAt: string
  user?: {
    id: string
    walletAddress: string
    username: string | null
    avatar: string | null
  }
  friend?: {
    id: string
    walletAddress: string
    username: string | null
    avatar: string | null
  }
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch('/api/friends')
      if (!res.ok) throw new Error('Failed to fetch friends')
      const data = await res.json()
      setFriends(data.friends || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }, [])

  const fetchRequests = useCallback(async () => {
    try {
      const [received, sent] = await Promise.all([
        fetch('/api/friends/requests?type=received'),
        fetch('/api/friends/requests?type=sent'),
      ])

      if (received.ok) {
        const data = await received.json()
        setPendingRequests(data.requests || [])
      }
      if (sent.ok) {
        const data = await sent.json()
        setSentRequests(data.requests || [])
      }
    } catch (e) {
      console.error('Error fetching requests:', e)
    }
  }, [])

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await Promise.all([fetchFriends(), fetchRequests()])
    setIsLoading(false)
  }, [fetchFriends, fetchRequests])

  useEffect(() => {
    refetch()
  }, [refetch])

  const sendFriendRequest = async (walletOrUsername: string) => {
    const isWallet = walletOrUsername.startsWith('0x')
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        isWallet ? { walletAddress: walletOrUsername } : { username: walletOrUsername }
      ),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to send request')
    }
    await refetch()
    return res.json()
  }

  const acceptFriendRequest = async (requestId: string) => {
    const res = await fetch(`/api/friends/${requestId}`, { method: 'PUT' })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to accept request')
    }
    await refetch()
  }

  const removeFriend = async (friendshipId: string) => {
    const res = await fetch(`/api/friends/${friendshipId}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to remove friend')
    }
    await refetch()
  }

  const rejectFriendRequest = async (requestId: string) => {
    await removeFriend(requestId)
  }

  return {
    friends,
    pendingRequests,
    sentRequests,
    isLoading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    rejectFriendRequest,
    refetch,
  }
}

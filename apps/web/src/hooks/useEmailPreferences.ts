// React Hooks for Email Preferences
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'

export interface EmailPreferences {
  welcomeEnabled: boolean
  weeklyDigestEnabled: boolean
  achievementEnabled: boolean
  rewardClaimEnabled: boolean
  tournamentStartEnabled: boolean
  friendRequestEnabled: boolean
  unsubscribedAll: boolean
}

export interface EmailStatus {
  email: string | null
  verified: boolean
  preferences: EmailPreferences
}

export function useEmailPreferences() {
  const { address, isConnected } = useAccount()
  const [status, setStatus] = useState<EmailStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch email status
  const fetchStatus = useCallback(async () => {
    if (!isConnected || !address) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/email/preferences?walletAddress=${address}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch email preferences')
      }

      const data = await response.json()
      setStatus(data)
    } catch (err: any) {
      console.error('Error fetching email preferences:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [address, isConnected])

  // Subscribe email
  const subscribeEmail = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      if (!isConnected || !address) {
        return { success: false, error: 'Wallet not connected' }
      }

      try {
        const response = await fetch('/api/email/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, walletAddress: address }),
        })

        const data = await response.json()

        if (!response.ok) {
          return { success: false, error: data.error || 'Failed to subscribe' }
        }

        // Refresh status
        await fetchStatus()

        return { success: true }
      } catch (err: any) {
        console.error('Error subscribing email:', err)
        return { success: false, error: err.message }
      }
    },
    [address, isConnected, fetchStatus]
  )

  // Update preferences
  const updatePreferences = useCallback(
    async (
      preferences: Partial<EmailPreferences>
    ): Promise<{ success: boolean; error?: string }> => {
      if (!isConnected || !address) {
        return { success: false, error: 'Wallet not connected' }
      }

      try {
        const response = await fetch('/api/email/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address, preferences }),
        })

        const data = await response.json()

        if (!response.ok) {
          return {
            success: false,
            error: data.error || 'Failed to update preferences',
          }
        }

        // Update local state
        setStatus((prev) =>
          prev
            ? {
                ...prev,
                preferences: { ...prev.preferences, ...data.preferences },
              }
            : null
        )

        return { success: true }
      } catch (err: any) {
        console.error('Error updating preferences:', err)
        return { success: false, error: err.message }
      }
    },
    [address, isConnected]
  )

  // Resend verification email
  const resendVerification = useCallback(async (): Promise<{
    success: boolean
    error?: string
  }> => {
    if (!isConnected || !address || !status?.email) {
      return {
        success: false,
        error: 'No email address found',
      }
    }

    try {
      const response = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: status.email, walletAddress: address }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to resend verification',
        }
      }

      return { success: true }
    } catch (err: any) {
      console.error('Error resending verification:', err)
      return { success: false, error: err.message }
    }
  }, [address, isConnected, status?.email])

  // Unsubscribe from all emails
  const unsubscribeAll = useCallback(async (): Promise<{
    success: boolean
    error?: string
  }> => {
    if (!isConnected || !address) {
      return { success: false, error: 'Wallet not connected' }
    }

    try {
      const response = await fetch(
        `/api/email/preferences?walletAddress=${address}`,
        { method: 'DELETE' }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to unsubscribe',
        }
      }

      // Reset local state
      setStatus(null)

      return { success: true }
    } catch (err: any) {
      console.error('Error unsubscribing:', err)
      return { success: false, error: err.message }
    }
  }, [address, isConnected])

  // Fetch on mount and when address changes
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    status,
    loading,
    error,
    subscribeEmail,
    updatePreferences,
    resendVerification,
    unsubscribeAll,
    refresh: fetchStatus,
  }
}

// Hook to get email status only (lighter weight)
export function useEmailStatus() {
  const { address, isConnected } = useAccount()
  const [email, setEmail] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `/api/email/preferences?walletAddress=${address}`
        )

        if (response.ok) {
          const data = await response.json()
          setEmail(data.email)
          setVerified(data.verified)
        }
      } catch (err) {
        console.error('Error fetching email status:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [address, isConnected])

  return { email, verified, loading }
}

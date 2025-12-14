'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useAccount, useSignMessage, useDisconnect, useChainId } from 'wagmi'

interface User {
  walletAddress: string
  username?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
          }
        }
      } catch (e) {
        console.error('Session check failed:', e)
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  // Sign in with SIWE
  const signIn = useCallback(async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get nonce from server
      const nonceRes = await fetch('/api/auth/nonce')
      if (!nonceRes.ok) throw new Error('Failed to get nonce')
      const { nonce } = await nonceRes.json()

      // Create SIWE message
      const domain = window.location.host
      const origin = window.location.origin
      const message = `${domain} wants you to sign in with your Ethereum account:
${address}

Sign in to GrepCoin Arcade

URI: ${origin}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}`

      // Sign message
      const signature = await signMessageAsync({ message })

      // Verify on server
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
      })

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json()
        throw new Error(errorData.error || 'Verification failed')
      }

      const { user: userData } = await verifyRes.json()
      setUser(userData)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Sign in failed'
      setError(errorMessage)
      console.error('Sign in error:', e)
    } finally {
      setIsLoading(false)
    }
  }, [address, isConnected, chainId, signMessageAsync])

  // Sign out
  const signOut = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      disconnect()
    } catch (e) {
      console.error('Sign out error:', e)
    } finally {
      setIsLoading(false)
    }
  }, [disconnect])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

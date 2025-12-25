'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, Connector } from 'wagmi'
import { Wallet, LogOut, ChevronDown, Copy, Check, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function WalletButton() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { user, isAuthenticated, signIn, signOut, isLoading } = useAuth()

  const [mounted, setMounted] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showConnectors, setShowConnectors] = useState(false)
  const [copied, setCopied] = useState(false)
  const [availableConnectors, setAvailableConnectors] = useState<Connector[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Filter to only show available/ready connectors
    setAvailableConnectors(connectors.filter(c => c.name !== 'Injected'))
  }, [connectors])

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleConnect = (connector: Connector) => {
    connect({ connector })
    setShowConnectors(false)
  }

  // Prevent hydration mismatch by rendering consistent state until mounted
  if (!mounted) {
    return (
      <div className="relative">
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink font-semibold hover:opacity-90 transition-all"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      </div>
    )
  }

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowConnectors(!showConnectors)}
          disabled={isConnecting || isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink font-semibold hover:opacity-90 transition-all"
        >
          <Wallet className="w-4 h-4" />
          {isConnecting || isPending ? 'Connecting...' : 'Connect Wallet'}
        </button>

        {showConnectors && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl bg-dark-800 border border-dark-700 shadow-xl z-50">
            <div className="p-3 border-b border-dark-700">
              <p className="text-sm text-gray-400">Choose a wallet</p>
            </div>
            <div className="p-2">
              {connectors.length === 0 ? (
                <p className="text-sm text-gray-400 p-3">No wallets detected. Please install MetaMask or another wallet.</p>
              ) : (
                connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => handleConnect(connector)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-700 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span>{connector.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Connected but not signed in
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">{truncateAddress(address!)}</span>
        <button
          onClick={signIn}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-grep-purple to-grep-pink font-semibold hover:opacity-90 transition-all"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
        <button
          onClick={() => disconnect()}
          className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Fully authenticated
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 hover:border-dark-500 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-grep-purple to-grep-pink flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
        <span className="font-medium">
          {user?.username || truncateAddress(address!)}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-dark-800 border border-dark-700 shadow-xl z-50">
          <div className="p-4 border-b border-dark-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-grep-purple to-grep-pink flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">{user?.username || 'Player'}</p>
                <p className="text-sm text-gray-400">{truncateAddress(address!)}</p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={copyAddress}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-700 transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-grep-green" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
              <span>{copied ? 'Copied!' : 'Copy Address'}</span>
            </button>

            <button
              onClick={() => {
                signOut()
                setShowDropdown(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-700 transition-colors text-red-400"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

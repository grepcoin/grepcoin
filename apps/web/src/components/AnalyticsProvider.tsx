'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { analytics } from '@/lib/analytics'

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { address, isConnected } = useAccount()

  useEffect(() => {
    analytics.pageView(pathname)
  }, [pathname])

  useEffect(() => {
    if (isConnected && address) {
      analytics.setUserId(address)
      analytics.walletConnect(address)
    } else {
      analytics.setUserId(null)
    }
  }, [isConnected, address])

  return <>{children}</>
}

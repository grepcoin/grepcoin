'use client'

import { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi'
import { AuthProvider } from '@/context/AuthContext'
import { StakingProvider } from '@/context/StakingContext'
import { NotificationProvider } from '@/components/NotificationProvider'

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StakingProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </StakingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

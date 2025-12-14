'use client'

import { StakingProvider } from '@/context/StakingContext'
import { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <StakingProvider>
      {children}
    </StakingProvider>
  )
}

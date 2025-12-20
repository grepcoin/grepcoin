'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analytics } from '@/lib/analytics'

export function useAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    analytics.pageView(pathname)
  }, [pathname])

  return analytics
}

export function usePageView() {
  const pathname = usePathname()

  useEffect(() => {
    analytics.pageView(pathname)
  }, [pathname])
}

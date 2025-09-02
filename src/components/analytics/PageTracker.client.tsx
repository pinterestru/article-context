'use client'

/**
 * Page tracker component for automatic page view tracking
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analytics } from '@/lib/analytics'

export function PageTracker() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Track page view on route change
    analytics.pageView()
  }, [pathname])
  
  return null
}
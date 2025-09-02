/**
 * Simple Analytics API for Next.js 15.3+
 * Only tracks what we actually use: promocode events, page views, and errors
 */

import { AnalyticsCore } from './core'
import type { AnalyticsConfig } from './types'
import { clientEnv } from '@/config/client-env'

// Configure analytics based on environment variables
const config: AnalyticsConfig = {
  debug: process.env.NODE_ENV === 'development',
  gtm: {
    containerId: clientEnv.NEXT_PUBLIC_GTM_ID,
  },
  ga4: {
    measurementId: clientEnv.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
  },
  yandex: {
    counterId: clientEnv.NEXT_PUBLIC_YANDEX_METRICA_ID,
  },
}

// Create core instance
const core = new AnalyticsCore(config)

// Auto-initialize flag
let autoInitStarted = false

/**
 * Main analytics API - simplified to only what we use
 */
export const analytics = {
  /**
   * Track a generic event
   */
  track(eventName: string, data: Record<string, unknown> = {}): void {
    // Auto-initialize on first use
    if (!autoInitStarted && typeof window !== 'undefined') {
      autoInitStarted = true
      core.initialize().catch(console.error)
    }

    core.track(eventName, data)
  },

  /**
   * Track a page view
   */
  pageView(): void {
    if (typeof window === 'undefined') return

    // Auto-initialize if needed
    if (!autoInitStarted) {
      autoInitStarted = true
      core.initialize().catch(console.error)
    }

    core.pageView()
  },

  /**
   * Promocode-specific tracking methods (what we actually use)
   */
  promocode: {
    clicked: (code: string, merchant: string, targetUrl: string, position: string | number = 0) => {
      analytics.track('promocode_clicked', { code, merchant, targetUrl, position })
    },

    copied: (code: string, merchant: string, position: string | number = 0) => {
      analytics.track('promocode_copied', { code, merchant, position })
    },
  },

  /**
   * Error tracking
   */
  error: (
    error: string | Error,
    type: 'javascript' | 'network' | 'validation' | 'unknown' = 'unknown',
    context?: Record<string, unknown>
  ) => {
    analytics.track('error_occurred', {
      error: error instanceof Error ? error.message : error,
      errorType: type,
      context,
      stack: error instanceof Error ? error.stack : undefined,
    })
  },
}

// Export scripts component
export { AnalyticsScripts, AnalyticsHeadScripts } from './scripts'

// Export types for TypeScript users
export type { AnalyticsConfig } from './types'

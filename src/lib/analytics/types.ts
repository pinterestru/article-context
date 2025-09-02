/**
 * Simple analytics types - only what we actually use
 */

export interface AnalyticsProvider {
  name: string
  initialized: boolean
  load(): Promise<void>
  track(event: AnalyticsEvent): void
  pageView(path: string, title?: string): void
}

export interface AnalyticsEvent {
  name: string
  data: Record<string, unknown>
  timestamp?: number
}

export interface AnalyticsConfig {
  gtm?: {
    containerId?: string
  }
  ga4?: {
    measurementId?: string
  }
  yandex?: {
    counterId?: string
  }
  debug?: boolean
}

// Event data types for type safety
export interface PromocodeClickData {
  code: string
  merchant: string
  targetUrl: string
  position?: string | number
}

export interface PromocodeCopyData {
  code: string
  merchant: string
  position?: string | number
}

export interface ErrorData {
  error: string
  errorType: 'javascript' | 'network' | 'validation' | 'unknown'
  context?: Record<string, unknown>
  stack?: string
}

export interface PageViewData {
  path: string
  title: string
  referrer: string
}

/**
 * Global window extensions
 */
declare global {
  interface Window {
    // Google Tag Manager
    dataLayer?: Array<Record<string, unknown>>
    google_tag_manager?: Record<string, unknown>
    gtag?: (...args: unknown[]) => void
    
    // Yandex Metrica
    ym?: (counterId: number | string, method: string, ...args: unknown[]) => void
    
    // Analytics debug
    __analytics_debug__?: boolean
  }
}
/**
 * Simplified analytics core - manages providers and events
 */

import type { AnalyticsProvider, AnalyticsEvent, AnalyticsConfig } from './types'
import { GTMProvider } from './providers/gtm'
import { GA4Provider } from './providers/ga4'
import { YandexProvider } from './providers/yandex'

export class AnalyticsCore {
  private initialized = false
  private providers: AnalyticsProvider[] = []
  private config: AnalyticsConfig
  
  constructor(config: AnalyticsConfig = {}) {
    this.config = config
    
    // Set up debug mode
    if (config.debug && typeof window !== 'undefined') {
      window.__analytics_debug__ = true
    }
  }
  
  /**
   * Initialize only the providers that have IDs configured
   */
  async initialize(): Promise<void> {
    if (this.initialized) return
    
    try {
      // Wait for scripts to be loaded by layout.tsx
      // Scripts are loaded with strategy="afterInteractive" so we need to wait
      if (typeof window !== 'undefined') {
        // If document is still loading, wait for it
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            window.addEventListener('load', resolve, { once: true })
          })
        }
        
        // Give scripts a moment to initialize after page load
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Create all providers and let them decide if they can initialize
      const loaders: Promise<void>[] = []
      
      // GTM - only create if ID exists (no opportunistic loading for GTM)
      if (this.config.gtm?.containerId) {
        const gtm = new GTMProvider(this.config.gtm.containerId)
        this.providers.push(gtm)
        loaders.push(gtm.load())
      }
      
      // GA4 - only create if ID exists
      if (this.config.ga4?.measurementId) {
        const ga4 = new GA4Provider(this.config.ga4.measurementId)
        this.providers.push(ga4)
        loaders.push(ga4.load())
      }
      
      // Yandex - only create if ID exists
      if (this.config.yandex?.counterId) {
        const yandex = new YandexProvider(this.config.yandex.counterId)
        this.providers.push(yandex)
        loaders.push(yandex.load())
      }
      
      // Wait for all providers to load
      await Promise.allSettled(loaders)
      
      this.initialized = true
      
      if (this.config.debug) {
        const initializedProviders = this.providers.filter(p => p.initialized)
        const skippedProviders = []
        
        // Check which providers were skipped
        if (!this.config.gtm?.containerId) skippedProviders.push('GTM')
        if (!this.config.ga4?.measurementId) skippedProviders.push('GA4')
        if (!this.config.yandex?.counterId) skippedProviders.push('Yandex')
        
        console.log('[Analytics] Initialized with providers:', initializedProviders.map(p => p.name))
        if (skippedProviders.length > 0) {
          console.log('[Analytics] Skipped providers (no IDs):', skippedProviders)
        }
      }
      
    } catch (error) {
      console.error('[Analytics] Failed to initialize:', error)
    }
  }
  
  /**
   * Track an event
   */
  track(eventName: string, data: Record<string, unknown> = {}): void {
    const event: AnalyticsEvent = {
      name: eventName,
      data,
      timestamp: Date.now()
    }
    
    // Send to all initialized providers
    this.providers.forEach(provider => {
      if (provider.initialized) {
        try {
          provider.track(event)
        } catch (error) {
          console.error(`[Analytics] Failed to track with ${provider.name}:`, error)
        }
      }
    })
    
    if (this.config.debug) {
      console.log('[Analytics] Event tracked:', eventName, data)
    }
  }
  
  /**
   * Track a page view
   */
  pageView(path?: string, title?: string): void {
    const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '/')
    const currentTitle = title || (typeof document !== 'undefined' ? document.title : '')
    
    // Send to all providers
    this.providers.forEach(provider => {
      if (provider.initialized) {
        try {
          provider.pageView(currentPath, currentTitle)
        } catch (error) {
          console.error(`[Analytics] Failed to track page view with ${provider.name}:`, error)
        }
      }
    })
    
    if (this.config.debug) {
      console.log('[Analytics] Page view tracked:', currentPath, currentTitle)
    }
  }
}
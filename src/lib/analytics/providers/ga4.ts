/**
 * Google Analytics 4 (GA4) analytics provider - direct integration
 */

import type { AnalyticsProvider, AnalyticsEvent } from '../types'

// Using the global declaration from types.ts

export class GA4Provider implements AnalyticsProvider {
  name = 'Google Analytics 4'
  initialized = false
  private measurementId: string
  
  constructor(measurementId: string = '') {
    this.measurementId = measurementId
    if (!measurementId && process.env.NODE_ENV === 'development') {
      console.warn('[GA4] Created without measurement ID - provider will not function')
    }
  }
  
  async load(): Promise<void> {
    if (typeof window === 'undefined') return
    
    // Don't initialize if no measurement ID
    if (!this.measurementId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[GA4] Skipping initialization - no measurement ID')
      }
      return
    }
    
    // Check if gtag already exists (loaded by layout.tsx or GTM)
    if (window.gtag) {
      this.initialized = true
      if (process.env.NODE_ENV === 'development') {
        console.log('[GA4] Already loaded by layout or GTM')
      }
      return
    }
    
    // GA4 should be loaded by layout.tsx via <Script> component
    // Wait a bit for the script to initialize
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Check again after delay
    if (window.gtag) {
      this.initialized = true
    } else if (process.env.NODE_ENV === 'development') {
      console.log('[GA4] Not loaded - will work through GTM if available')
    }
  }
  
  track(event: AnalyticsEvent): void {
    if (!this.initialized || !window.gtag) return
    
    // Map to GA4 event format
    switch (event.name) {
      case 'promocode_clicked':
        // Use GA4's select_promotion event
        window.gtag('event', 'select_promotion', {
          promotion_id: event.data.code,
          promotion_name: event.data.merchant,
          creative_slot: String(event.data.position || '0'),
          items: [{
            item_id: event.data.code,
            item_name: event.data.merchant,
            item_category: 'promocode',
            price: 0,
            quantity: 1
          }]
        })
        break
        
      case 'promocode_copied':
        // Custom event for copy action
        window.gtag('event', 'copy_promocode', {
          promocode: event.data.code,
          merchant: event.data.merchant,
          position: event.data.position || '0'
        })
        break
        
      case 'error_occurred':
        // Use GA4's exception event
        window.gtag('event', 'exception', {
          description: event.data.error,
          fatal: event.data.errorType === 'javascript'
        })
        break
        
      default:
        // Send as custom event
        window.gtag('event', event.name, event.data)
    }
  }
  
  pageView(path: string, title?: string): void {
    if (!this.initialized || !window.gtag) return
    
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href
    })
  }
}
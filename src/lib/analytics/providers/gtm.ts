/**
 * Google Tag Manager analytics provider - simplified
 */

import type { AnalyticsProvider, AnalyticsEvent } from '../types'

export class GTMProvider implements AnalyticsProvider {
  name = 'Google Tag Manager'
  initialized = false
  private containerId: string
  
  constructor(containerId: string) {
    this.containerId = containerId
  }
  
  async load(): Promise<void> {
    if (typeof window === 'undefined') return
    
    // Check if GTM is loaded by layout.tsx
    if (window.google_tag_manager?.[this.containerId]) {
      this.initialized = true
      if (process.env.NODE_ENV === 'development') {
        console.log('[GTM] Already loaded by layout')
      }
      return
    }
    
    // GTM should be loaded by layout.tsx via <Script> component
    // Wait a bit for the script to initialize
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Check again after delay
    if (window.google_tag_manager?.[this.containerId]) {
      this.initialized = true
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('[GTM] Not loaded - check GTM_ID configuration')
    }
  }
  
  track(event: AnalyticsEvent): void {
    if (!this.initialized || !window.dataLayer) return
    
    // Simple event mapping
    const gtmEvent: Record<string, unknown> = {
      event: event.name,
      event_timestamp: event.timestamp || Date.now(),
      ...event.data
    }
    
    // Enhanced ecommerce for promocode events
    if (event.name === 'promocode_clicked') {
      gtmEvent.event = 'select_promotion'
      gtmEvent.ecommerce = {
        items: [{
          promotion_id: event.data.code,
          promotion_name: event.data.merchant,
          creative_slot: event.data.position || '0'
        }]
      }
    }
    
    window.dataLayer.push(gtmEvent)
  }
  
  pageView(path: string, title?: string): void {
    if (!this.initialized || !window.dataLayer) return
    
    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href
    })
  }
}
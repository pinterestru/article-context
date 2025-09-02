/**
 * Yandex Metrica analytics provider - simplified
 */

import type { AnalyticsProvider, AnalyticsEvent } from '../types'

export class YandexProvider implements AnalyticsProvider {
  name = 'Yandex Metrica'
  initialized = false
  private counterId: string
  
  constructor(counterId: string = '') {
    this.counterId = counterId
    if (!counterId && process.env.NODE_ENV === 'development') {
      console.warn('[Yandex] Created without counter ID - provider will not function')
    }
  }
  
  async load(): Promise<void> {
    if (typeof window === 'undefined') return
    
    // Don't initialize if no counter ID
    if (!this.counterId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Yandex] Skipping initialization - no counter ID')
      }
      return
    }
    
    // Check if ym already exists (loaded by layout.tsx or GTM)
    if (window.ym) {
      this.initialized = true
      if (process.env.NODE_ENV === 'development') {
        console.log('[Yandex] Already loaded by layout or GTM')
      }
      return
    }
    
    // Yandex should be loaded by layout.tsx via <Script> component
    // Wait a bit for the script to initialize
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Check again after delay
    if (window.ym && this.counterId) {
      this.initialized = true
    } else if (process.env.NODE_ENV === 'development') {
      if (!this.counterId) {
        console.log('[Yandex] No counter ID provided')
      } else {
        console.log('[Yandex] Not loaded - check YANDEX_METRICA_ID configuration')
      }
    }
  }
  
  track(event: AnalyticsEvent): void {
    if (!this.initialized || !window.ym) return
    
    // Map to Yandex goal
    const goalMap: Record<string, string> = {
      'promocode_copied': 'PROMOCODE_COPY',
      'promocode_clicked': 'PROMOCODE_CLICK',
      'error_occurred': 'ERROR'
    }
    
    const goalName = goalMap[event.name] || event.name.toUpperCase()
    window.ym(this.counterId, 'reachGoal', goalName, event.data)
    
    // Ecommerce tracking for promocode clicks
    if (event.name === 'promocode_clicked' && window.dataLayer) {
      window.dataLayer.push({
        ecommerce: {
          purchase: {
            actionField: {
              id: `${event.data.code}_${Date.now()}`
            },
            products: [{
              id: event.data.code,
              name: event.data.merchant,
              category: 'promocode',
              quantity: 1
            }]
          }
        }
      })
    }
  }
  
  pageView(path: string, title?: string): void {
    if (!this.initialized || !window.ym) return
    
    window.ym(this.counterId, 'hit', path, {
      title: title || document.title,
      referer: document.referrer
    })
  }
  
}
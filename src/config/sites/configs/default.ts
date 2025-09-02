import type { SiteConfig } from '../types'

/**
 * Default site configuration
 * This is the base configuration used when SITE_CONFIG is not specified
 * or set to 'default'
 */
export const defaultConfig: SiteConfig = {
  id: 'default',
  brand: {
    name: 'Affiliate Articles',
    logoUrl: '/images/sites/default/logo.svg',
    faviconUrl: '/images/sites/default/favicon.svg',
    metaDescription: 'Discover the best promocodes and affiliate deals',
  },
  theme: 'default'
}
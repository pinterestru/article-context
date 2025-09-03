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
  contact: {
    email: 'support@affiliatearticles.com',
    phone: '+1 (555) 123-4567',
    legalName: 'Affiliate Articles Ltd.',
    address: '123 Business Street, Suite 100, New York, NY 10001',
    businessHours: 'Monday - Friday: 9:00 AM - 5:00 PM EST',
    legalInfo: 'Registered in Delaware, USA. Company Registration Number: 123456789'
  },
  theme: 'default'
}
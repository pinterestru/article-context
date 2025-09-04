/**
 * Site configuration type definitions
 * These types define the structure of site-specific configurations
 * for themes, branding, and layout variants
 */

export type ThemeBase = 'default' | 'dark' | 'corporate' | 'modern' | 'telegram-hub'

export interface BrandConfig {
  /** Brand name displayed in the UI */
  name: string
  /** URL to the brand logo image */
  logoUrl: string
  /** URL to the favicon */
  faviconUrl: string
  /** Meta description for SEO */
  metaDescription?: string
}

export interface ContactInfo {
  /** Contact email address */
  email?: string
  /** Contact phone number */
  phone?: string
  /** Company legal name */
  legalName?: string
  /** Company address */
  address?: string
  /** Business hours */
  businessHours?: string
  /** Additional legal information */
  legalInfo?: string
}

export interface SiteConfig {
  /** Unique identifier for the site configuration */
  id: string
  /** Brand settings */
  brand: BrandConfig
  /** Contact information */
  contact?: ContactInfo
  /** Theme settings */
  theme?: string
  /** Homepage variant to use (default: 'default') */
  homepage?: string
  /** Header implementation to use (default: 'default') */
  header?: string
  /** Footer implementation to use (default: 'default') */
  footer?: string
  /** Promocode list widget variant (default: 'list') */
  promocodeCard?: string
  /** Promocode dialog content variant (default: 'default') */
  promocodeDialog?: string
}

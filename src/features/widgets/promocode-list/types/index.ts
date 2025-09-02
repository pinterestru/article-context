/**
 * Self-contained promocode widget types
 */

// Import Promocode type from service layer
import type { Promocode } from '@/lib/services/promocode/promocode.types';

// Re-export for convenience
export type { Promocode };

// Props for the presentation component (PromocodeList)
export interface PromocodeListWidgetProps {
  // Data
  promocodes: Promocode[]

  // Display options
  layout?: 'list' | 'grid' | 'inline' | 'featured'
  itemsPerPage?: number
  showExpiration?: boolean
  showTags?: boolean
  white?: boolean // For cloaking
  variant?: 'default' | 'compact' | 'detailed'
  withTitle?: boolean // Show title with store name and date

  // Styling
  className?: string
}

// Props for async wrapper
export interface AsyncPromocodeListWidgetProps {
  // Data source configuration
  source: 'static' | 'dynamic'
  staticPromocodes?: Promocode[]
  dynamicQuery?: {
    slug?: string
    count?: number
  }

  // Display options
  layout?: 'list' | 'grid' | 'inline' | 'featured'
  itemsPerPage?: number
  showExpiration?: boolean
  showTags?: boolean
  white?: boolean // For cloaking
  variant?: 'default' | 'compact' | 'detailed'
  withTitle?: boolean // Show title with store name and date


  // Styling
  className?: string
}


// API response types
export interface PromocodeApiResponse {
  promocodes: Promocode[]
  total: number
  page?: number
  pageSize?: number
}

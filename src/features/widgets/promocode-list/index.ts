/**
 * Self-contained Promocode List Widget
 *
 * This widget can display one or many promocodes with full functionality including:
 * - Static or dynamic data sources
 * - Multiple layout options (list, grid, inline, featured)
 * - Interactive features (copy, dialog, analytics)
 * - Streaming support with Suspense
 * - Error boundaries and loading states
 */

// Main components
export { PromocodeList } from './components/PromocodeList.server'
export { PromocodeListWidget } from './components/PromocodeListWidget'

// Supporting components (for advanced usage)
export { PromocodeCard } from './components/PromocodeCard.server'
export { PromocodeButton } from './components/PromocodeButton.client'
export { PromocodeListSkeleton, PromocodeCardSkeleton } from './components/PromocodeListSkeleton'
export { PromocodeListErrorBoundary } from './components/PromocodeListErrorBoundary.client'

// Services (re-export from lib)
export { fetchPromocodesList, fetchPromocodeById } from '@/lib/services/promocode/promocode.api'

// Types
export type {
  Promocode,
  PromocodeListWidgetProps,
  AsyncPromocodeListWidgetProps,
  PromocodeApiResponse,
} from './types'

// Schemas and validation
export {
  promocodeSchema,
  promocodeListConfigSchema,
  parsePromocodeListConfig,
  isValidPromocodeListConfig,
} from './schemas/config'

// Default widget export for registry
export { PromocodeListWidget as default } from './components/PromocodeListWidget'

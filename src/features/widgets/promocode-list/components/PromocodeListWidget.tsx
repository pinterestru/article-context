import type { WidgetComponentProps } from '@/features/widgets/lib/registry.server'
import type { Promocode } from '@/lib/services/promocode/promocode.types'
import { PromocodeList } from './PromocodeList.server'
import { promocodeApiService } from '@/lib/services/promocode/promocode.api'
import { parsePromocodeListConfig } from '../schemas/config'

/**
 * PromocodeListWidget - Widget wrapper for promocode list
 *
 * This component:
 * 1. Parses and validates widget configuration using Zod schema
 * 2. Fetches data if needed (dynamic source)
 * 3. Renders PromocodeList with proper props
 *
 * All configuration parsing is handled by the Zod schema, which automatically
 * converts string values from URL params (e.g., "true" → true)
 *
 * Note: Error boundary and Suspense are handled at the ArticleBlockRenderer level
 */
export async function PromocodeListWidget({ config, className }: WidgetComponentProps) {
  // Extract type and ecommerceStoreId separately
  const {
    type: _type,
    ecommerceStoreId: _ecommerceStoreId,
    ...rawProps
  } = config as Record<string, unknown>

  try {
    // Build the proper structure for validation
    // Handle both flat (from hash URLs) and nested (programmatic) formats
    const configForValidation = {
      ...rawProps,
      className,
      // Build dynamicQuery from flat properties if not already nested
      dynamicQuery: rawProps.dynamicQuery || {
        slug: rawProps.slug,
        count: rawProps.count,
      },
    }

    // Use Zod schema to validate and transform all props
    // This handles all string-to-boolean conversions automatically
    const validatedConfig = parsePromocodeListConfig(configForValidation)

    const { source, staticPromocodes, dynamicQuery, ...displayProps } = validatedConfig
    let promocodes: Promocode[] = []

    // Static case - use provided promocodes
    if (source === 'static' && staticPromocodes) {
      promocodes = staticPromocodes
    }
    // Dynamic case - fetch from API
    else if (source === 'dynamic' && dynamicQuery?.slug) {
      promocodes = await promocodeApiService.fetchPromocodesList({
        slug: dynamicQuery.slug,
        count: dynamicQuery.count || 10,
      })
    }

    return <PromocodeList promocodes={promocodes} {...displayProps} />
  } catch (error) {
    // If validation fails, log error and render error state
    console.error('Invalid promocode list widget configuration:', error)
    return (
      <div className="text-muted-foreground py-8 text-center">Invalid widget configuration</div>
    )
  }
}

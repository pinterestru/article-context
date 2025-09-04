import 'server-only'
import { cache } from 'react'
import { fetchPromocodesList } from '@/lib/services/promocode/promocode.api'
import type { PromocodeListWidgetConfig, WidgetConfig } from '@/features/widgets/lib/config-parser'
import type { Promocode, FetchPromocodeListParams } from '@/lib/services/promocode/promocode.types'
import { logger } from '@/lib/logging/logger'

/**
 * Simple widget structure for data fetching
 */
export interface ParsedWidget {
  id: string
  type: string
  config: WidgetConfig
  originalElement?: string
}

/**
 * Widget data containing all necessary information for rendering
 */
export interface WidgetData {
  widgetId: string
  type: string
  data: unknown
  error?: Error
}

/**
 * Fetches data for all widgets in parallel
 * Cached at the React level to prevent duplicate fetches within a single request
 * The underlying promocode service handles long-term caching (1 hour)
 */
export const fetchWidgetData = cache(
  async (widgets: ParsedWidget[], ecommerceStoreId?: string): Promise<Map<string, WidgetData>> => {
    const widgetDataMap = new Map<string, WidgetData>()

    // Group widgets by type for efficient fetching
    const promocodeWidgets = widgets.filter((w) => w.config.type === 'promocode_list')

    // Fetch data for each widget type in parallel
    const fetchPromises: Promise<void>[] = []

    // Fetch promocode data
    if (promocodeWidgets.length > 0) {
      // Group by partner/article for batch fetching
      const promocodeGroups = groupPromocodeWidgets(promocodeWidgets)

      for (const [key, groupWidgets] of promocodeGroups) {
        const [partner, article] = key.split('::')

        fetchPromises.push(
          fetchPromocodesForGroup(partner, article, groupWidgets, ecommerceStoreId, widgetDataMap)
        )
      }
    }

    // Add more widget type fetchers here as needed
    // For example: countdown widgets might need to fetch end times from an API

    // Wait for all fetches to complete
    await Promise.all(fetchPromises)

    return widgetDataMap
  }
)

/**
 * Groups promocode widgets by partner and article for batch fetching
 */
function groupPromocodeWidgets(widgets: ParsedWidget[]): Map<string, ParsedWidget[]> {
  const groups = new Map<string, ParsedWidget[]>()

  widgets.forEach((widget) => {
    let key = ''

    if (widget.config.type === 'promocode_list') {
      const config = widget.config as PromocodeListWidgetConfig
      if (config.dynamicQuery?.slug) {
        key = config.dynamicQuery.slug
      }
    } else {
      return
    }

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(widget)
  })

  return groups
}

/**
 * Fetches promocodes for a group of widgets and populates the data map
 */
async function fetchPromocodesForGroup(
  partner: string,
  article: string,
  widgets: ParsedWidget[],
  ecommerceStoreId: string | undefined,
  dataMap: Map<string, WidgetData>
): Promise<void> {
  try {
    // Need to get the maximum count needed
    const maxCount = Math.max(
      ...widgets.map((w) => {
        const config = w.config as PromocodeListWidgetConfig
        return config.dynamicQuery?.count || 10
      })
    )

    // Build query for fetchPromocodesList
    const query: FetchPromocodeListParams = {
      slug: `${partner}.${article}`,
      count: maxCount,
      ecommerceStoreId,
      withCode: true,
    }

    // Fetch promocodes using the modern API
    const promocodesResult = await fetchPromocodesList(query)
    
    if (!promocodesResult.success) {
      throw promocodesResult.error
    }
    
    const promocodes = promocodesResult.data

    // Process data for each widget in the group
    widgets.forEach((widget) => {
      if (widget.config.type === 'promocode_list') {
        const config = widget.config as PromocodeListWidgetConfig
        const count = config.dynamicQuery?.count || 10

        // Get the requested number of promocodes
        const widgetPromocodes = promocodes.slice(0, count)

        dataMap.set(widget.id, {
          widgetId: widget.id,
          type: 'promocode_list',
          data: {
            promocodes: widgetPromocodes,
            partner: partner,
          },
        })
      }
    })

    logger.info(
      {
        partner,
        article,
        widgetCount: widgets.length,
        promocodeCount: promocodes.length,
      },
      'Successfully fetched widget data'
    )
  } catch (error) {
    logger.error(
      {
        partner,
        article,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to fetch promocodes for widgets'
    )

    // Set error state for all widgets in this group
    widgets.forEach((widget) => {
      dataMap.set(widget.id, {
        widgetId: widget.id,
        type: widget.config.type,
        data: null,
        error: error instanceof Error ? error : new Error('Failed to fetch data'),
      })
    })
  }
}

/**
 * Helper to get typed widget data
 */
export function getPromocodeListData(
  widgetData: WidgetData
): { promocodes: Promocode[]; partner: unknown } | null {
  if (widgetData.type === 'promocode_list' && widgetData.data) {
    return widgetData.data as { promocodes: Promocode[]; partner: unknown }
  }
  return null
}

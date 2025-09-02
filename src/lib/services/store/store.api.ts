import 'server-only'
import { cache } from 'react'
import { env } from '@/config/env'
import { logger } from '@/lib/logging/logger'
import { ProductService } from '../product/product.service'
import type { ProductTransformer } from '../product/product.types'
import { PRODUCT_TYPES } from '../product/product.types'
import {
  StoreSchema,
  type IStoreApiService,
  type Store,
  type FetchStoreParams,
  type StoreResult,
  StoreNotFoundError,
} from './store.types'

// Constants for cache TTL
const STORE_CACHE_TTL = 86400 // 24 hours

/**
 * Transform API response item to store format
 */
const storeTransformer: ProductTransformer<Store> = (item: Record<string, unknown>): Store => {
  const result = (item.version && typeof item.version === 'object' ? item.version : {}) as Record<
    string,
    unknown
  >

  // Copy important fields from parent to version if not present
  if (!result.ecommerce_product_id && item.ecommerce_product_id) {
    result.ecommerce_product_id = item.ecommerce_product_id
  }
  if (!result.id && item.id) {
    result.id = item.id
  }
  if (!result.ecommerce_store_id && item.ecommerce_store_id) {
    result.ecommerce_store_id = item.ecommerce_store_id
  }
  if (!result.tags && item.tags) {
    result.tags = item.tags
  }

  // Map fields to match our store schema
  return {
    id: String(
      result.ecommerce_product_id || item.ecommerce_product_id || result.id || item.id || ''
    ),
    slug: String(result.slug || item.slug || ''),
    title: String(result.title || result.name || 'Untitled Store'),
    name: String(result.name || result.title || 'Untitled Store'),
    description: String(result.description || ''),
    tags: Array.isArray(result.tags) ? result.tags : Array.isArray(item.tags) ? item.tags : [],
    ecommerceStoreId:
      result.ecommerce_store_id || item.ecommerce_store_id
        ? String(result.ecommerce_store_id || item.ecommerce_store_id)
        : undefined,
    productType: PRODUCT_TYPES.STORE,
    publishedAt: String(result.published_at || result.created_at || new Date().toISOString()),
    status: result.status || item.status ? String(result.status || item.status) : undefined,
    images: (() => {
      const img = result.images || result.logo || result.image
      if (!img) return undefined
      if (Array.isArray(img)) return img.map(String)
      return String(img)
    })(),
    url:
      result.url || result.website || result.external_url
        ? String(result.url || result.website || result.external_url)
        : undefined,
  }
}

/**
 * Cache-wrapped internal function for fetching store details using ProductService
 */
const _fetchStore = cache(async ({ slug }: FetchStoreParams): Promise<Store | null> => {
  try {
    logger.info({ slug, productType: PRODUCT_TYPES.STORE }, 'Fetching store details')

    const response = await ProductService.productGet<Store>(
      slug,
      {
        type: PRODUCT_TYPES.STORE,
        withRich: true,
        ecommerceStoreId: env.PROMOCODE_ECOMMERCE_STORE_ID, // Using same store ID as articles
      },
      {
        revalidate: STORE_CACHE_TTL,
      },
      storeTransformer
    )

    if (!response.item) {
      logger.warn({ slug }, 'Store not found')
      return null
    }

    // Validate with schema
    try {
      const validatedStore = StoreSchema.parse(response.item)

      logger.info(
        {
          slug,
          storeName: validatedStore.name,
          storeId: validatedStore.id,
        },
        'Successfully fetched store'
      )

      return validatedStore
    } catch (validationError) {
      logger.error(
        {
          slug,
          error: validationError,
          response: JSON.stringify(response).slice(0, 500),
        },
        'Store validation failed'
      )

      return null
    }
  } catch (error) {
    logger.error(
      {
        slug,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to fetch store'
    )

    return null
  }
})

/**
 * Get store by slug with proper error handling
 */
export const getStoreBySlug = cache(async (slug: string): Promise<StoreResult> => {
  try {
    const store = await _fetchStore({ slug })

    if (!store) {
      return {
        success: false,
        error: new StoreNotFoundError(slug),
      }
    }

    return { success: true, data: store }
  } catch (error) {
    logger.error(
      {
        slug,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to get store by slug'
    )

    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
})

/**
 * Get list of stores
 */
export const getStores = cache(
  async (page: number = 1, pageSize: number = 20): Promise<StoreResult<Store[]>> => {
    try {
      const response = await ProductService.productList<Store>(
        {
          type: PRODUCT_TYPES.STORE,
          page,
          pageSize,
          ecommerceStoreId: env.ARTICLE_ECOMMERCE_STORE_ID,
        },
        { revalidate: STORE_CACHE_TTL },
        storeTransformer
      )

      if (!response.itemList || response.itemList.length === 0) {
        return { success: true, data: [] }
      }

      // Validate all stores
      const validatedStores = response.itemList
        .map((item) => {
          try {
            return StoreSchema.parse(item)
          } catch (error) {
            logger.error(
              {
                action: 'store_validation_failed',
                item: JSON.stringify(item).slice(0, 500),
                error: error instanceof Error ? error.message : 'Unknown validation error',
              },
              'Failed to validate store'
            )
            return null
          }
        })
        .filter((store): store is Store => store !== null)

      return { success: true, data: validatedStores }
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to fetch stores'
      )

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }
    }
  }
)

/**
 * Public API functions with Result pattern
 */

/**
 * Fetch store with Result pattern
 */
export const fetchStore = cache(async (params: FetchStoreParams): Promise<StoreResult> => {
  try {
    const store = await _fetchStore(params)

    if (!store) {
      return {
        success: false,
        error: new StoreNotFoundError(params.slug),
      }
    }

    return { success: true, data: store }
  } catch (error) {
    logger.error(
      {
        params,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to fetch store in API layer'
    )

    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
})

/**
 * Legacy implementation for backward compatibility
 * @deprecated Use the individual functions instead
 */
export const storeApiService: IStoreApiService = {
  fetchStore: _fetchStore,
}

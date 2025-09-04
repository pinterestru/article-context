import 'server-only'
import { cache } from 'react'
import { env } from '@/config/env'
import { logger } from '@/lib/logging/logger'
import { ProductService } from '../product/product.service'
import type { ProductTransformer } from '../product/product.types'
import { PRODUCT_TYPES } from '../product/product.types'
import { StoreSchema, type Store, type StoreResult, StoreNotFoundError } from './store.types'

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
 * Get store by slug with proper error handling
 */
export const getStoreBySlug = cache(async (slug: string): Promise<StoreResult> => {
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
      return {
        success: false,
        error: new StoreNotFoundError(slug),
      }
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

      return { success: true, data: validatedStore }
    } catch (validationError) {
      logger.error(
        {
          slug,
          error: validationError,
          response: JSON.stringify(response).slice(0, 500),
        },
        'Store validation failed'
      )

      return {
        success: false,
        error: new StoreNotFoundError(slug),
      }
    }
  } catch (error) {
    logger.error(
      {
        slug,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to fetch store'
    )

    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
})

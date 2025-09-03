import 'server-only'
import { cache } from 'react'
import { httpClient, APIError } from '@/lib/http/client'
import { env } from '@/config/env'
import { logger } from '@/lib/logging/logger'
import {
  ProductContentListResponseSchema,
  ProductContentResponseSchema,
  type IPromocodeApiService,
  type FetchPromocodeListParams,
  type Promocode,
  type ProductContent,
  type PromocodeExtended,
  type Result,
  PromocodeError,
  PromocodeNotFoundError,
} from './promocode.types'

// Constants for timeouts
const API_TIMEOUT = 10000 // 5 seconds

// Retry configuration for promocode API calls
const PROMOCODE_RETRY_CONFIG = {
  retries: 3,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 10000,
  shouldRetry: (error: unknown, attempt: number): boolean => {
    // Don't retry if we've exhausted attempts
    if (attempt <= 0) return false

    // Always retry on network errors and 5xx errors
    if (error instanceof Error && error.message.includes('fetch')) return true
    if (error instanceof APIError && error.status >= 500) return true

    // Don't retry on client errors (4xx)
    if (error instanceof APIError && error.status >= 400 && error.status < 500) return false

    return true
  },
}

/**
 * Cache-wrapped internal function for fetching promocode list
 */
const _fetchPromocodesList = cache(
  async (params: FetchPromocodeListParams): Promise<Promocode[]> => {
    const {
      partner,
      article,
      slug,
      slugs,
      count = 10,
      ecommerceStoreId: _ecommerceStoreId,
      withCode = true,
      random = false,
      mode = 'single',
    } = params

    const storeId = env.PROMOCODE_ECOMMERCE_STORE_ID

    // Build query parameters
    const searchParams = new URLSearchParams({
      ...(storeId && { ecommerce_store_id: storeId }),
      ...(slug && { slug }),
      ...(slugs && { slugs: slugs.join(',') }),
      ...(withCode && { with_code: 'true' }),
      ...(random && { random: 'true' }),
      mode,
      max: count.toString(),
    })

    const url = `${env.API_BASE_URL}/api/ecommerce_product_content_promocode_list?${searchParams}`

    try {
      logger.info(
        {
          partner,
          article,
          slug,
          count,
        },
        'Fetching promocode list'
      )

      const response = await httpClient<unknown>(url, {
        next: {
          revalidate: env.PROMOCODE_CACHE_TTL,
          tags: ['promocodes', ...(slug ? [`promocode-list:${slug}`] : [])],
        },
        timeout: API_TIMEOUT,
        retry: PROMOCODE_RETRY_CONFIG,
      })

      // Validate response
      const validatedResponse = ProductContentListResponseSchema.parse(response)

      // Transform product content to promocodes
      const promocodes = validatedResponse.item_list.map((item, index) => {
        const promocode = transformProductContentToPromocode(item, index)
        // Always mark first two promocodes as featured
        if (index < 2) {
          promocode.featured = true
        }
        return promocode
      })

      logger.info(
        {
          count: promocodes.length,
        },
        'Successfully fetched promocode list'
      )

      return promocodes
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          params,
        },
        'Failed to fetch promocode list'
      )

      return []
    }
  }
)

/**
 * Mask a promocode string
 */
function maskPromocode(code: string): string {
  if (code.length <= 5) {
    return code // Don't mask very short codes
  }
  return `${code.slice(0, 3)}***${code.slice(-2)}`
}

/**
 * Transform product content to promocode
 */
function transformProductContentToPromocode(
  productContent: ProductContent,
  index: number = 0,
  shouldMaskCode: boolean = true
): PromocodeExtended {
  // Build target URL
  let targetUrl = productContent.link || '#'
  if (productContent.link_query_params) {
    targetUrl += `?${productContent.link_query_params}`
  }

  const code = shouldMaskCode ? maskPromocode(productContent.content) : productContent.content

  return {
    id: productContent.ecommerce_product_content_id,
    code,
    discount: extractDiscount(productContent.title),
    description: productContent.description || productContent.title,
    targetUrl,
    expirationDate: productContent.expired_at ? new Date(productContent.expired_at) : undefined,
    expiresAt: productContent.expired_at,
    tags: mapTypeToTags(productContent.type),
    featured: productContent.featured || false,
    maskCode: shouldMaskCode,
    requiresEmail: false,
    partner: productContent.ecommerce_product_id,
    storeLabel: productContent.store_name,
    storeLogo: productContent.images,
    priority: index,
    originalCode: shouldMaskCode ? productContent.content : undefined, // Store original code if masked
    slug: productContent.slug, // Map the slug field from API response
  }
}

/**
 * Extract discount from title
 */
function extractDiscount(title: string): string {
  // Try to extract percentage or dollar amount from title
  const percentMatch = title.match(/(\d+)%/)
  if (percentMatch) return `${percentMatch[1]}%`

  const dollarMatch = title.match(/\$(\d+)/)
  if (dollarMatch) return `$${dollarMatch[1]}`

  return 'Special Offer'
}

/**
 * Map product type to tags
 */
function mapTypeToTags(type?: string): Array<'gift' | 'discount' | 'promocode' | 'other'> {
  if (!type) return ['promocode']

  const lowerType = type.toLowerCase()
  if (lowerType.includes('gift')) return ['gift']
  if (lowerType.includes('discount') || lowerType.includes('sale')) return ['discount']
  if (lowerType.includes('promo') || lowerType.includes('code')) return ['promocode']
  return ['other']
}

/**
 * Cache-wrapped internal function for fetching single promocode by ID
 */
const _fetchPromocodeById = cache(async (id: string): Promise<Promocode | null> => {
  try {
    logger.info({ id }, 'Fetching promocode by ID')

    const response = await httpClient<unknown>(
      `${env.API_BASE_URL}/api/ecommerce_product_content_get?ecommerce_product_content_id=${id}`,
      {
        next: {
          revalidate: env.PROMOCODE_CACHE_TTL,
          tags: ['promocodes', `promocode:${id}`],
        },
        timeout: API_TIMEOUT,
        retry: PROMOCODE_RETRY_CONFIG,
      }
    )

    // Validate response
    const validatedResponse = ProductContentResponseSchema.parse(response)

    if (!validatedResponse.item || !validatedResponse.item.ecommerce_product_content_id) {
      logger.warn({ id }, 'Promocode not found')
      return null
    }

    // Transform to promocode
    const promocode = transformProductContentToPromocode(validatedResponse.item, 0, false)

    logger.info(
      {
        id,
        code: promocode.code,
      },
      'Successfully fetched promocode'
    )

    return promocode
  } catch (error) {
    logger.error(
      {
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to fetch promocode by ID'
    )

    return null
  }
})

/**
 * Public API functions with Result pattern
 */

/**
 * Fetch promocode list with Result pattern
 */
export const fetchPromocodesList = cache(
  async (params: FetchPromocodeListParams): Promise<Result<Promocode[]>> => {
    try {
      const promocodes = await _fetchPromocodesList(params)
      return { success: true, data: promocodes }
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          params,
        },
        'Failed to fetch promocode list in API layer'
      )

      return {
        success: false,
        error:
          error instanceof Error ? error : new PromocodeError('Failed to fetch promocode list'),
      }
    }
  }
)

/**
 * Fetch single promocode by ID with Result pattern
 */
export const fetchPromocodeById = cache(async (id: string): Promise<Result<Promocode>> => {
  try {
    const promocode = await _fetchPromocodeById(id)

    if (!promocode) {
      return {
        success: false,
        error: new PromocodeNotFoundError(id),
      }
    }

    return { success: true, data: promocode }
  } catch (error) {
    logger.error(
      {
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to fetch promocode by ID in API layer'
    )

    return {
      success: false,
      error: error instanceof Error ? error : new PromocodeError('Failed to fetch promocode'),
    }
  }
})

/**
 * Legacy implementation for backward compatibility
 * @deprecated Use the individual functions instead
 */
export const promocodeApiService: IPromocodeApiService = {
  fetchPromocodesList: _fetchPromocodesList,
  fetchPromocodeById: _fetchPromocodeById,
}

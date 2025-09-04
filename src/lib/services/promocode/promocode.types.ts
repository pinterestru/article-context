import { z } from 'zod'

/**
 * Result type for consistent error handling
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }

/**
 * Custom error types for promocode service
 */
export class PromocodeError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'PromocodeError'
  }
}

export class PromocodeNotFoundError extends PromocodeError {
  constructor(id: string) {
    super(`Promocode with id "${id}" not found`, 'NOT_FOUND')
    this.name = 'PromocodeNotFoundError'
  }
}

export class PromocodeValidationError extends PromocodeError {
  constructor(message: string, public zodError?: unknown) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'PromocodeValidationError'
  }
}

/**
 * Schema for base promocode (minimal fields)
 */
export const PromocodeBaseSchema = z.object({
  id: z.string(),
  code: z.string(),
  discount: z.string(), // e.g., "20%", "$10"
  description: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  terms: z.array(z.string()).optional(),
  variant: z.string().optional(), // A/B test variant
  priority: z.number().optional(),
})

/**
 * Schema for extended promocode (includes all widget fields)
 */
export const PromocodeExtendedSchema = PromocodeBaseSchema.extend({
  targetUrl: z.string().default('#'),
  expirationDate: z.date().optional(),
  tags: z.array(z.enum(['gift', 'discount', 'promocode', 'other'])).optional(),
  featured: z.boolean().default(false),
  maskCode: z.boolean().default(false),
  requiresEmail: z.boolean().default(false),
  telegramLink: z.string().optional(),
  clickId: z.string().optional(),
  partner: z.string().optional(),
  storeLabel: z.string().optional(),
  storeLogo: z.string().optional(),
  originalCode: z.string().optional(), // Store the original unmasked code
  slug: z.string().optional(),
})

/**
 * Schema for product content API response
 */
export const ProductContentSchema = z.object({
  ecommerce_product_content_id: z.string(),
  ecommerce_product_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  content: z.string(), // The actual promocode
  link: z.string().optional(),
  link_query_params: z.string().optional(),
  images: z.string().optional(), // Changed from array to string based on API response
  type: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.string().optional(),
  expired_at: z.string().optional(),
  store_name: z.string().optional(), // Added from API response
  slug: z.string().optional(), // Added from API response
})

/**
 * Schema for product content list API response
 */
export const ProductContentListResponseSchema = z.object({
  item_list: z.array(ProductContentSchema),
  message: z.string().optional(),
  status: z.string().optional(),
})

/**
 * Schema for single product content API response
 */
export const ProductContentResponseSchema = z.object({
  item: ProductContentSchema,
  message: z.string().optional(),
  status: z.string().optional(),
})

/**
 * TypeScript types inferred from schemas
 */
export type PromocodeBase = z.infer<typeof PromocodeBaseSchema>
export type PromocodeExtended = z.infer<typeof PromocodeExtendedSchema>
export type Promocode = PromocodeExtended // Default to extended type
export type ProductContent = z.infer<typeof ProductContentSchema>
export type ProductContentListResponse = z.infer<typeof ProductContentListResponseSchema>
export type ProductContentResponse = z.infer<typeof ProductContentResponseSchema>

/**
 * Parameters for fetching promocode list (widget query)
 */
export interface FetchPromocodeListParams {
  partner?: string
  article?: string
  slug?: string
  slugs?: string[]
  count?: number
  ecommerceStoreId?: string
  withCode?: boolean
  random?: boolean
  mode?: 'single' | 'multiple'
}

/**
 * Fallback promocode data for error cases
 */
export const FALLBACK_PROMOCODES: Promocode[] = [
  {
    id: 'fallback-1',
    code: 'WELCOME10',
    discount: '10%',
    description: 'Get 10% off your first order',
    priority: 1,
    targetUrl: '#',
    featured: false,
    maskCode: false,
    requiresEmail: false,
  },
]


import { z } from 'zod'

// Product type constants
export const PRODUCT_TYPES = {
  ARTICLE: 'article',
  STORE: 'store',
  // Add more product types as needed
} as const

export type ProductType = typeof PRODUCT_TYPES[keyof typeof PRODUCT_TYPES]

// Base product interface - common fields across all product types
export interface BaseProduct {
  id: string
  slug: string
  title: string
  description: string
  tags: string[]
  ecommerceStoreId?: string
  productType: ProductType
  publishedAt?: string
  status?: string
}

// Generic filters for product queries
export interface ProductFilters {
  slug?: string
  slugs?: string[]
  status?: string
  tag?: string
  tags?: string[]
  type?: ProductType
  search?: string
  page?: number
  pageSize?: number
  limit?: number
  ecommerceStoreId?: string
  withRich?: boolean
  excludeFields?: string[]
  includeFields?: string[]
}

// Options for product queries
export interface ProductOptions {
  revalidate?: number
  asValue?: boolean
}

// Response types
export interface ProductListResponse<T = BaseProduct> {
  itemList: T[]
  itemTotal: number
  page?: number
  pageTotal: number
  message?: string
  status?: number
}

export interface ProductResponse<T = BaseProduct> {
  item: T
  message?: string
  status?: number
}

// Error types
export class ProductNotFoundError extends Error {
  constructor(identifier: string, productType: ProductType) {
    super(`${productType} not found: ${identifier}`)
    this.name = 'ProductNotFoundError'
  }
}

export class ProductValidationError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'ProductValidationError'
    this.cause = cause
  }
}

// Result type for API operations
export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error }

// Elasticsearch response schema
export const elasticSearchResponseSchema = z.object({
  item_list: z.array(z.record(z.string(), z.unknown())).optional(),
  size: z.number().optional(),
  message: z.string().optional(),
  status: z.number().optional(),
})

// Transform function type for converting raw API response to specific product type
export type ProductTransformer<T> = (item: Record<string, unknown>) => T
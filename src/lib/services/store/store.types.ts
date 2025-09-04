import { z } from 'zod'
import type { BaseProduct } from '../product/product.types'

/**
 * Custom error types for store service
 */
export class StoreError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'StoreError'
  }
}

export class StoreNotFoundError extends StoreError {
  constructor(slug: string) {
    super(`Store with slug "${slug}" not found`, 'NOT_FOUND')
    this.name = 'StoreNotFoundError'
  }
}

export class StoreValidationError extends StoreError {
  constructor(
    message: string,
    public zodError?: unknown
  ) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'StoreValidationError'
  }
}

/**
 * Store extends BaseProduct with store-specific fields
 */
export interface Store extends Omit<BaseProduct, 'productType'> {
  name: string
  images?: string | string[]
  url?: string
  productType: 'store'
}

/**
 * Schema for store
 */
export const StoreSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(), // Maps to name for consistency with BaseProduct
  name: z.string(),
  images: z.union([z.string(), z.array(z.string())]).optional(),
  description: z.string(),
  url: z.string().optional(),
  tags: z.array(z.string()),
  ecommerceStoreId: z.string().optional(),
  productType: z.literal('store'),
  publishedAt: z.string().optional(),
  status: z.string().optional(),
})

/**
 * Schema for store API response
 */
export const StoreResponseSchema = z.object({
  item: StoreSchema,
  message: z.string().optional(),
  status: z.string().optional(),
})

/**
 * TypeScript types inferred from schemas
 */
export type StoreResponse = z.infer<typeof StoreResponseSchema>

/**
 * Result type for store operations
 */
export type StoreResult<T = Store> = { success: true; data: T } | { success: false; error: Error }

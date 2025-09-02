import 'server-only'
import { cache } from 'react'
import type { z } from 'zod'
import { ProductService } from './product.service'
import type {
  BaseProduct,
  ProductFilters,
  ProductOptions,
  ProductTransformer,
  Result,
  ProductType,
} from './product.types'
import { ProductNotFoundError, ProductValidationError } from './product.types'
import { logger } from '@/lib/logging/logger'

/**
 * Generic function to get a product by slug
 */
export function createGetProductBySlug<T extends BaseProduct>(
  productType: ProductType,
  schema: z.ZodType<T>,
  transformer: ProductTransformer<T>,
  defaultCacheTTL: number = 3600
) {
  return cache(async (slug: string, options?: ProductOptions): Promise<Result<T>> => {
    try {
      const response = await ProductService.productGet(
        slug,
        { type: productType },
        { revalidate: options?.revalidate || defaultCacheTTL },
        transformer
      )

      if (!response.item) {
        return {
          success: false,
          error: new ProductNotFoundError(slug, productType),
        }
      }

      try {
        const validatedProduct = schema.parse(response.item)

        logger.info(
          {
            slug,
            productId: validatedProduct.id,
            productType,
          },
          'Successfully fetched product'
        )

        return { success: true, data: validatedProduct }
      } catch (zodError) {
        logger.error(
          {
            slug,
            productType,
            error: zodError,
          },
          'Product validation error'
        )

        return {
          success: false,
          error: new ProductValidationError('Invalid product data received from API', zodError),
        }
      }
    } catch (error) {
      logger.error(
        {
          slug,
          productType,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to fetch product'
      )

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }
    }
  })
}

/**
 * Generic function to get a list of products
 */
export function createGetProducts<T extends BaseProduct>(
  productType: ProductType,
  schema: z.ZodType<T>,
  transformer: ProductTransformer<T>,
  defaultCacheTTL: number = 3600
) {
  return cache(
    async (
      filters: Omit<ProductFilters, 'type'> = {},
      options?: ProductOptions
    ): Promise<Result<T[]>> => {
      try {
        const response = await ProductService.productList(
          { ...filters, type: productType },
          { revalidate: options?.revalidate || defaultCacheTTL },
          transformer
        )

        if (!response.itemList || response.itemList.length === 0) {
          return { success: true, data: [] }
        }

        // Validate all products
        const validatedProducts = response.itemList
          .map((item) => {
            try {
              return schema.parse(item)
            } catch (error) {
              logger.error(
                {
                  action: 'product_validation_failed',
                  productType,
                  item: JSON.stringify(item).slice(0, 500),
                  error: error instanceof Error ? error.message : 'Unknown validation error',
                },
                'Failed to validate product'
              )
              return null
            }
          })
          .filter((product): product is T => product !== null)

        return { success: true, data: validatedProducts }
      } catch (error) {
        logger.error(
          {
            productType,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Failed to fetch products'
        )

        return {
          success: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        }
      }
    }
  )
}

/**
 * Generic function to search products
 */
export function createSearchProducts<T extends BaseProduct>(
  productType: ProductType,
  schema: z.ZodType<T>,
  transformer: ProductTransformer<T>,
  defaultCacheTTL: number = 3600
) {
  return cache(
    async (
      query: string,
      filters: Omit<ProductFilters, 'type' | 'search'> = {},
      options?: ProductOptions
    ): Promise<Result<T[]>> => {
      try {
        const response = await ProductService.searchProducts(
          query,
          { ...filters, type: productType },
          { revalidate: options?.revalidate || defaultCacheTTL },
          transformer
        )

        if (!response.itemList) {
          return { success: true, data: [] }
        }

        const validatedProducts = response.itemList
          .map((item) => {
            try {
              return schema.parse(item)
            } catch (error) {
              logger.error(
                {
                  action: 'product_validation_failed',
                  productType,
                  item: JSON.stringify(item).slice(0, 500),
                  error: error instanceof Error ? error.message : 'Unknown validation error',
                },
                'Failed to validate product'
              )
              return null
            }
          })
          .filter((product): product is T => product !== null)

        return { success: true, data: validatedProducts }
      } catch (error) {
        logger.error(
          {
            query,
            productType,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Failed to search products'
        )

        return {
          success: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        }
      }
    }
  )
}

/**
 * Generic function to get products by tag
 */
export function createGetProductsByTag<T extends BaseProduct>(
  productType: ProductType,
  schema: z.ZodType<T>,
  transformer: ProductTransformer<T>,
  defaultCacheTTL: number = 3600
) {
  return cache(
    async (
      tag: string,
      filters: Omit<ProductFilters, 'type' | 'tag'> = {},
      options?: ProductOptions
    ): Promise<Result<T[]>> => {
      try {
        const response = await ProductService.getProductsByTag(
          tag,
          { ...filters, type: productType },
          { revalidate: options?.revalidate || defaultCacheTTL },
          transformer
        )

        if (!response.itemList) {
          return { success: true, data: [] }
        }

        const validatedProducts = response.itemList
          .map((item) => {
            try {
              return schema.parse(item)
            } catch (error) {
              logger.error(
                {
                  action: 'product_validation_failed',
                  productType,
                  item: JSON.stringify(item).slice(0, 500),
                  error: error instanceof Error ? error.message : 'Unknown validation error',
                },
                'Failed to validate product'
              )
              return null
            }
          })
          .filter((product): product is T => product !== null)

        return { success: true, data: validatedProducts }
      } catch (error) {
        logger.error(
          {
            tag,
            productType,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Failed to fetch products by tag'
        )

        return {
          success: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        }
      }
    }
  )
}

/**
 * Generic function to get featured products
 */
export function createGetFeaturedProducts<T extends BaseProduct>(
  productType: ProductType,
  schema: z.ZodType<T>,
  transformer: ProductTransformer<T>,
  defaultCacheTTL: number = 3600
) {
  return cache(
    async (
      limit: number = 10,
      filters: Omit<ProductFilters, 'type'> = {},
      options?: ProductOptions
    ): Promise<Result<T[]>> => {
      try {
        const response = await ProductService.getFeaturedProducts(
          limit,
          { ...filters, type: productType },
          { revalidate: options?.revalidate || defaultCacheTTL },
          transformer
        )

        if (!response.itemList) {
          return { success: true, data: [] }
        }

        const validatedProducts = response.itemList
          .map((item) => {
            try {
              return schema.parse(item)
            } catch (error) {
              logger.error(
                {
                  action: 'product_validation_failed',
                  productType,
                  item: JSON.stringify(item).slice(0, 500),
                  error: error instanceof Error ? error.message : 'Unknown validation error',
                },
                'Failed to validate product'
              )
              return null
            }
          })
          .filter((product): product is T => product !== null)

        logger.info(
          {
            count: validatedProducts.length,
            limit,
            productType,
          },
          'Featured products fetched'
        )

        return { success: true, data: validatedProducts }
      } catch (error) {
        logger.error(
          {
            productType,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Failed to fetch featured products'
        )

        return {
          success: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        }
      }
    }
  )
}

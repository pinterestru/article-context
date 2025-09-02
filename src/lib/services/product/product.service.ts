import 'server-only'
import { cache } from 'react'
import { httpClient } from '@/lib/http/client'
import { env } from '@/config/env'
import { logger } from '@/lib/logging/logger'
import type {
  ProductFilters,
  ProductOptions,
  ProductListResponse,
  ProductResponse,
  BaseProduct,
  ProductTransformer,
  ProductType,
} from './product.types'
import { elasticSearchResponseSchema, PRODUCT_TYPES } from './product.types'

// Elasticsearch query types
interface ElasticsearchQuery {
  from?: number
  size: number
  sort: Array<Record<string, unknown>>
  _source: {
    includes?: string[]
    excludes?: string[]
  }
  query: {
    bool: {
      filter: Array<Record<string, unknown>>
      must_not: Array<Record<string, unknown>>
    }
  }
  [key: string]: unknown // Allow additional properties
}

class ProductService {
  /**
   * Build Elasticsearch query for products
   */
  private static buildQuery(filters: ProductFilters): ElasticsearchQuery {
    const {
      slug,
      slugs,
      status = 'published',
      tag,
      tags,
      type,
      search,
      page,
      pageSize = 20,
      limit,
      ecommerceStoreId,
      withRich,
      excludeFields,
      includeFields,
    } = filters

    const size = limit || pageSize
    const from = page ? (page - 1) * pageSize : undefined

    const query: ElasticsearchQuery = {
      from,
      size,
      sort: [
        {
          'search_data.number_dynamic.value': {
            missing: '_last',
            mode: 'avg',
            order: 'desc',
            nested: {
              path: 'search_data.number_dynamic',
              filter: {
                term: {
                  'search_data.number_dynamic.name': 'position_boost|default',
                },
              },
            },
          },
        },
      ],
      _source: {
        includes: includeFields || ['search_result_data'],
      },
      query: {
        bool: {
          filter: [],
          must_not: [{ term: { 'hidden.id_list': 'default' } }],
        },
      },
    }

    // Add filters
    if (slug) {
      query.query.bool.filter.push({
        bool: {
          should: [
            { term: { 'search_data.slug': slug } },
            { term: { 'search_data.ecommerce_product_id': slug } },
          ],
        },
      })
    }

    if (slugs && slugs.length > 0) {
      query.query.bool.filter.push({
        bool: {
          should: [
            { terms: { 'search_data.slug': slugs } },
            { terms: { 'search_data.ecommerce_product_id': slugs } },
          ],
        },
      })
    }

    if (status) {
      query.query.bool.filter.push({
        bool: {
          should: [
            { term: { 'search_data.status': '' } },
            { term: { 'search_data.status': status } },
          ],
        },
      })
    }

    // Filter by product type if specified
    if (type) {
      query.query.bool.filter.push({
        term: { 'search_data.product_type': type },
      })
    }

    if (tag) {
      query.query.bool.filter.push({ term: { 'search_data.tags': tag } })
    }

    if (tags && tags.length > 0) {
      query.query.bool.filter.push({ terms: { 'search_data.tags': tags } })
    }

    if (ecommerceStoreId) {
      query.query.bool.filter.push({
        term: {
          'search_data.ecommerce_store_id': ecommerceStoreId,
        },
      })
    }

    if (search) {
      query.query.bool.filter.push({
        query_string: {
          query: `*${search.toLowerCase().replace('%', '')}*`,
          default_field: 'search_data.full_text',
        },
      })
    }

    // Handle source includes/excludes
    if (!withRich && !includeFields) {
      query._source.excludes = [
        '*.article_body',
        '*.description_rich',
        '*.source_article_body',
        '*.source_description_rich',
        '*.article_status_flow',
        '*.google_serp',
        '*.google_paa',
        '*.yandex_serp',
        '*.serp_content',
        '*.article_outline',
      ]
    }

    if (excludeFields) {
      query._source.excludes = (query._source.excludes || []).concat(excludeFields)
    }

    if (includeFields) {
      query._source.includes = includeFields
    }

    return query
  }

  /**
   * Default transformer that extracts common fields
   */
  private static defaultTransformer: ProductTransformer<BaseProduct> = (
    item: Record<string, unknown>
  ): BaseProduct => {
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

    return {
      id: String(
        result.ecommerce_product_id || item.ecommerce_product_id || result.id || item.id || ''
      ),
      slug: String(result.slug || item.slug || ''),
      title: String(result.title || result.name || 'Untitled'),
      description: String(result.description || ''),
      tags: Array.isArray(result.tags) ? result.tags : Array.isArray(item.tags) ? item.tags : [],
      ecommerceStoreId:
        result.ecommerce_store_id || item.ecommerce_store_id
          ? String(result.ecommerce_store_id || item.ecommerce_store_id)
          : undefined,
      productType: (result.product_type ||
        item.product_type ||
        PRODUCT_TYPES.ARTICLE) as ProductType,
      publishedAt: String(result.published_at || result.created_at || new Date().toISOString()),
      status: result.status || item.status ? String(result.status || item.status) : undefined,
    }
  }

  /**
   * Fetch list of products with filters
   */
  static productList = cache(
    async <T = BaseProduct>(
      filters: ProductFilters = {},
      options: ProductOptions = {},
      transformer?: ProductTransformer<T>
    ): Promise<ProductListResponse<T>> => {
      const startTime = Date.now()
      const productType = filters.type || 'unknown'

      try {
        const query = this.buildQuery(filters)
        const queryString = encodeURIComponent(JSON.stringify(query))
        const url = `${env.API_BASE_URL}/api/ecommerce_product_view_list?is_search=true&postprocess=default&query=${queryString}`

        logger.info(
          {
            action: 'product_list_request',
            productType,
            filters,
            url: url.substring(0, 200), // Log first 200 chars of URL
          },
          'Fetching product list'
        )

        const response = await httpClient<Record<string, unknown>>(url, {
          next: {
            revalidate: options.revalidate || 3600, // 1 hour default
            tags: ['products', productType, ...(filters.tag ? [`tag-${filters.tag}`] : [])],
          },
        })

        const parseResult = elasticSearchResponseSchema.safeParse(response)

        if (!parseResult.success) {
          logger.error(
            {
              action: 'schema_parse_error',
              productType,
              error: parseResult.error.message,
              errors: parseResult.error.issues,
              response: JSON.stringify(response).substring(0, 500),
            },
            'Failed to parse response with schema'
          )
          throw new Error(`Invalid API response: ${parseResult.error.message}`)
        }

        const validated = parseResult.data

        if (!validated.item_list) {
          return {
            itemList: [],
            itemTotal: 0,
            page: filters.page || 1,
            pageTotal: 0,
            message: validated.message,
            status: validated.status,
          }
        }

        const transformFn = transformer || (this.defaultTransformer as ProductTransformer<T>)
        const itemList = validated.item_list.map((item) => transformFn(item))
        const itemTotal = validated.size || 0
        const pageSize = filters.pageSize || 20
        const pageTotal = Math.ceil(itemTotal / pageSize)

        logger.info(
          {
            action: 'product_list_success',
            productType,
            itemCount: itemList.length,
            itemTotal,
            duration: Date.now() - startTime,
          },
          'Product list fetched successfully'
        )

        return {
          itemList: options.asValue ? itemList : itemList,
          itemTotal,
          page: filters.page || 1,
          pageTotal,
          message: validated.message,
          status: validated.status,
        }
      } catch (error) {
        logger.error(
          {
            action: 'product_list_error',
            productType,
            error: error instanceof Error ? error.message : 'Unknown error',
            filters,
          },
          'Failed to fetch product list'
        )

        throw error
      }
    }
  )

  /**
   * Get single product by slug
   */
  static productGet = cache(
    async <T = BaseProduct>(
      slug: string,
      filters: Omit<ProductFilters, 'slug'> = {},
      options: ProductOptions = {},
      transformer?: ProductTransformer<T>
    ): Promise<ProductResponse<T>> => {
      const { itemList, message, status } = await this.productList(
        { ...filters, slug, withRich: true },
        options,
        transformer
      )

      const item = itemList[0] || null

      return { item: item as T, message, status }
    }
  )

  /**
   * Search products
   */
  static async searchProducts<T = BaseProduct>(
    query: string,
    filters: Omit<ProductFilters, 'search'> = {},
    options: ProductOptions = {},
    transformer?: ProductTransformer<T>
  ): Promise<ProductListResponse<T>> {
    return this.productList({ ...filters, search: query }, options, transformer)
  }

  /**
   * Get products by tag
   */
  static async getProductsByTag<T = BaseProduct>(
    tag: string,
    filters: Omit<ProductFilters, 'tag'> = {},
    options: ProductOptions = {},
    transformer?: ProductTransformer<T>
  ): Promise<ProductListResponse<T>> {
    return this.productList({ ...filters, tag }, options, transformer)
  }

  /**
   * Get featured products (with position boost)
   */
  static async getFeaturedProducts<T = BaseProduct>(
    limit: number = 10,
    filters: ProductFilters = {},
    options: ProductOptions = {},
    transformer?: ProductTransformer<T>
  ): Promise<ProductListResponse<T>> {
    return this.productList({ ...filters, limit, page: 1 }, options, transformer)
  }
}

export { ProductService }

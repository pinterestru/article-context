import 'server-only'
import { cache } from 'react'
import { env } from '@/config/env'
import type { Article } from './article.types'
import { ProductService } from '../product/product.service'
import type { ProductTransformer } from '../product/product.types'
import { PRODUCT_TYPES } from '../product/product.types'

// Import types from product service
import type {
  ProductFilters,
  ProductOptions,
  ProductListResponse,
  ProductResponse,
} from '../product/product.types'

// Re-export types for backward compatibility
export type ArticleFilters = Omit<ProductFilters, 'type'>
export type ArticleOptions = ProductOptions
export type ArticleListResponse = ProductListResponse<Article>
export type ArticleResponse = ProductResponse<Article>

class ArticleService {
  /**
   * Transform API response item to article format
   */
  private static articleTransformer: ProductTransformer<Article> = (
    item: Record<string, unknown>
  ): Article => {
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

    // Extract excerpt from article body if not provided
    let excerpt = String(result.excerpt || result.description || '')
    if (!excerpt && result.article_body) {
      // Strip HTML and get first 200 characters
      const textContent = String(result.article_body)
        .replace(/<[^>]*>/g, '')
        .trim()
      excerpt = textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent
    }

    // Map fields to match our article schema
    return {
      id: String(
        result.ecommerce_product_id || item.ecommerce_product_id || result.id || item.id || ''
      ),
      slug: String(result.slug || item.slug || ''),
      title: String(result.title || result.name || 'Untitled Article'),
      content: String(result.article_body || result.description || ''),
      excerpt: excerpt,
      author: String(result.author || 'Editorial Team'),
      publishedAt: String(result.published_at || result.created_at || new Date().toISOString()),
      tags: Array.isArray(result.tags) ? result.tags : Array.isArray(item.tags) ? item.tags : [],
      ecommerceStoreId:
        result.ecommerce_store_id || item.ecommerce_store_id
          ? String(result.ecommerce_store_id || item.ecommerce_store_id)
          : undefined,
    }
  }

  /**
   * Fetch list of articles with filters
   */
  static articleList = cache(
    async (
      filters: ArticleFilters = {},
      options: ArticleOptions = {}
    ): Promise<ArticleListResponse> => {
      const productFilters = {
        ...filters,
        type: PRODUCT_TYPES.ARTICLE,
        ecommerceStoreId: filters.ecommerceStoreId || env.ARTICLE_ECOMMERCE_STORE_ID,
      }

      return ProductService.productList<Article>(productFilters, options, this.articleTransformer)
    }
  )

  /**
   * Get single article by slug
   */
  static articleGet = cache(
    async (
      slug: string,
      filters: Omit<ArticleFilters, 'slug'> = {},
      options: ArticleOptions = {}
    ): Promise<ArticleResponse> => {
      const productFilters = {
        ...filters,
        type: PRODUCT_TYPES.ARTICLE,
        ecommerceStoreId: filters.ecommerceStoreId || env.ARTICLE_ECOMMERCE_STORE_ID,
      }

      return ProductService.productGet<Article>(
        slug,
        productFilters,
        options,
        this.articleTransformer
      )
    }
  )

  /**
   * Search articles
   */
  static async searchArticles(
    query: string,
    filters: Omit<ArticleFilters, 'search'> = {},
    options: ArticleOptions = {}
  ): Promise<ArticleListResponse> {
    const productFilters = {
      ...filters,
      type: PRODUCT_TYPES.ARTICLE,
      ecommerceStoreId: filters.ecommerceStoreId || env.ARTICLE_ECOMMERCE_STORE_ID,
    }

    return ProductService.searchProducts<Article>(
      query,
      productFilters,
      options,
      this.articleTransformer
    )
  }

  /**
   * Get articles by tag
   */
  static async getArticlesByTag(
    tag: string,
    filters: Omit<ArticleFilters, 'tag'> = {},
    options: ArticleOptions = {}
  ): Promise<ArticleListResponse> {
    const productFilters = {
      ...filters,
      type: PRODUCT_TYPES.ARTICLE,
      ecommerceStoreId: filters.ecommerceStoreId || env.ARTICLE_ECOMMERCE_STORE_ID,
    }

    return ProductService.getProductsByTag<Article>(
      tag,
      productFilters,
      options,
      this.articleTransformer
    )
  }

  /**
   * Get featured articles (with position boost)
   */
  static async getFeaturedArticles(
    limit: number = 10,
    filters: ArticleFilters = {},
    options: ArticleOptions = {}
  ): Promise<ArticleListResponse> {
    const productFilters = {
      ...filters,
      type: PRODUCT_TYPES.ARTICLE,
      ecommerceStoreId: filters.ecommerceStoreId || env.ARTICLE_ECOMMERCE_STORE_ID,
    }

    return ProductService.getFeaturedProducts<Article>(
      limit,
      productFilters,
      options,
      this.articleTransformer
    )
  }
}

export { ArticleService }

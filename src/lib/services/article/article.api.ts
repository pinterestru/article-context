import 'server-only'
import { cache } from 'react'
import type { Article } from '@/types/article'
import type { Result } from './article.types'
import { ArticleNotFoundError, ArticleValidationError, articleSchema } from './article.types'
import { ArticleService } from './article.service'
import { logger } from '@/lib/logging/logger'
import { env } from '@/config/env'

export const getArticleBySlug = cache(async (slug: string): Promise<Result<Article>> => {
  try {
    const response = await ArticleService.articleGet(
      slug,
      {},
      { revalidate: env.ARTICLE_CACHE_TTL }
    )

    if (!response.item) {
      return {
        success: false,
        error: new ArticleNotFoundError(slug),
      }
    }

    try {
      // Validate the response matches our schema
      const validatedArticle = articleSchema.parse(response.item)

      logger.info(
        {
          slug,
          articleId: validatedArticle.id,
        },
        'Successfully fetched article'
      )

      return { success: true, data: validatedArticle }
    } catch (zodError) {
      logger.error(
        {
          slug,
          error: zodError,
        },
        'Article validation error'
      )

      return {
        success: false,
        error: new ArticleValidationError('Invalid article data received from API', zodError),
      }
    }
  } catch (error) {
    logger.error(
      {
        slug,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to fetch article'
    )

    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
})

/**
 * Get a list of articles with pagination
 */
export const getArticles = cache(
  async (page: number = 1, pageSize: number = 20): Promise<Result<Article[]>> => {
    try {
      const response = await ArticleService.articleList(
        { page, pageSize },
        { revalidate: env.ARTICLE_CACHE_TTL }
      )

      if (!response.itemList || response.itemList.length === 0) {
        return { success: true, data: [] }
      }

      // Validate all articles
      const validatedArticles = response.itemList
        .map((item) => {
          try {
            return articleSchema.parse(item)
          } catch (error) {
            logger.error(
              {
                action: 'article_validation_failed',
                item: JSON.stringify(item).slice(0, 500),
                error: error instanceof Error ? error.message : 'Unknown validation error',
              },
              'Failed to validate article'
            )
            return null
          }
        })
        .filter((article): article is Article => article !== null)

      return { success: true, data: validatedArticles }
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to fetch articles'
      )

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }
    }
  }
)

/**
 * Search articles
 */
export const searchArticles = cache(
  async (query: string, page: number = 1, pageSize: number = 20): Promise<Result<Article[]>> => {
    try {
      const response = await ArticleService.searchArticles(
        query,
        { page, pageSize },
        { revalidate: 3600 }
      )

      if (!response.itemList) {
        return { success: true, data: [] }
      }

      const validatedArticles = response.itemList
        .map((item) => {
          try {
            return articleSchema.parse(item)
          } catch (error) {
            logger.error(
              {
                action: 'article_validation_failed',
                item: JSON.stringify(item).slice(0, 500),
                error: error instanceof Error ? error.message : 'Unknown validation error',
              },
              'Failed to validate article'
            )
            return null
          }
        })
        .filter((article): article is Article => article !== null)

      return { success: true, data: validatedArticles }
    } catch (error) {
      logger.error(
        {
          query,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to search articles'
      )

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }
    }
  }
)

/**
 * Get articles by tag
 */
export const getArticlesByTag = cache(
  async (tag: string, page: number = 1, pageSize: number = 20): Promise<Result<Article[]>> => {
    try {
      const response = await ArticleService.getArticlesByTag(
        tag,
        { page, pageSize },
        { revalidate: 3600 }
      )

      if (!response.itemList) {
        return { success: true, data: [] }
      }

      const validatedArticles = response.itemList
        .map((item) => {
          try {
            return articleSchema.parse(item)
          } catch (error) {
            logger.error(
              {
                action: 'article_validation_failed',
                item: JSON.stringify(item).slice(0, 500),
                error: error instanceof Error ? error.message : 'Unknown validation error',
              },
              'Failed to validate article'
            )
            return null
          }
        })
        .filter((article): article is Article => article !== null)

      return { success: true, data: validatedArticles }
    } catch (error) {
      logger.error(
        {
          tag,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        'Failed to fetch articles by tag'
      )

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }
    }
  }
)

/**
 * Get featured articles for homepage
 */
export const getFeaturedArticles = cache(async (limit: number = 10): Promise<Result<Article[]>> => {
  try {
    const response = await ArticleService.getFeaturedArticles(limit, {}, { revalidate: 3600 })

    if (!response.itemList) {
      return { success: true, data: [] }
    }

    const validatedArticles = response.itemList
      .map((item) => {
        try {
          return articleSchema.parse(item)
        } catch (error) {
          logger.error(
            {
              action: 'article_validation_failed',
              item: JSON.stringify(item).slice(0, 500),
              error: error instanceof Error ? error.message : 'Unknown validation error',
            },
            'Failed to validate article'
          )
          return null
        }
      })
      .filter((article): article is Article => article !== null)

    logger.info(
      {
        count: validatedArticles.length,
        limit,
      },
      'Featured articles fetched'
    )

    return { success: true, data: validatedArticles }
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to fetch featured articles'
    )

    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
})

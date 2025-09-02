import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { getArticleBySlug } from '../article.api'
import { ArticleNotFoundError, ArticleValidationError } from '../article.types'
import type { ApiResponse, Article } from '@/types/article'

// Mock the env module
vi.mock('@/config/env', () => ({
  env: {
    API_BASE_URL: 'https://api.example.com',
    ARTICLE_CACHE_TTL: 3600,
    NODE_ENV: 'test',
  },
}))

const mockArticle: Article = {
  id: '1',
  slug: 'test-article',
  title: 'Test Article',
  content: '<p>Test content</p>',
  excerpt: 'Test excerpt',
  author: 'Test Author',
  publishedAt: '2024-01-01T00:00:00Z',
  tags: ['test', 'article'],
}

const server = setupServer()

beforeAll(() => {
  // Set up environment variables for the test
  process.env.API_BASE_URL = 'https://api.example.com'
  server.listen()
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe.skip('getArticleBySlug', () => {
  it('should successfully fetch and return an article', async () => {
    server.use(
      http.get('*/articles/test-article', () => {
        return HttpResponse.json<ApiResponse<Article>>({
          data: mockArticle,
        })
      })
    )

    const result = await getArticleBySlug('test-article')

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(mockArticle)
    }
  })

  it('should return ArticleNotFoundError for 404 responses', async () => {
    server.use(
      http.get('*/articles/non-existent', () => {
        return HttpResponse.json<ApiResponse<null>>(
          {
            data: null,
            error: {
              code: 'NOT_FOUND',
              message: 'Article not found',
            },
          },
          { status: 404 }
        )
      })
    )

    const result = await getArticleBySlug('non-existent')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ArticleNotFoundError)
      expect(result.error.message).toContain('non-existent')
    }
  })

  it('should handle timeout errors (3 second limit)', async () => {
    server.use(
      http.get('*/articles/slow-article', async () => {
        await new Promise((resolve) => setTimeout(resolve, 4000))
        return HttpResponse.json<ApiResponse<Article>>({
          data: mockArticle,
        })
      })
    )

    const result = await getArticleBySlug('slow-article')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toContain('timeout')
    }
  }, 5000)

  it('should return validation error for invalid data', async () => {
    server.use(
      http.get('*/articles/invalid-article', () => {
        return HttpResponse.json<ApiResponse<Partial<Article>>>({
          data: {
            id: '1',
            // Missing required fields
          } as Article,
        })
      })
    )

    const result = await getArticleBySlug('invalid-article')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ArticleValidationError)
    }
  })

  it('should handle server errors', async () => {
    server.use(
      http.get('*/articles/server-error', () => {
        return HttpResponse.json(
          {
            error: {
              code: 'SERVER_ERROR',
              message: 'Internal server error',
            },
          },
          { status: 500 }
        )
      })
    )

    const result = await getArticleBySlug('server-error')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toContain('500')
    }
  })

  it('should handle network errors', async () => {
    server.use(
      http.get('*/articles/network-error', () => {
        return HttpResponse.error()
      })
    )

    const result = await getArticleBySlug('network-error')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.message).toBeDefined()
    }
  })

  it('should use cache for repeated requests', async () => {
    let requestCount = 0

    server.use(
      http.get('*/articles/cached-article', () => {
        requestCount++
        return HttpResponse.json<ApiResponse<Article>>({
          data: mockArticle,
        })
      })
    )

    // First request
    const result1 = await getArticleBySlug('cached-article')
    expect(result1.success).toBe(true)

    // Second request (should use cache)
    const result2 = await getArticleBySlug('cached-article')
    expect(result2.success).toBe(true)

    // Due to React.cache(), the request should only be made once
    expect(requestCount).toBe(1)
  })
})

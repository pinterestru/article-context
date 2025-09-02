import { describe, it, expect } from 'vitest'
import { articleSchema, apiResponseSchema } from '../article.types'

describe('Article Validation Schemas', () => {
  describe('articleSchema', () => {
    it('should validate a valid article', () => {
      const validArticle = {
        id: '123',
        slug: 'test-article',
        title: 'Test Article',
        content: '<p>Test content</p>',
        excerpt: 'Test excerpt',
        author: 'John Doe',
        publishedAt: '2024-01-01T00:00:00Z',
        tags: ['test', 'article'],
      }

      const result = articleSchema.safeParse(validArticle)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validArticle)
      }
    })

    it('should reject article with missing fields', () => {
      const invalidArticle = {
        id: '123',
        slug: 'test-article',
        // Missing required fields
      }

      const result = articleSchema.safeParse(invalidArticle)
      expect(result.success).toBe(false)
    })

    it('should accept article with any string date format', () => {
      const articleWithStringDate = {
        id: '123',
        slug: 'test-article',
        title: 'Test Article',
        content: '<p>Test content</p>',
        excerpt: 'Test excerpt',
        author: 'John Doe',
        publishedAt: 'invalid-date', // This is still a valid string
        tags: ['test'],
      }

      const result = articleSchema.safeParse(articleWithStringDate)
      expect(result.success).toBe(true) // String dates are valid
    })

    it('should reject article with wrong type for tags', () => {
      const invalidArticle = {
        id: '123',
        slug: 'test-article',
        title: 'Test Article',
        content: '<p>Test content</p>',
        excerpt: 'Test excerpt',
        author: 'John Doe',
        publishedAt: '2024-01-01T00:00:00Z',
        tags: 'not-an-array',
      }

      const result = articleSchema.safeParse(invalidArticle)
      expect(result.success).toBe(false)
    })
  })

  describe('apiResponseSchema', () => {
    it('should validate successful response', () => {
      const schema = apiResponseSchema(articleSchema)
      const validResponse = {
        data: {
          id: '123',
          slug: 'test-article',
          title: 'Test Article',
          content: '<p>Test content</p>',
          excerpt: 'Test excerpt',
          author: 'John Doe',
          publishedAt: '2024-01-01T00:00:00Z',
          tags: ['test'],
        },
        meta: {
          version: '1.0',
          timestamp: new Date().toISOString(),
        },
      }

      const result = schema.safeParse(validResponse)
      expect(result.success).toBe(true)
    })

    it('should validate error response', () => {
      const schema = apiResponseSchema(articleSchema)
      const errorResponse = {
        data: null,
        error: {
          code: 'NOT_FOUND',
          message: 'Article not found',
          details: { slug: 'non-existent' },
        },
      }

      const result = schema.safeParse(errorResponse)
      expect(result.success).toBe(true)
    })

    it('should validate response without optional fields', () => {
      const schema = apiResponseSchema(articleSchema)
      const minimalResponse = {
        data: {
          id: '123',
          slug: 'test-article',
          title: 'Test Article',
          content: '<p>Test content</p>',
          excerpt: 'Test excerpt',
          author: 'John Doe',
          publishedAt: '2024-01-01T00:00:00Z',
          tags: [],
        },
      }

      const result = schema.safeParse(minimalResponse)
      expect(result.success).toBe(true)
    })
  })
})
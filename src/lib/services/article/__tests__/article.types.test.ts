import { describe, it, expect } from 'vitest'
import { ArticleNotFoundError, ArticleValidationError } from '../article.types'

describe('Article Service Types', () => {
  describe('ArticleNotFoundError', () => {
    it('should create error with correct message', () => {
      const error = new ArticleNotFoundError('test-slug')
      expect(error.message).toBe('Article with slug "test-slug" not found')
      expect(error.name).toBe('ArticleNotFoundError')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('ArticleValidationError', () => {
    it('should create error with message only', () => {
      const error = new ArticleValidationError('Invalid data')
      expect(error.message).toBe('Invalid data')
      expect(error.name).toBe('ArticleValidationError')
      expect(error.details).toBeUndefined()
    })

    it('should create error with message and details', () => {
      const details = { field: 'title', reason: 'required' }
      const error = new ArticleValidationError('Validation failed', details)
      expect(error.message).toBe('Validation failed')
      expect(error.name).toBe('ArticleValidationError')
      expect(error.details).toEqual(details)
    })
  })

  describe('Result type', () => {
    it('should correctly type success results', () => {
      const result: { success: true; data: string } = {
        success: true,
        data: 'test',
      }
      expect(result.success).toBe(true)
      expect(result.data).toBe('test')
    })

    it('should correctly type error results', () => {
      const result: { success: false; error: Error } = {
        success: false,
        error: new Error('test error'),
      }
      expect(result.success).toBe(false)
      expect(result.error.message).toBe('test error')
    })
  })
})

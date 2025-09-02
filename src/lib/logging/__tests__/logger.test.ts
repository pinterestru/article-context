import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logger } from '../logger'
import { logReactError } from '../logger-client'

describe('Simplified Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic logger', () => {
    it('should have proper log levels', () => {
      expect(logger.info).toBeDefined()
      expect(logger.error).toBeDefined()
      expect(logger.warn).toBeDefined()
      expect(logger.debug).toBeDefined()
    })

    it('should be a pino logger instance', () => {
      // Pino loggers have these properties
      expect(logger.level).toBeDefined()
      expect(logger.child).toBeDefined()
    })
  })

  describe('logReactError', () => {
    it('should handle React errors with proper structure', () => {
      const error = new Error('React component error')
      const errorInfo = {
        componentStack: 'at Component\nat ErrorBoundary',
        digest: 'error-digest-123',
      }
      
      // Just verify the function executes without error
      expect(() => {
        logReactError(error, errorInfo, { component: 'TestComponent' })
      }).not.toThrow()
    })

    it('should handle null errorInfo', () => {
      const error = new Error('React component error')
      
      expect(() => {
        logReactError(error, null)
      }).not.toThrow()
    })
  })
})
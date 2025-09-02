import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { APIError, isAPIError, httpClient } from '../client'

// Mock fetch
global.fetch = vi.fn()

describe('HTTP Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('APIError', () => {
    it('should create error with all properties', () => {
      const error = new APIError(404, 'NOT_FOUND', 'Resource not found', { id: '123' })

      expect(error.status).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
      expect(error.message).toBe('Resource not found')
      expect(error.details).toEqual({ id: '123' })
      expect(error.name).toBe('APIError')
      expect(error).toBeInstanceOf(Error)
    })

    it('should create error without details', () => {
      const error = new APIError(500, 'SERVER_ERROR', 'Internal server error')

      expect(error.status).toBe(500)
      expect(error.code).toBe('SERVER_ERROR')
      expect(error.message).toBe('Internal server error')
      expect(error.details).toBeUndefined()
    })
  })

  describe('isAPIError', () => {
    it('should return true for APIError instances', () => {
      const error = new APIError(400, 'BAD_REQUEST', 'Invalid request')
      expect(isAPIError(error)).toBe(true)
    })

    it('should return false for regular Error instances', () => {
      const error = new Error('Regular error')
      expect(isAPIError(error)).toBe(false)
    })

    it('should return false for non-error values', () => {
      expect(isAPIError(null)).toBe(false)
      expect(isAPIError(undefined)).toBe(false)
      expect(isAPIError('string')).toBe(false)
      expect(isAPIError(123)).toBe(false)
      expect(isAPIError({})).toBe(false)
    })
  })

  describe('httpClient retry logic', () => {
    it('should retry on 5xx errors with exponential backoff', async () => {
      vi.useFakeTimers()
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>

      // First two attempts fail with 500, third succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ code: 'SERVER_ERROR', message: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          json: async () => ({ code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' }),
        })

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const promise = httpClient('https://api.example.com/test', {
        retry: {
          retries: 3,
          minTimeout: 100,
          factor: 2,
        },
      })

      // Fast-forward through all timers
      await vi.runAllTimersAsync()

      const result = await promise

      expect(result).toEqual({ data: 'success' })
      expect(mockFetch).toHaveBeenCalledTimes(3)
      // 2 retry warnings + 1 success telemetry = 3 total
      expect(consoleWarnSpy).toHaveBeenCalledTimes(3)

      consoleWarnSpy.mockRestore()
      vi.useRealTimers()
    })

    it('should not retry on 4xx errors', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ code: 'NOT_FOUND', message: 'Not found' }),
      })

      const promise = httpClient('https://api.example.com/test')

      await expect(promise).rejects.toThrow(APIError)
      await expect(promise).rejects.toMatchObject({
        status: 404,
        code: 'NOT_FOUND',
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should not retry on timeout errors', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>

      mockFetch.mockImplementationOnce(() => {
        const error = new Error('Aborted')
        error.name = 'AbortError'
        throw error
      })

      const promise = httpClient('https://api.example.com/test', { timeout: 100 })

      await expect(promise).rejects.toThrow(APIError)
      await expect(promise).rejects.toMatchObject({
        status: 408,
        code: 'REQUEST_TIMEOUT',
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should retry on network errors', async () => {
      vi.useFakeTimers()
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>

      // First attempt fails with network error, second succeeds
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'success' }),
      })

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const promise = httpClient('https://api.example.com/test', {
        retry: {
          retries: 2,
          minTimeout: 50,
        },
      })

      await vi.runAllTimersAsync()
      const result = await promise

      expect(result).toEqual({ data: 'success' })
      expect(mockFetch).toHaveBeenCalledTimes(2)
      // 1 retry warning + 1 success telemetry = 2 total
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2)

      consoleWarnSpy.mockRestore()
      vi.useRealTimers()
    })

    it('should respect custom shouldRetry function', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ code: 'SERVER_ERROR', message: 'Server error' }),
      })

      const shouldRetry = vi.fn(() => false)

      const promise = httpClient('https://api.example.com/test', {
        retry: {
          retries: 3,
          shouldRetry,
        },
      })

      await expect(promise).rejects.toThrow(APIError)

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(shouldRetry).toHaveBeenCalledOnce()
    })

    it('should apply jitter to retry delays', async () => {
      vi.useFakeTimers()
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => ({ code: 'SERVER_ERROR', message: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: 'success' }),
        })

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const promise = httpClient('https://api.example.com/test', {
        retry: {
          retries: 1,
          minTimeout: 1000,
          factor: 2,
        },
      })

      await vi.runAllTimersAsync()
      await promise

      // Check that retry was logged (1 retry + 1 success telemetry)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2)

      const logCall = consoleWarnSpy.mock.calls[0]
      if (logCall) {
        const logMessage = logCall[0]
        const delayMatch = logMessage.match(/retrying in (\d+)ms/)

        if (delayMatch) {
          const delay = parseInt(delayMatch[1])
          // Check that delay has jitter applied (between 1000-1100ms)
          expect(delay).toBeGreaterThanOrEqual(1000)
          expect(delay).toBeLessThanOrEqual(1100)
        }
      }

      consoleWarnSpy.mockRestore()
      vi.useRealTimers()
    })
  })
})

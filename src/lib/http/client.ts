export class APIError extends Error {
  public status: number
  public code: string
  public details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export interface RequestOptions extends RequestInit {
  timeout?: number
  retry?: {
    retries?: number
    factor?: number
    minTimeout?: number
    maxTimeout?: number
     
    shouldRetry?: (error: unknown, attempt: number) => boolean
  }
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
}

const DEFAULT_TIMEOUT = 10000 // 10 seconds
const DEFAULT_RETRY_CONFIG = {
  retries: 3,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 10000,
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function calculateBackoff(
  attempt: number,
  factor: number,
  minTimeout: number,
  maxTimeout: number
): number {
  // Exponential backoff with jitter
  const exponentialDelay = minTimeout * Math.pow(factor, attempt - 1)
  const jitter = Math.random() * 0.1 * exponentialDelay // 10% jitter
  const delay = Math.min(exponentialDelay + jitter, maxTimeout)
  return Math.round(delay)
}

function defaultShouldRetry(error: unknown, attempt: number): boolean {
  // Don't retry if we've exhausted attempts
  if (attempt <= 0) return false

  // Retry on network errors
  if (error instanceof Error && error.name === 'AbortError') return false // Don't retry timeouts
  if (error instanceof TypeError && error.message.includes('fetch')) return true

  // Retry on 5xx errors
  if (error instanceof APIError) {
    return error.status >= 500 && error.status < 600
  }

  return false
}

export async function httpClient<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, retry: retryConfig = {}, next, ...fetchOptions } = options

  const retry = {
    ...DEFAULT_RETRY_CONFIG,
    ...retryConfig,
    shouldRetry: retryConfig.shouldRetry || defaultShouldRetry,
  }

  let lastError: unknown
  const startTime = Date.now()

  for (let attempt = 0; attempt <= retry.retries; attempt++) {
    try {
      // Create new abort controller for each attempt
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
          next,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new APIError(
            response.status,
            errorData.code || 'UNKNOWN_ERROR',
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            errorData.details
          )
        }

        const data = await response.json()

        // Log successful request with retry metrics
        if (attempt > 0) {
          console.warn('[HTTP Client] Request succeeded after retries', {
            url,
            attempts: attempt + 1,
            duration: Date.now() - startTime,
            finalStatus: 'success',
          })
        }

        return data as T
      } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof APIError) {
          throw error
        }

        if (error instanceof Error && error.name === 'AbortError') {
          throw new APIError(408, 'REQUEST_TIMEOUT', `Request timed out after ${timeout}ms`)
        }

        throw new APIError(
          500,
          'NETWORK_ERROR',
          error instanceof Error ? error.message : 'Unknown error occurred',
          error
        )
      }
    } catch (error) {
      lastError = error

      // Check if we should retry
      const remainingAttempts = retry.retries - attempt
      if (remainingAttempts > 0 && retry.shouldRetry(error, remainingAttempts)) {
        const delay = calculateBackoff(
          attempt + 1,
          retry.factor,
          retry.minTimeout,
          retry.maxTimeout
        )

        console.warn('[HTTP Client] Retrying failed request', {
          url,
          attempt: attempt + 1,
          maxAttempts: retry.retries + 1,
          nextRetryIn: delay,
          duration: Date.now() - startTime,
          errorType: error instanceof Error ? error.name : 'Unknown',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        })

        await wait(delay)
        continue
      }

      // No more retries, log final failure and throw the error
      console.error('[HTTP Client] Request failed after all retries', {
        url,
        attempts: attempt + 1,
        duration: Date.now() - startTime,
        finalStatus: 'failure',
        errorType: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      throw error
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError
}

'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import Link from 'next/link'
import { isAPIError } from '@/lib/http/client'
import {
  getErrorNamespace,
  type ArticleErrorTranslations,
} from '@/lib/i18n/error-boundary-translations'
import { Button } from '@/components/shared/Button'

interface ErrorContext {
  name: string
  message: string
  digest?: string
  stack?: string
  timestamp: string
  url?: string
  userAgent?: string
  viewport?: {
    width: number
    height: number
  }
  apiError?: {
    status: number
    code: string
    details?: unknown
  }
}

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = getErrorNamespace<ArticleErrorTranslations>('errors.article')
  useEffect(() => {
    // Build comprehensive error context
    const errorContext: ErrorContext = {
      name: error.name,
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }

    // Add browser-specific context if available (SSR-safe)
    if (typeof window !== 'undefined') {
      errorContext.url = window.location.href
      errorContext.userAgent = navigator.userAgent
      errorContext.viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
    }

    // Add API-specific error details
    if (isAPIError(error)) {
      errorContext.apiError = {
        status: error.status,
        code: error.code,
        details: error.details,
      }
    }

    // Enhanced logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Article Error Boundary] Full error context:', errorContext)

      // Log to console table for better readability in dev
      console.table({
        Error: error.name,
        Message: error.message,
        Timestamp: errorContext.timestamp,
        URL: errorContext.url || 'N/A',
        'Error ID': error.digest || 'N/A',
      })
    } else {
      // Production logging - more concise
      console.error('[Article Error Boundary]', {
        name: error.name,
        message: error.message,
        digest: error.digest,
        timestamp: errorContext.timestamp,
        ...(isAPIError(error) && { apiStatus: error.status, apiCode: error.code }),
      })
    }

    // Log to Sentry
    Sentry.captureException(error, {
      tags: {
        error_boundary: 'article',
        error_type: error.name,
        ...(isAPIError(error) && {
          api_status: String(error.status),
          api_code: error.code,
        }),
      },
      contexts: {
        error: {
          digest: error.digest,
          ...errorContext,
        },
      },
      extra: {
        ...errorContext,
      },
    })
  }, [error])

  const getErrorMessage = () => {
    if (isAPIError(error)) {
      const errorKey = error.code as keyof typeof t.errors
      if (errorKey in t.errors) {
        return t.errors[errorKey]
      }
      return error.message || t.defaultMessage
    }

    if (error.name === 'ArticleValidationError') {
      return t.errors.ARTICLE_VALIDATION
    }

    return t.defaultMessage
  }

  const getRecoverySuggestions = (error: Error): string[] => {
    if (isAPIError(error)) {
      const suggestionKey = error.code as keyof typeof t.suggestions
      if (suggestionKey in t.suggestions) {
        return t.suggestions[suggestionKey]
      }
      return t.suggestions.DEFAULT
    }

    if (error.name === 'ArticleNotFoundError') {
      return t.suggestions.ARTICLE_NOT_FOUND
    }

    if (error.name === 'ArticleValidationError') {
      return t.suggestions.ARTICLE_VALIDATION
    }

    return t.suggestions.DEFAULT
  }

  const getErrorIcon = () => {
    if (isAPIError(error)) {
      if (error.code === 'REQUEST_TIMEOUT' || error.code === 'NETWORK_ERROR') {
        // Network/connection icon
        return (
          <svg
            className="text-destructive h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        )
      }
    }

    // Default error icon
    return (
      <svg
        className="text-destructive h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <div className="mb-8">
            <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              {getErrorIcon()}
            </div>
            <h1 className="text-foreground mb-4 text-3xl font-bold">{t.title}</h1>
          </div>

          <p className="text-muted-foreground mx-auto mb-6 max-w-md">{getErrorMessage()}</p>

          {error.digest && (
            <p className="text-muted-foreground mb-6 text-sm">
              {t.errorId}: <code className="bg-muted rounded px-2 py-1">{error.digest}</code>
            </p>
          )}

          {/* Recovery suggestions */}
          <div className="mx-auto mb-8 max-w-md">
            <h2 className="text-foreground mb-3 text-sm font-semibold">{t.whatYouCanTry}</h2>
            <ul className="text-muted-foreground space-y-2 text-sm">
              {getRecoverySuggestions(error).map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="mt-0.5 mr-2 flex-shrink-0">
                    <svg
                      className="text-muted-foreground/60 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Development-only error details */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mx-auto mb-8 max-w-2xl text-left">
              <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
                {t.developerDetails}
              </summary>
              <pre className="bg-muted mt-2 overflow-auto rounded p-4 text-xs">
                {JSON.stringify(
                  {
                    name: error.name,
                    message: error.message,
                    ...(isAPIError(error) && {
                      status: error.status,
                      code: error.code,
                      details: error.details,
                    }),
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          )}

          <div className="flex justify-center gap-4">
            <Button onClick={() => reset()} size="lg" color="primary">
              {t.buttons.tryAgain}
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/">{t.buttons.goHome}</Link>
            </Button>
            <Button
              onClick={() => {
                const eventId = Sentry.lastEventId()
                if (eventId) {
                  Sentry.showReportDialog({ eventId })
                }
              }}
              size="lg"
              variant="outline"
            >
              {t.buttons.reportIssue}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

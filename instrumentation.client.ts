import * as Sentry from '@sentry/nextjs'
import { clientEnv } from '@/config/client-env'
import { getWebsiteUrl } from '@/lib/utils/media'

Sentry.init({
  dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Set `tracePropagationTargets` to control what URLs distributed tracing should be enabled for
  tracePropagationTargets: ['localhost', getWebsiteUrl(), /^\//],

  // Performance Monitoring
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Sampling
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Data scrubbing
  beforeSend(event, _hint) {
    // Add trace context
    if (typeof window !== 'undefined') {
      const traceId = window.__TRACE_ID__
      if (traceId) {
        event.tags = { ...event.tags, trace_id: traceId }
      }

      // Add localization context
      const isLocalized = document.documentElement.classList.contains('is-localized')
      event.tags = {
        ...event.tags,
        localization_mode: isLocalized ? 'localized' : 'default',
      }
    }

    // Redact sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    if (event.request?.headers) {
      const headers = event.request.headers as Record<string, string>
      if (headers.authorization) {
        headers.authorization = '[REDACTED]'
      }
    }

    return event
  },

  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random network errors
    'Non-Error promise rejection captured',
    // Ignore tracking prevention errors
    'Failed to fetch',
    // ResizeObserver errors (common in many browsers)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
  ],
})

// sentry.server.config.ts
import { clientEnv } from '@/config/client-env'
import * as Sentry from '@sentry/nextjs'
import { COOKIES } from '@/config/constants'
import { parseCookies } from '@/lib/utils/cookie'
import { normalizeDomain } from '@/lib/utils/domain'

Sentry.init({
  // Phase 1: Use environment variable for DSN
  dsn: clientEnv.SENTRY_DSN,

  // Phase 2: Set the environment
  environment: process.env.NODE_ENV,

  // Phase 2: Adjust sampling rates for production vs. development
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,
  profilesSampleRate: 0.1, // Enable profiling

  // Phase 1: Add beforeSend hook for data redaction and adding tags
  beforeSend(event, _hint) {
    if (!event.tags?.domain && event.request?.headers?.host) {
      event.tags = { ...event.tags, domain: normalizeDomain(event.request.headers.host) }
    }
    if (event.request?.headers?.cookie) {
      const cookies = parseCookies(event.request.headers.cookie)

      const traceId = cookies[COOKIES.TRACE]
      const mtfi = cookies[COOKIES.MTFI]
      const target = cookies[COOKIES.TARGET]

      // Add all searchable cookie values as tags
      if (traceId) {
        event.tags = { ...event.tags, trace_id: traceId }
      }
      if (mtfi) {
        event.tags = { ...event.tags, mtfi_id: mtfi }
      }
      if (target) {
        event.tags = { ...event.tags, target: target }
      }
      // Since all values are now tags, the context object is not needed for cookies.

      // IMPORTANT: Still delete the raw cookie header for security
      delete event.request.headers.cookie
    }

    // Redact Authorization header
    if (event.request?.headers?.['Authorization']) {
      delete event.request.headers['Authorization']
    }

    // Add runtime tag for easy filtering in Sentry
    event.tags = { ...event.tags, runtime: 'nodejs' }
    return event
  },

  // These are from your original wizard setup
  enableLogs: true,
  debug: false,
})

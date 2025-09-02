# Observability Strategy

## Overview

We implement a comprehensive observability strategy focused on tracing cloaking decisions and user journeys through correlated logs, errors, and analytics.

## Core Components

1. **Trace ID Correlation** - Universal identifier linking all telemetry
2. **Structured Logging** - JSON logs with consistent schema
3. **Error Tracking** - Sentry with enriched context
4. **User Analytics** - PostHog with session replay
5. **Performance Monitoring** - Web Vitals and API latency

## Trace ID Architecture

```typescript
// src/lib/tracing/trace-id.ts
import { randomUUID } from 'crypto'

export interface TraceContext {
  traceId: string
  spanId?: string
  userId?: string
  clickId?: string
  articleSlug?: string
  cloakMode?: 'white' | 'black'
}

// Generate W3C Trace Context compliant ID
export function generateTraceId(): string {
  return randomUUID().replace(/-/g, '')
}

// Extract or generate trace ID from headers
export function getTraceId(headers: Headers): string {
  // Check for existing trace from upstream
  const traceParent = headers.get('traceparent')
  if (traceParent) {
    const [, traceId] = traceParent.split('-')
    return traceId
  }
  
  // Check for custom header
  const customTrace = headers.get('x-trace-id')
  if (customTrace) return customTrace
  
  // Generate new trace ID
  return generateTraceId()
}
```

## Middleware Integration

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getTraceId } from '@/lib/tracing/trace-id'
import { logger } from '@/lib/logging/logger'

export function middleware(request: NextRequest) {
  const traceId = getTraceId(request.headers)
  const startTime = Date.now()
  
  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-trace-id', traceId)
  
  // Create response with trace ID
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  
  // Add trace ID to response headers
  response.headers.set('x-trace-id', traceId)
  
  // Log the request
  logger.info('request_received', {
    traceId,
    method: request.method,
    path: request.nextUrl.pathname,
    query: Object.fromEntries(request.nextUrl.searchParams),
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    ip: request.headers.get('x-forwarded-for') || request.ip,
  })
  
  // Log response timing
  const duration = Date.now() - startTime
  logger.info('request_completed', {
    traceId,
    duration,
    path: request.nextUrl.pathname,
  })
  
  return response
}
```

## Structured Logging

```typescript
// src/lib/logging/logger.ts
import pino from 'pino'

// Server-side logger configuration
const isServer = typeof window === 'undefined'

export const logger = isServer
  ? pino({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => ({ level: label }),
        bindings: () => ({
          environment: process.env.NODE_ENV,
          service: 'affiliate-article-ui',
          version: process.env.NEXT_PUBLIC_APP_VERSION,
        }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      // Redact sensitive fields
      redact: {
        paths: [
          'email',
          'password',
          'token',
          'api_key',
          '*.email',
          '*.password',
          'headers.authorization',
          'headers.cookie',
        ],
        censor: '[REDACTED]',
      },
    })
  : // Client-side logger (browser-safe)
    {
      info: (msg: string, data?: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[INFO] ${msg}`, data)
        }
      },
      error: (msg: string, data?: any) => {
        console.error(`[ERROR] ${msg}`, data)
      },
      warn: (msg: string, data?: any) => {
        console.warn(`[WARN] ${msg}`, data)
      },
      debug: (msg: string, data?: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.debug(`[DEBUG] ${msg}`, data)
        }
      },
    }

// Typed logger for cloaking events
export const cloakLogger = {
  decision: (traceId: string, data: {
    mode: 'white' | 'black'
    reason: string
    userAgent?: string
    clickId?: string
    articleSlug?: string
  }) => {
    logger.info('cloak_decision', {
      traceId,
      ...data,
      timestamp: new Date().toISOString(),
    })
  },
  
  verification: (traceId: string, data: {
    valid: boolean
    blacklisted?: boolean
    fingerprint?: string
    reason?: string
  }) => {
    logger.info('cloak_verification', {
      traceId,
      ...data,
      timestamp: new Date().toISOString(),
    })
  },
  
  violation: (traceId: string, data: {
    type: 'time_window' | 'fingerprint_mismatch' | 'blacklisted'
    details?: any
  }) => {
    logger.warn('cloak_violation', {
      traceId,
      ...data,
      timestamp: new Date().toISOString(),
    })
  },
}
```

## Sentry Integration

```typescript
// src/lib/logging/sentry.ts
import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event, hint) {
      // Add trace context if available
      if (typeof window !== 'undefined') {
        const traceId = window.__TRACE_ID__
        if (traceId) {
          event.tags = { ...event.tags, trace_id: traceId }
        }
      }
      
      // Redact sensitive data
      if (event.request?.cookies) {
        event.request.cookies = '[REDACTED]'
      }
      
      return event
    },
    integrations: [
      new Sentry.BrowserTracing({
        // Track navigation timing
        routingInstrumentation: Sentry.nextRouterInstrumentation,
      }),
    ],
  })
}

// Helper to enrich Sentry context
export function setSentryContext(context: {
  traceId: string
  userId?: string
  clickId?: string
  cloakMode?: string
}) {
  Sentry.setTags({
    trace_id: context.traceId,
    cloak_mode: context.cloakMode,
  })
  
  if (context.userId) {
    Sentry.setUser({ id: context.userId })
  }
  
  Sentry.setContext('session', {
    clickId: context.clickId,
    traceId: context.traceId,
  })
}
```

## PostHog Analytics Integration

```typescript
// src/lib/analytics/posthog.ts
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false, // Manual control
      capture_pageleave: true,
      // Link errors to session replays
      beforeSend(event) {
        // Add trace ID to all events
        const traceId = window.__TRACE_ID__
        if (traceId) {
          event.properties = {
            ...event.properties,
            trace_id: traceId,
          }
        }
        return event
      },
    })
  }
}

// Typed analytics events
export const analytics = {
  pageView: (properties: {
    path: string
    articleSlug?: string
    cloakMode?: string
    traceId?: string
  }) => {
    posthog?.capture('$pageview', properties)
  },
  
  cloakDecision: (properties: {
    mode: 'white' | 'black'
    reason: string
    articleSlug: string
    traceId: string
  }) => {
    posthog?.capture('cloak_decision', properties)
  },
  
  promocodeInteraction: (properties: {
    action: 'viewed' | 'copied' | 'clicked'
    code: string
    articleSlug: string
    position?: string
    traceId: string
  }) => {
    posthog?.capture('promocode_interaction', properties)
  },
  
  conversionEvent: (properties: {
    type: 'click' | 'lead' | 'sale'
    value?: number
    articleSlug: string
    traceId: string
  }) => {
    posthog?.capture('conversion', properties)
  },
}
```

## Client-Side Initialization

```typescript
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    const { logger } = await import('@/lib/logging/logger')
    
    // Log server startup
    logger.info('server_started', {
      node_version: process.version,
      next_version: require('next/package.json').version,
    })
  }
}

// src/app/layout.tsx (client initialization)
'use client'

import { useEffect } from 'react'
import { initSentry, setSentryContext } from '@/lib/logging/sentry'
import { initPostHog } from '@/lib/analytics/posthog'

function ClientInit({ traceId }: { traceId: string }) {
  useEffect(() => {
    // Store trace ID globally for client-side logging
    window.__TRACE_ID__ = traceId
    
    // Initialize observability tools
    initSentry()
    initPostHog()
    
    // Set initial context
    setSentryContext({ traceId })
    
    // Clean up on unmount
    return () => {
      delete window.__TRACE_ID__
    }
  }, [traceId])
  
  return null
}
```

## Server Component Integration

```typescript
// src/app/article/[slug]/page.tsx
import { headers } from 'next/headers'
import { trackerApiService } from '@/lib/services/tracker/tracker.api'
import { logger, cloakLogger } from '@/lib/logging/logger'
import { getTraceId } from '@/lib/tracing/trace-id'

export default async function ArticlePage({ 
  params,
  searchParams 
}: { 
  params: { slug: string }
  searchParams: { [key: string]: string }
}) {
  const headersList = headers()
  const traceId = getTraceId(headersList)
  
  // Log page request
  logger.info('article_page_requested', {
    traceId,
    slug: params.slug,
    clickId: searchParams.yclid || searchParams.gclid,
    referer: headersList.get('referer'),
  })
  
  try {
    // Make cloak decision with trace ID
    const cloakDecision = await trackerApiService.getCloakDecision({
      slug: params.slug,
      clickId: searchParams.yclid || searchParams.gclid,
      userAgent: headersList.get('user-agent') || '',
      ip: headersList.get('x-forwarded-for') || '',
    })
    
    // Log the decision
    cloakLogger.decision(traceId, {
      mode: cloakDecision.mode,
      reason: cloakDecision.reason || 'none',
      articleSlug: params.slug,
      clickId: searchParams.yclid || searchParams.gclid,
    })
    
    return (
      <>
        <ClientInit traceId={traceId} />
        <ArticleContent 
          mode={cloakDecision.mode}
          verifyToken={cloakDecision.verifyToken}
          traceId={traceId}
        />
      </>
    )
  } catch (error) {
    logger.error('article_page_error', {
      traceId,
      error: error instanceof Error ? error.message : 'Unknown error',
      slug: params.slug,
    })
    
    // Default to white mode on error
    return <ArticleContent mode="white" traceId={traceId} />
  }
}
```

## Debugging Dashboard

```typescript
// src/app/api/debug/trace/[traceId]/route.ts
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logging/logger'

// Development-only endpoint to view logs for a trace
export async function GET(
  request: Request,
  { params }: { params: { traceId: string } }
) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }
  
  // In production, this would query your log aggregator
  // For development, return mock data
  return NextResponse.json({
    traceId: params.traceId,
    logs: [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'request_received',
        data: { path: '/article/test' },
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'cloak_decision',
        data: { mode: 'black', reason: 'trusted_source' },
      },
    ],
  })
}
```

## Monitoring Best Practices

1. **Trace Every Decision**: All cloaking decisions must include trace ID
2. **Log Liberally**: Server-side logs are cheap, log all decision points
3. **Structured Data**: Always use consistent field names in logs
4. **Privacy First**: Never log PII or sensitive data
5. **Correlation is Key**: Link logs, errors, and analytics via trace ID
6. **Monitor Performance**: Track decision latency and page load times

## Key Metrics to Track

| Metric | Purpose | Alert Threshold |
|--------|---------|-----------------|
| Cloak Decision Time | Performance | > 200ms |
| White Mode Rate | Security effectiveness | > 80% |
| Verification Failures | Fingerprint issues | > 5% |
| 5-min Violations | Security breaches | > 1% |
| Conversion Rate | Business impact | < 2% |

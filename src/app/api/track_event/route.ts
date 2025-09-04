import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { trackEvent } from '@/lib/services/tracker/tracker.api'
import { logger } from '@/lib/logging/logger'
import { getOrCreateTraceId } from '@/lib/tracing/trace-id'
import type { ClientMeta } from '@/lib/services/tracker/tracker.types'
import { COOKIES, SECURE_COOKIE_CONFIG } from '@/config/constants'
import { extractClientIp, extractDomain } from '@/lib/utils/request-metadata'
import { trackEventQuerySchema, trackEventBodySchema } from './schemas'

// Legacy event type mappings
const eventTypeMapping: Record<string, string> = {
  localization_init: 'visit',
  localization_check: 'view_page',
  page_info: 'view_page',
  check: 'view_page',
  localization_interval: 'complete_activity',
  interval: 'complete_activity',
}

// Legacy track type mappings
const trackTypeMapping: Record<string, string> = {
  interval: 'session_time',
  localization_entry: 'view_page_entry',
  entry: 'view_page_entry',
  localization_navigated: 'view_page_navigated',
  navigated: 'view_page_navigated',
}

/**
 * Track event endpoint that uses legacy marketing_track API
 * Handles GET requests for event tracking
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const headersList = await headers()

  // Get trace ID
  // @ts-expect-error - ReadonlyRequestCookies vs RequestCookies type mismatch
  const traceId = getOrCreateTraceId(cookieStore, headersList)

  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
    const validationResult = trackEventQuerySchema.safeParse(searchParams)

    if (!validationResult.success) {
      logger.warn(
        {
          traceId,
          errors: validationResult.error.flatten(),
        },
        'Invalid query parameters'
      )

      return NextResponse.json(
        {
          ok: false,
          error:
            'Invalid parameters: ' + validationResult.error.issues.map((i) => i.message).join(', '),
        },
        { status: 200 }
      ) // Always return 200 to match legacy behavior
    }

    const params = validationResult.data

    // Extract parameters with fallbacks for legacy names
    let eventType = params.event_type || params.localization_type || ''
    let trackType = params.type || params.track_type
    const trackValue = params.value || params.track_value
    const url = params.url || params.localization_page
    const domain = params.domain
    const withFlow = params.with_flow
    const withView = params.with_view

    // Apply legacy event type mappings
    eventType = eventTypeMapping[eventType] || eventType

    // Apply legacy track type mappings
    if (trackType) {
      trackType = trackTypeMapping[trackType] || trackType
    }

    // Get existing mtfi from cookie or params
    const mtfi = cookieStore.get(COOKIES.MTFI)?.value || params.mtfi

    // Get js_meta from params (could be js_meta or localization_meta)
    const jsMetaParam = params.js_meta || params.localization_meta
    let jsMeta: Record<string, unknown> | string | undefined

    if (jsMetaParam) {
      try {
        // Try to parse if it's a JSON string
        jsMeta = typeof jsMetaParam === 'string' ? JSON.parse(jsMetaParam) : jsMetaParam
      } catch {
        // If parsing fails, use as-is
        jsMeta = jsMetaParam
      }
    }

    // Get request metadata
    const userAgent = headersList.get('user-agent') || ''
    const ip = extractClientIp(headersList)
    const referrer = headersList.get('referer') || ''
    const finalUrl = url || referrer || request.url

    // Extract domain from URL if not provided
    const finalDomain = domain || extractDomain(finalUrl)

    // Build client metadata
    const clientMeta: ClientMeta = {
      ip,
      user_agent: userAgent,
      domain: finalDomain,
      url: finalUrl,
      mtfi,
      created_at: new Date().toISOString(),
      headers: Array.from(headersList.entries())
        .map(([name, value]) => `${name}: ${value}`)
        .join('\r\n'),
    }

    // Handle value parameter special case
    let finalTrackValue = trackValue
    if (trackValue === 'url' && finalUrl) {
      finalTrackValue = finalUrl
    }

    // Add js_url to jsMeta if missing (matching legacy behavior)
    if (jsMeta && typeof jsMeta === 'object' && !('js_url' in jsMeta) && finalUrl) {
      jsMeta.js_url = finalUrl
    }

    // Call tracking service
    const result = await trackEvent(
      eventType,
      trackType || undefined,
      finalTrackValue || undefined,
      {
        clientMeta,
        withFlow,
        jsMeta,
      }
    )

    if (!result.success) {
      logger.error(
        {
          traceId,
          error: result.error.message,
          eventType,
          trackType,
        },
        'Track event failed'
      )

      return NextResponse.json(
        {
          ok: false,
          message: result.error.message,
        },
        { status: 200 }
      ) // Always return 200 to match legacy behavior
    }

    const trackingResult = result.data

    // Check if tracking was successful (legacy format check)
    if (trackingResult.message && trackingResult.message !== 'ok') {
      logger.error(
        {
          traceId,
          error: trackingResult.message,
          eventType,
          trackType,
          mtfi,
        },
        'Event tracking failed'
      )

      return NextResponse.json(
        {
          ok: false,
          error: trackingResult.message,
        },
        { status: 200 }
      ) // Always return 200 to match legacy behavior
    }

    // Handle additional view tracking if requested
    if (
      withView &&
      eventType === 'visit' &&
      trackingResult.mtfi &&
      trackingResult.content_is_target !== 'false'
    ) {
      // Fire additional view_page event
      await trackEvent('view_page', 'view_page_entry', finalUrl, {
        mtfi: trackingResult.mtfi,
        createdAt: new Date().toISOString(),
        clientMeta,
      })
    }

    logger.info(
      {
        traceId,
        eventType,
        trackType,
        trackValue: finalTrackValue,
        mtfi: trackingResult.mtfi || mtfi,
        contentIsTarget: trackingResult.content_is_target,
      },
      'Event tracked successfully'
    )

    // Build response
    const response: Record<string, boolean | string> = {
      ok: true,
    }

    // Add mtfi and localized flag for visit events
    if (eventType === 'visit' && trackingResult.mtfi) {
      response.mtfi = trackingResult.mtfi

      if ('content_is_target' in trackingResult && trackingResult.content_type === 'nothing') {
        response.localized = trackingResult.content_is_target === 'true'
      } else {
        response.localized = true
      }
    }

    // Set cookies if needed
    const responseHeaders = new Headers()

    // Set MTFI cookie if returned and different
    if (trackingResult.mtfi && trackingResult.mtfi !== mtfi && eventType === 'visit') {
      const cookieOptions = [
        `${COOKIES.MTFI}=${trackingResult.mtfi}`,
        `Max-Age=${SECURE_COOKIE_CONFIG.MAX_AGE}`,
        `Path=${SECURE_COOKIE_CONFIG.PATH}`,
        `SameSite=${SECURE_COOKIE_CONFIG.SAME_SITE}`,
        SECURE_COOKIE_CONFIG.SECURE ? 'Secure' : '',
        SECURE_COOKIE_CONFIG.HTTP_ONLY ? 'HttpOnly' : '',
      ]
        .filter(Boolean)
        .join('; ')

      responseHeaders.append('Set-Cookie', cookieOptions)

      // Set target cookie for visit events
      if ('content_is_target' in trackingResult && trackingResult.content_type === 'nothing') {
        const targetCookieOptions = [
          `${COOKIES.TARGET}=${trackingResult.content_is_target}`,
          `Max-Age=${SECURE_COOKIE_CONFIG.MAX_AGE}`,
          `Path=${SECURE_COOKIE_CONFIG.PATH}`,
          `SameSite=${SECURE_COOKIE_CONFIG.SAME_SITE}`,
          SECURE_COOKIE_CONFIG.SECURE ? 'Secure' : '',
          SECURE_COOKIE_CONFIG.HTTP_ONLY ? 'HttpOnly' : '',
        ]
          .filter(Boolean)
          .join('; ')

        responseHeaders.append('Set-Cookie', targetCookieOptions)
      }
    }

    return NextResponse.json(response, {
      headers: responseHeaders.entries().next().done ? undefined : responseHeaders,
    })
  } catch (error) {
    logger.error(
      {
        traceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Track event error'
    )

    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 200 }
    ) // Always return 200 to match legacy behavior
  }
}

/**
 * Handle POST requests for backward compatibility
 */
export async function POST(request: NextRequest) {
  // Convert POST body to query parameters and call GET handler
  try {
    const body = await request.json()

    // Validate request body
    const validationResult = trackEventBodySchema.safeParse(body)

    if (!validationResult.success) {
      const cookieStore = await cookies()
      const headersList = await headers()
      // @ts-expect-error - ReadonlyRequestCookies vs RequestCookies type mismatch
      const traceId = getOrCreateTraceId(cookieStore, headersList)

      logger.warn(
        {
          traceId,
          errors: validationResult.error.flatten(),
        },
        'Invalid request body'
      )

      return NextResponse.json(
        {
          ok: false,
          error:
            'Invalid request body: ' +
            validationResult.error.issues.map((i) => i.message).join(', '),
        },
        { status: 200 }
      ) // Always return 200 to match legacy behavior
    }

    const url = new URL(request.url)

    // Add validated body parameters to URL
    if (validationResult.data) {
      Object.entries(validationResult.data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Handle special cases for boolean values
          if (typeof value === 'boolean') {
            url.searchParams.set(key, value.toString())
          } else if (typeof value === 'object') {
            // For js_meta and localization_meta objects
            url.searchParams.set(key, JSON.stringify(value))
          } else {
            url.searchParams.set(key, String(value))
          }
        }
      })
    }

    // Create new request with query parameters
    const newRequest = new NextRequest(url, {
      method: 'GET',
      headers: request.headers,
    })

    return GET(newRequest)
  } catch (error) {
    const cookieStore = await cookies()
    const headersList = await headers()
    // @ts-expect-error - ReadonlyRequestCookies vs RequestCookies type mismatch
    const traceId = getOrCreateTraceId(cookieStore, headersList)

    logger.error(
      {
        traceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to parse request body'
    )

    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid request body',
      },
      { status: 200 }
    ) // Always return 200 to match legacy behavior
  }
}

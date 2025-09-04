import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { trackVisit } from '@/lib/services/tracker/tracker.api'
import type { Result, TrackingResponse } from '@/lib/services/tracker/tracker.types';
import { logger } from '@/lib/logging/logger'
import { getOrCreateTraceId } from '@/lib/tracing/trace-id'
import type { ClientMeta } from '@/lib/services/tracker/tracker.types'
import { COOKIES, SECURE_COOKIE_CONFIG } from '@/config/constants'
import { extractClientIp, extractDomain } from '@/lib/utils/request-metadata'
import * as Sentry from '@sentry/nextjs'

/**
 * Localization response for client
 */
interface LocalizationResponse {
  ok: boolean
  localized: boolean
}

/**
 * Simplified localization endpoint that uses legacy marketing_track API
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const headersList = await headers()

  // Get trace ID
  // @ts-expect-error - ReadonlyRequestCookies vs RequestCookies type mismatch
  const traceId = getOrCreateTraceId(cookieStore, headersList)

  try {
    const body = await request.json()
    const { url, localization_meta, execution_time_ms } = body

    // Get existing mtfi from cookie
    const mtfi = cookieStore.get(COOKIES.MTFI)?.value

    // Get request metadata
    const userAgent = headersList.get('user-agent') || ''
    const ip = extractClientIp(headersList)
    const urlValue = url || request.url
    const domain = extractDomain(url)

    // Build client metadata
    const clientMeta: ClientMeta = {
      ip,
      user_agent: userAgent,
      domain,
      url: urlValue,
      mtfi,
      created_at: new Date().toISOString(),
      headers: Array.from(headersList.entries())
        .map(([name, value]) => `${name}: ${value}`)
        .join('\r\n'),
    }

    // Convert localization_meta to flat structure matching legacy format
    const jsMeta = localization_meta || {}

    // Call tracking service with visit event (matching legacy behavior)
    const serverStartTime = performance.now()



    let result: Result<TrackingResponse>;

    try {
      // Sentry.startSpan will automatically measure the duration and set the status.
      result = await Sentry.startSpan({
        op: 'http.client',
        name: 'trackVisit API Call',
      }, async (span) => {
        const apiResult = await trackVisit(jsMeta, { clientMeta });

        // Add context attributes regardless of success or failure
        if (apiResult.success) {
          span.setAttribute('trackVisit.isTarget', apiResult.data.content_is_target === 'true');
          span.setAttribute('trackVisit.contentType', apiResult.data.content_type);
        } else {
          span.setAttribute('trackVisit.error', apiResult.error.message);
        }
        
        // **THIS IS THE KEY CHANGE**
        // If the call was not successful, throw an error.
        // Sentry will catch this, set the span status to 'internal_error', and re-throw it.
        if (!apiResult.success) {
          throw apiResult.error;
        }

        // If successful, return the data. The span status will be 'ok'.
        return apiResult;
      });
    } catch (spanError) {
      // This block catches the error thrown from inside the span.
      // We can now log it and create a failure `result` object to continue gracefully.
      logger.error(
        {
          traceId,
          error: spanError instanceof Error ? spanError.message : 'Unknown tracking error',
          mtfi,
        },
        'Localization tracking failed'
      )

      // Reconstruct the failure result to match the expected type
      result = {
        success: false,
        error: spanError instanceof Error ? spanError : new Error(String(spanError)),
      };
    }



    const serverExecutionTimeMs = performance.now() - serverStartTime

    if (!result.success) {
      logger.error(
        {
          traceId,
          error: result.error.message,
          mtfi,
        },
        'Localization tracking failed'
      )

      // Return false to keep content hidden on error
      const errorResponse: LocalizationResponse = {
        ok: true,
        localized: false,
      }

      return NextResponse.json(errorResponse)
    }

    const trackingResult = result.data

    // Check if tracking was successful (legacy format check)
    if (trackingResult.message && trackingResult.message !== 'ok') {
      logger.error(
        {
          traceId,
          error: trackingResult.message,
          mtfi,
        },
        'Localization tracking returned error message'
      )

      // Return false to keep content hidden on error
      const errorResponse: LocalizationResponse = {
        ok: true,
        localized: false,
      }

      return NextResponse.json(errorResponse)
    }

    // Determine if user should see promotional content
    // Legacy API returns content_is_target as "true" or "false" string
    const isTarget =
      trackingResult.content_is_target === 'true' ||
      (trackingResult.content_type !== 'nothing' && trackingResult.content_is_target !== 'false')

    // Set cookies
    const responseHeaders = new Headers()

    // Set MTFI cookie if returned
    if (trackingResult.mtfi && trackingResult.mtfi !== mtfi) {
      responseHeaders.append(
        'Set-Cookie',
        `${COOKIES.MTFI}=${trackingResult.mtfi}; Max-Age=${SECURE_COOKIE_CONFIG.MAX_AGE}; Path=${SECURE_COOKIE_CONFIG.PATH}; SameSite=${SECURE_COOKIE_CONFIG.SAME_SITE}${SECURE_COOKIE_CONFIG.SECURE ? '; Secure' : ''}${SECURE_COOKIE_CONFIG.HTTP_ONLY ? '; HttpOnly' : ''}`
      )
    }

    // Set target cookie (10 minutes expiration)
    responseHeaders.append(
      'Set-Cookie',
      `${COOKIES.TARGET}=${isTarget}; Max-Age=${10 * 60}; Path=${SECURE_COOKIE_CONFIG.PATH}; SameSite=${SECURE_COOKIE_CONFIG.SAME_SITE}${SECURE_COOKIE_CONFIG.SECURE ? '; Secure' : ''}${SECURE_COOKIE_CONFIG.HTTP_ONLY ? '; HttpOnly' : ''}`
    )

    // Set trace cookie
    responseHeaders.append(
      'Set-Cookie',
      `${COOKIES.TRACE}=${traceId}; Max-Age=${SECURE_COOKIE_CONFIG.MAX_AGE}; Path=${SECURE_COOKIE_CONFIG.PATH}; SameSite=${SECURE_COOKIE_CONFIG.SAME_SITE}${SECURE_COOKIE_CONFIG.SECURE ? '; Secure' : ''}${SECURE_COOKIE_CONFIG.HTTP_ONLY ? '; HttpOnly' : ''}`
    )

    logger.info(
      {
        traceId,
        mtfi: trackingResult.mtfi || mtfi,
        isTarget,
        contentIsTarget: trackingResult.content_is_target,
        contentType: trackingResult.content_type,
        clientExecutionTimeMs: execution_time_ms,
        serverExecutionTimeMs: serverExecutionTimeMs,
      },
      'Localization verification completed'
    )

    const response: LocalizationResponse = {
      ok: true,
      localized: isTarget,
    }

    return NextResponse.json(response, { headers: responseHeaders })
  } catch (error) {
    logger.error(
      {
        traceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Localization error'
    )

    // Return false to keep content hidden on error
    const errorResponse: LocalizationResponse = {
      ok: true,
      localized: false,
    }

    return NextResponse.json(errorResponse)
  }
}

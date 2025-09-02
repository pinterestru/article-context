import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { trackerApiService } from '@/lib/services/tracker/tracker.api';
import { logger } from '@/lib/logging/logger';
import { getOrCreateTraceId } from '@/lib/tracing/trace-id';
import type { ClientMeta } from '@/lib/services/tracker/tracker.types';
import { COOKIES, SECURE_COOKIE_CONFIG } from '@/config/constants';
import { extractClientIp, extractDomain } from '@/lib/utils/request-metadata';

/**
 * Localization response for client
 */
interface LocalizationResponse {
  ok: boolean;
  localized: boolean;
}

/**
 * Simplified localization endpoint that uses legacy marketing_track API
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  // Get trace ID
  // @ts-expect-error - ReadonlyRequestCookies vs RequestCookies type mismatch
  const traceId = getOrCreateTraceId(cookieStore, headersList);
  
  try {
    const body = await request.json();
    const { url, localization_meta, execution_time_ms } = body;
    
    // Get existing mtfi from cookie
    const mtfi = cookieStore.get(COOKIES.MTFI)?.value;
    
    // Get request metadata
    const userAgent = headersList.get('user-agent') || '';
    const ip = extractClientIp(headersList);
    const urlValue = url || request.url;
    const domain = extractDomain(url);
    
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
    };
    
    // Convert localization_meta to flat structure matching legacy format
    const jsMeta = localization_meta || {};
    
    // Call tracking service with visit event (matching legacy behavior)
    const serverStartTime = performance.now();
    const trackingResult = await trackerApiService.trackVisit(jsMeta, {
      clientMeta,
    });
    const serverExecutionTimeMs = performance.now() - serverStartTime;
    
    // Check if tracking was successful
    if (trackingResult.message && trackingResult.message !== 'ok') {
      logger.error({
        traceId,
        error: trackingResult.message,
        mtfi,
      }, 'Localization tracking failed');
      
      // Return false to keep content hidden on error
      const errorResponse: LocalizationResponse = {
        ok: true,
        localized: false,
      };
      
      return NextResponse.json(errorResponse);
    }
    
    // Determine if user should see promotional content
    // Legacy API returns content_is_target as "true" or "false" string
    const isTarget = trackingResult.content_is_target === 'true' || 
                    (trackingResult.content_type !== 'nothing' && trackingResult.content_is_target !== 'false');
    
    // Set cookies
    const responseHeaders = new Headers();
    
    // Set MTFI cookie if returned
    if (trackingResult.mtfi && trackingResult.mtfi !== mtfi) {
      responseHeaders.append('Set-Cookie', `${COOKIES.MTFI}=${trackingResult.mtfi}; Max-Age=${SECURE_COOKIE_CONFIG.MAX_AGE}; Path=${SECURE_COOKIE_CONFIG.PATH}; SameSite=${SECURE_COOKIE_CONFIG.SAME_SITE}${SECURE_COOKIE_CONFIG.SECURE ? '; Secure' : ''}${SECURE_COOKIE_CONFIG.HTTP_ONLY ? '; HttpOnly' : ''}`);
    }
    
    // Set target cookie (10 minutes expiration)
    responseHeaders.append('Set-Cookie', `${COOKIES.TARGET}=${isTarget}; Max-Age=${10 * 60}; Path=${SECURE_COOKIE_CONFIG.PATH}; SameSite=${SECURE_COOKIE_CONFIG.SAME_SITE}${SECURE_COOKIE_CONFIG.SECURE ? '; Secure' : ''}${SECURE_COOKIE_CONFIG.HTTP_ONLY ? '; HttpOnly' : ''}`);
    
    // Set trace cookie
    responseHeaders.append('Set-Cookie', `${COOKIES.TRACE}=${traceId}; Max-Age=${SECURE_COOKIE_CONFIG.MAX_AGE}; Path=${SECURE_COOKIE_CONFIG.PATH}; SameSite=${SECURE_COOKIE_CONFIG.SAME_SITE}${SECURE_COOKIE_CONFIG.SECURE ? '; Secure' : ''}${SECURE_COOKIE_CONFIG.HTTP_ONLY ? '; HttpOnly' : ''}`);
    
    logger.info({
      traceId,
      mtfi: trackingResult.mtfi || mtfi,
      isTarget,
      contentIsTarget: trackingResult.content_is_target,
      contentType: trackingResult.content_type,
      clientExecutionTimeMs: execution_time_ms,
      serverExecutionTimeMs: serverExecutionTimeMs,
    }, 'Localization verification completed');
    
    const response: LocalizationResponse = {
      ok: true,
      localized: isTarget
    };
    
    return NextResponse.json(response, { headers: responseHeaders });
    
  } catch (error) {
    logger.error({
      traceId,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'Localization error');
    
    // Return false to keep content hidden on error
    const errorResponse: LocalizationResponse = {
      ok: true,
      localized: false,
    };
    
    return NextResponse.json(errorResponse);
  }
}
import 'server-only';
import { httpClient } from '@/lib/http/client';
import { env } from '@/config/env';
import { logger } from '@/lib/logging/logger';
import type {
  ITrackerApiService,
  TrackingOptions,
  TrackingResponse,
  MarketingProcessResponse,
} from './tracker.types';

// Timeout configuration (10 seconds)
const API_TIMEOUT = 10000;

/**
 * Build query parameters for marketing track API
 */
function buildTrackingParams(
  eventType: string,
  trackType?: string,
  trackValue?: string,
  options?: Partial<TrackingOptions>
): string {
  let params = `event_type=${eventType}`;
  
  if (trackType) {
    params += `&track_type=${trackType}`;
  }
  
  if (trackValue) {
    params += `&track_value=${encodeURIComponent(trackValue)}`;
  }
  
  // Use mtfi from clientMeta first, fall back to options for backward compatibility
  const mtfi = options?.clientMeta?.mtfi || options?.mtfi;
  if (mtfi) {
    params += `&mtfi=${mtfi}`;
  }
  
  // Use created_at from clientMeta first, fall back to options for backward compatibility
  const createdAt = options?.clientMeta?.created_at || options?.createdAt;
  if (createdAt) {
    params += `&created_at=${encodeURIComponent(createdAt)}`;
  }
  
  if (options?.withFlow) {
    params += '&with_flow=true';
  }
  
  // Add domain parameter if available
  if (options?.clientMeta?.domain) {
    params += `&domain=${encodeURIComponent(options.clientMeta.domain)}`;
  } else if (options?.clientMeta?.url) {
    // Extract domain from URL if not explicitly provided
    try {
      const urlObj = new URL(options.clientMeta.url);
      const domain = urlObj.hostname.replace(/^www\./, '');
      params += `&domain=${encodeURIComponent(domain)}`;
    } catch {
      // Ignore URL parsing errors
    }
  }
  
  return params;
}

/**
 * Build headers from client metadata
 */
function buildTrackingHeaders(clientMeta?: Partial<TrackingOptions['clientMeta']>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (clientMeta?.ip) {
    // Include cf-connecting-ip to match legacy behavior
    headers['CF-Connecting-IP'] = clientMeta.ip;
    headers['X-Forwarded-For'] = clientMeta.ip;
    headers['X-Real-IP'] = clientMeta.ip;
  }
  
  if (clientMeta?.user_agent) {
    headers['User-Agent'] = clientMeta.user_agent;
    headers['X-User-Agent'] = clientMeta.user_agent;
  }
  
  if (clientMeta?.url) {
    headers['X-URL'] = clientMeta.url;
    headers['X-Url'] = clientMeta.url;
  }
  
  if (clientMeta?.domain) {
    headers['X-Domain'] = clientMeta.domain;
    headers['X-Host'] = clientMeta.domain;
  }
  
  // Add mtfi and createdAt as headers for additional context
  if (clientMeta?.mtfi) {
    headers['X-MTFI'] = clientMeta.mtfi;
  }
  
  if (clientMeta?.created_at) {
    headers['X-Created-At'] = clientMeta.created_at;
  }
  
  return headers;
}

/**
 * Internal function to track events
 */
async function _trackEvent(
  eventType: string,
  trackType?: string,
  trackValue?: string,
  options?: Partial<TrackingOptions>
): Promise<TrackingResponse> {
  const startTime = Date.now();
  
  try {
    // Validate required fields
    if (!env.API_BASE_URL) {
      logger.error('API_BASE_URL not configured');
      return { message: 'no apiPath' };
    }
    
    if (eventType !== 'visit' && !options?.mtfi) {
      logger.debug('No mtfi for non-visit event');
      return { message: 'no mtfi' };
    }
    
    // Build URL with query parameters
    const params = buildTrackingParams(eventType, trackType, trackValue, options);
    const apiUrl = `${env.API_BASE_URL}/api/marketing_track?${params}`;
    
    // Build request body with js_meta if provided
    let body: { js_meta?: string, client_meta?: string } | undefined;
    
    if (options?.jsMeta) {
      let jsMetaObj = options.jsMeta;
      const clientMetaObj = options.clientMeta || {};

      
      // If jsMeta is an object and doesn't have js_url, add it
      if (typeof jsMetaObj === 'object' && !('js_url' in jsMetaObj) && options.clientMeta?.url) {
        jsMetaObj = { ...jsMetaObj, js_url: options.clientMeta.url };
      }
      
      body = {
        js_meta: typeof jsMetaObj === 'string' ? jsMetaObj : JSON.stringify(jsMetaObj),
        client_meta: typeof clientMetaObj === 'string' ? clientMetaObj : JSON.stringify(clientMetaObj),
      };
    }
    
    // Build headers from client metadata
    const headers = buildTrackingHeaders(options?.clientMeta);
    
    logger.debug({
      eventType,
      trackType,
      trackValue,
      mtfi: options?.mtfi,
      hasJsMeta: !!options?.jsMeta,
    }, 'Tracking event');
    
    const response = await httpClient<TrackingResponse>(apiUrl, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
      timeout: API_TIMEOUT,
      cache: 'no-store', // Never cache tracking requests
      retry: {
        retries: 2,
        minTimeout: 10,
        maxTimeout: API_TIMEOUT,
        shouldRetry: (error, attempt) => {
          // Don't retry on timeouts
          if (error instanceof Error && error.message.includes('timeout')) {
            return false;
          }
          // Only retry on 5xx errors or network errors
          if (error instanceof Error && error.name === 'APIError') {
            const apiError = error as Error & { status?: number };
            return (apiError.status ?? 0) >= 500 && (apiError.status ?? 0) < 600 && attempt > 0;
          }
          return attempt > 0;
        },
      },
    });
    
    const duration = Date.now() - startTime;
    
    logger.info({
      eventType,
      trackType,
      duration,
      mtfi: response.mtfi,
      contentIsTarget: response.content_is_target,
    }, 'Tracking event completed');
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error({
      eventType,
      trackType,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'Tracking event error');
    
    return {
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Internal function to track visit events
 */
async function _trackVisit(
  jsMeta: Record<string, unknown> | string,
  options?: Partial<TrackingOptions>
): Promise<TrackingResponse> {
  return _trackEvent('visit', undefined, undefined, {
    ...options,
    jsMeta,
    withFlow: true, // Visit events typically include flow tracking
  });
}

/**
 * Internal function to process marketing redirects
 */
async function _marketingProcess(
  tag: string,
  slug?: string,
  query?: Record<string, string>,
  options?: Partial<TrackingOptions>
): Promise<MarketingProcessResponse> {
  const startTime = Date.now();
  
  try {
    // Build query parameters matching legacy behavior
    let params = 'as_json=true';
    
    // Add mtfi from clientMeta or options
    const mtfi = options?.clientMeta?.mtfi || options?.mtfi;
    if (mtfi) {
      params += `&mtfi=${mtfi}`;
    }
    
    // Add created_at from clientMeta or options
    const createdAt = options?.clientMeta?.created_at || options?.createdAt;
    if (createdAt) {
      params += `&created_at=${encodeURIComponent(createdAt)}`;
    }
    
    // Add tag parameter
    if (tag) {
      params += `&tag=${encodeURIComponent(tag)}`;
    }
    
    // Add slug parameter with tag value (matching legacy behavior)
    if (slug) {
      params += `&slug=${encodeURIComponent(tag)}`;
    }
    
    // Add domain parameter if available
    if (options?.clientMeta?.domain) {
      params += `&domain=${encodeURIComponent(options.clientMeta.domain)}`;
    }
    
    // Add all query parameters, avoiding duplicates
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (!params.includes(`${key}=`)) {
          params += `&${key}=${encodeURIComponent(value)}`;
        }
      });
    }
    
    // Build API URL
    const apiUrl = `${env.API_BASE_URL}/api/marketing_process?${params}`;
    
    // Prepare request body
    let body: { js_meta?: string } | undefined;
    if (options?.jsMeta) {
      const jsMetaValue = typeof options.jsMeta === 'string' 
        ? options.jsMeta 
        : JSON.stringify(options.jsMeta);
      body = { js_meta: jsMetaValue };
    }
    
    // Build headers from client metadata
    const headers = buildTrackingHeaders(options?.clientMeta);
    
    logger.debug({
      tag,
      slug,
      mtfi,
      hasQuery: !!query,
      hasJsMeta: !!options?.jsMeta,
    }, 'Processing marketing redirect');
    
    const response = await httpClient<MarketingProcessResponse>(apiUrl, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
      timeout: API_TIMEOUT,
      cache: 'no-store',
      retry: {
        retries: 2,
        minTimeout: 10,
        maxTimeout: API_TIMEOUT,
        shouldRetry: (error, attempt) => {
          if (error instanceof Error && error.message.includes('timeout')) {
            return false;
          }
          if (error instanceof Error && error.name === 'APIError') {
            const apiError = error as Error & { status?: number };
            return (apiError.status ?? 0) >= 500 && (apiError.status ?? 0) < 600 && attempt > 0;
          }
          return attempt > 0;
        },
      },
    });
    
    const duration = Date.now() - startTime;
    
    logger.info({
      tag,
      slug,
      duration,
      mtfi: response.mtfi,
      type: response.type,
      hasUrl: !!response.url,
    }, 'Marketing process completed');
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error({
      tag,
      slug,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'Marketing process error');
    
    return {
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * The tracker service implementation matching legacy API format
 */
export const trackerApiService: ITrackerApiService = {
  /**
   * Track a general event
   */
  trackEvent: _trackEvent,

  /**
   * Track initial visit/session
   * This is a specialized version of trackEvent with eventType="visit"
   */
  trackVisit: _trackVisit,

  /**
   * Process marketing redirects
   */
  marketingProcess: _marketingProcess,
};
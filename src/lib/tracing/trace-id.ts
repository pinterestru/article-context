import { randomUUID } from 'crypto';
import type { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { COOKIES } from '@/config/constants';

export interface TraceContext {
  traceId: string;
  spanId?: string;
  userId?: string;
  clickId?: string;
  articleSlug?: string;
  cloakMode?: 'white' | 'black';
}

// Generate W3C Trace Context compliant ID
export function generateTraceId(): string {
  if (typeof window !== 'undefined') {
    // Browser environment - use crypto.randomUUID()
    return crypto.randomUUID().replace(/-/g, '');
  }
  // Server environment
  return randomUUID().replace(/-/g, '');
}

// Extract or generate trace ID from headers
export function getTraceId(headers?: Headers): string {
  if (!headers) {
    return generateTraceId();
  }
  
  // Check for existing trace from upstream
  const traceParent = headers.get('traceparent');
  if (traceParent) {
    const [, traceId] = traceParent.split('-');
    return traceId;
  }
  
  // Check for custom header
  const customTrace = headers.get('x-trace-id');
  if (customTrace) return customTrace;
  
  // Generate new trace ID
  return generateTraceId();
}

// Client-side helper to get trace ID
export function getClientTraceId(): string {
  if (typeof window !== 'undefined' && window.__TRACE_ID__) {
    return window.__TRACE_ID__;
  }
  return generateTraceId();
}

// Unified helper to get or create trace ID from cookies and headers
export function getOrCreateTraceId(cookies?: RequestCookies, headers?: Headers): string {
  // Check cookies first
  if (cookies) {
    const cookieTrace = cookies.get(COOKIES.TRACE)?.value;
    if (cookieTrace) {
      return cookieTrace;
    }
  }
  
  // Fall back to headers
  if (headers) {
    return getTraceId(headers);
  }
  
  // Generate new trace ID
  return generateTraceId();
}
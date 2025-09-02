import type { headers } from 'next/headers';

/**
 * Extract client IP address from request headers with fallback chain
 * Priority: cf-connecting-ip → x-forwarded-for → x-real-ip → unknown
 * 
 * @param headersList - Next.js headers object
 * @returns Client IP address or 'unknown'
 */
export function extractClientIp(headersList: Awaited<ReturnType<typeof headers>>): string {
  // Cloudflare header (highest priority, matching legacy)
  const cfIp = headersList.get('cf-connecting-ip');
  if (cfIp) return cfIp;
  
  // X-Forwarded-For (can contain multiple IPs, take the first)
  const xForwardedFor = headersList.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  // X-Real-IP fallback
  const xRealIp = headersList.get('x-real-ip');
  if (xRealIp) return xRealIp;
  
  // Default fallback
  return 'unknown';
}

/**
 * Safely extract domain from URL
 * Removes www. prefix and handles parsing errors
 * 
 * @param url - URL string to extract domain from
 * @returns Domain without www prefix or empty string on error
 */
export function extractDomain(url: string | null | undefined): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    // Return empty string for invalid URLs
    return '';
  }
}

/**
 * Extract request metadata for tracking
 * Combines IP extraction, user agent, and domain extraction
 * 
 * @param headersList - Next.js headers object
 * @param url - URL to extract domain from
 * @returns Object with ip, userAgent, domain, and url
 */
export function extractRequestMetadata(
  headersList: Awaited<ReturnType<typeof headers>>,
  url: string
): {
  ip: string;
  user_agent: string;
  domain: string;
  url: string;
} {
  return {
    ip: extractClientIp(headersList),
    user_agent: headersList.get('user-agent') || '',
    domain: extractDomain(url),
    url,
  };
}
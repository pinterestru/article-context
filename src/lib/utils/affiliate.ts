/**
 * General-purpose affiliate URL building utilities
 */

import { clientEnv } from '@/config/client-env';

/**
 * Parameters for building an affiliate URL
 */
export interface AffiliateUrlParams {
  /** Target URL or slug to redirect to */
  targetUrl: string;
  /** Campaign ID for tracking */
  campaignId?: string;
  /** Additional query parameters to append */
  queryParams?: Record<string, string>;
  /** UTM source parameter (defaults to current domain) */
  utmSource?: string;
  /** UTM medium parameter (defaults to 'affiliate') */
  utmMedium?: string;
  /** UTM campaign parameter (defaults to campaignId) */
  utmCampaign?: string;
  /** Base domain for the affiliate link (defaults to current domain) */
  baseDomain?: string;
  /** Redirect path pattern (defaults to '/c/') */
  redirectPath?: string;
  direct?: boolean;
}

/**
 * Get the current website domain
 * In browser: uses window.location.hostname
 * In server: uses WEBSITE_DOMAIN env var
 */
export function getCurrentDomain(): string {
  if (typeof window !== 'undefined') {
    return window.location.host.replace("www.", "");
  }
  return clientEnv.WEBSITE_DOMAIN || 'localhost';
}

/**
 * Extract domain and path from a URL
 */
export function parseTargetUrl(targetUrl: string): { domain: string; path: string } {
  if (!targetUrl || targetUrl === '#') {
    return { domain: '', path: '' };
  }

  try {
    // Handle URLs without protocol
    const urlToParse = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    const url = new URL(urlToParse);
    return {
      domain: url.hostname,
      path: url.pathname === '/' ? '' : url.pathname,
    };
  } catch {
    // If URL parsing fails, treat the entire string as domain
    return { domain: targetUrl, path: '' };
  }
}

/**
 * Build UTM parameters for tracking
 */
export function buildUtmParams(params: {
  source?: string;
  medium?: string;
  campaign?: string;
  baseDomain?: string;
}): Record<string, string> {
  const { source, medium, campaign, baseDomain } = params;
  const domain = baseDomain || getCurrentDomain();

  return {
    utm_source: source || domain,
    utm_medium: medium || 'affiliate',
    utm_campaign: campaign || '',
  };
}

/**
 * Build a complete affiliate URL
 * @example
 * buildAffiliateUrl({
 *   targetUrl: 'https://example.com/product',
 *   campaignId: 'promo-123',
 *   queryParams: { ref: 'special' }
 * })
 * // Returns: https://yourdomain.com/c/example.com/product?ref=special&utm_source=yourdomain.com&utm_medium=affiliate&utm_campaign=promo-123
 */
export function buildAffiliateUrl(params: AffiliateUrlParams): string {
  const {
    targetUrl,
    campaignId,
    queryParams = {},
    utmSource,
    utmMedium,
    utmCampaign,
    baseDomain,
    redirectPath = '/c/',
    direct = false,
  } = params;

  // Handle empty or hash URLs
  if (!targetUrl || targetUrl === '#') {
    return '#';
  }

  // Parse target URL
  const { domain, path } = parseTargetUrl(targetUrl);
  if (!domain) {
    return '#';
  }

  // Build base URL
  const websiteDomain = baseDomain || getCurrentDomain();
  const protocol = websiteDomain.startsWith("localhost") ? "http" : "https";
  
  if (direct) {
    return `https://${domain}${path}`
  }
  const baseUrl = `${protocol}://${websiteDomain}${redirectPath}${domain}${path}`;

  // Build query parameters
  const urlParams = new URLSearchParams();

  // Add custom query parameters first
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlParams.set(key, value);
    }
  });

  // Add UTM parameters
  const utmParams = buildUtmParams({
    source: utmSource,
    medium: utmMedium,
    campaign: utmCampaign || campaignId,
    baseDomain: websiteDomain,
  });

  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      urlParams.set(key, value);
    }
  });

  // Build final URL
  const queryString = urlParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Build affiliate URL from minimal parameters
 * Convenience function for simple use cases
 */
export function buildSimpleAffiliateUrl(
  targetUrl: string,
  campaignId: string,
  extraParams?: Record<string, string>
): string {
  return buildAffiliateUrl({
    targetUrl,
    campaignId,
    queryParams: extraParams,
  });
}

/**
 * Extract query parameters from the current URL
 * By default includes all parameters except those in excludeParams
 * 
 * @param excludeParams - Array of parameter names to exclude (defaults to internal params)
 * @returns Object containing query parameters
 */
export function getTrackingParams(excludeParams: string[] = ['promocode_id']): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);
  
  searchParams.forEach((value, key) => {
    // Include all parameters except those explicitly excluded
    if (!excludeParams.includes(key)) {
      params[key] = value;
    }
  });
  
  return params;
}

/**
 * Check if an affiliate URL has already been redirected at least once
 * Works both on server (with optional cookie object) and client
 * 
 * @param slug - The slug/identifier to check
 * @param serverCookie - Optional cookie object for server-side usage (e.g., from Next.js cookies())
 * @returns true if the URL has been redirected before, false otherwise
 */
export function hasAffiliateRedirected(
  slug: string,
  serverCookie?: { get: (name: string) => { value: string } | undefined }
): boolean {
  const cookieKey = `_mtfi__${slug}`;
  
  // Server-side check
  if (serverCookie) {
    const cookie = serverCookie.get(cookieKey);
    return !!cookie?.value;
  }
  
  // Client-side check
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieKey && value) {
        return true;
      }
    }
  }
  
  return false;
}
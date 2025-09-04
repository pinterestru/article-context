// src/lib/utils/domain.ts

import { clientEnv } from '@/config/client-env';
/**
 * Normalizes a hostname by removing the 'www.' prefix if it exists.
 * @param hostname The full hostname (e.g., 'www.example.com' or 'localhost:3000').
 * @returns The normalized domain (e.g., 'example.com' or 'localhost:3000').
 */
export function normalizeDomain(hostname: string): string {
  if (hostname.startsWith('www.')) {
    return hostname.substring(4)
  }
  return hostname
}


/**
 * Get the website domain for constructing absolute URLs
 * @deprecated Use getWebsiteUrl() for full URLs with protocol
 */
export function getWebsiteDomain(absolute?: boolean): string {
  // For client-side, use window.location.origin
  if (typeof window !== 'undefined' && !absolute) {
    return window.location.origin;
  }
  
  // For server-side or when absolute is true, use env variable
  const domain = clientEnv.WEBSITE_DOMAIN || 'localhost:3000';
  
  // Ensure domain has protocol
  if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
    const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
    return `${protocol}${domain}`;
  }
  
  return domain;
}

/**
 * Get the full website URL with protocol
 * @param options Configuration options
 * @returns Full URL with protocol (e.g., "https://example.com")
 */
export function getWebsiteUrl(options: { forceHttps?: boolean } = {}): string {
  // For client-side, use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // For server-side, use env variable
  const domain = clientEnv.WEBSITE_DOMAIN || 'localhost:3000';
  
  // If domain already has protocol, return as-is
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    return domain;
  }
  
  // Add protocol based on environment or options
  const protocol = options.forceHttps || process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
  return `${protocol}${domain}`;
}




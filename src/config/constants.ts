/**
 * Centralized constants used throughout the application
 */

// Cookie names
export const COOKIES = {
  MTFI: '_mtfi', // Marketing Traffic Flow ID
  TARGET: '_localized', // Cloaking target decision
  TRACE: '_trace', // Trace ID for request tracking
} as const;

// Cookie configuration
export const COOKIE_CONFIG = {
  MAX_AGE: 24 * 60 * 60, // 30 days in seconds
  SAME_SITE: 'lax' as const,
  PATH: '/',
  SECURE: process.env.NODE_ENV === 'production',
  HTTP_ONLY: false
} as const;

// Secure cookie configuration for sensitive data
export const SECURE_COOKIE_CONFIG = {
  ...COOKIE_CONFIG,
  SAME_SITE: 'strict' as const, // Most restrictive
  HTTP_ONLY: true, // Prevent XSS attacks
} as const;
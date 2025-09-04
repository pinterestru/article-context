import { type NextRequest, NextResponse } from 'next/server'
import { DEFAULT_LOCALE } from '@/config/client-env'
import { LOCALES, LOCALE_COOKIE_NAME, type Locale } from '@/config/i18n'
import * as Sentry from '@sentry/nextjs'
import { normalizeDomain } from '@/lib/utils/domain'

export default async function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl

  // Get the hostname from the request headers. Provide a fallback.
  const hostname = request.headers.get('host') || 'unknown'

  // Set the hostname as a searchable tag in Sentry.
  // This will apply to all errors and transactions for this request.
  Sentry.setTag('domain', normalizeDomain(hostname))

  // Handle locale detection
  const storedLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value
  const locale =
    storedLocale && LOCALES.includes(storedLocale as Locale) ? storedLocale : DEFAULT_LOCALE

  // Preserve click tracking parameters
  const yclid = searchParams.get('yclid')
  const gclid = searchParams.get('gclid')

  // Create response
  let response = NextResponse.next()

  // Set locale cookie if not present
  if (!storedLocale) {
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  // Set click tracking cookies if parameters exist
  if (yclid || gclid) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 300, // 5 minutes
      path: '/',
    }

    if (yclid) {
      response.cookies.set('yclid', yclid, cookieOptions)
    }

    if (gclid) {
      response.cookies.set('gclid', gclid, cookieOptions)
    }
  }

  return response
}

export const config = {
  // Match all pathnames except for
  // - api routes
  // - _next (Next.js internals)
  // - c routes (handled by rewrite rules)
  // - static files (e.g. favicon.ico, robots.txt, etc.)
  matcher: ['/((?!api|_next|c|.*\\..*).*)'],
}

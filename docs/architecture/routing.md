# Routing

## Route Configuration

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddleware } from 'next-intl/middleware'

// Supported locales
const locales = ['en', 'ru'] as const
const defaultLocale = 'en'

// next-intl middleware for i18n
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // Only show locale in URL when not default
})

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Handle article routes with click tracking
  if (pathname.includes('/article/')) {
    const response = intlMiddleware(request)
    
    // Preserve click IDs in the URL
    const yclid = request.nextUrl.searchParams.get('yclid')
    const gclid = request.nextUrl.searchParams.get('gclid')
    
    if (yclid || gclid) {
      // Set cookie for click ID to persist across navigation
      const clickId = yclid || gclid || ''
      response.cookies.set('click_id', clickId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 5 // 5 minutes
      })
    }
    
    return response
  }

  // Apply internationalization to all other routes
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)']
}
```

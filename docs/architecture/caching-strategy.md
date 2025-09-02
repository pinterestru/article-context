# Caching Strategy

## Overview

We implement a simplified two-layer caching strategy optimized for our affiliate article use case:

1. **React.cache()** - Request-scoped deduplication for server renders
2. **Next.js Data Cache** - Persistent caching for article content

## Layer 1: React Cache (Request Deduplication)

React.cache() prevents duplicate API calls within a single server render. This is crucial when multiple components need the same data during SSR.

```typescript
// src/lib/services/content/content.api.ts
import 'server-only'
import { cache } from 'react'
import { httpClient } from '@/lib/http/client'
import type { Article } from './content.types'

// Wrap service methods with React.cache() for automatic deduplication
export const contentApiService = {
  // This will only fetch once per request, even if called multiple times
  getArticle: cache(async (slug: string): Promise<Article | null> => {
    try {
      const response = await httpClient<Article>(
        `${process.env.CONTENT_API_URL}/articles/${slug}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CONTENT_API_TOKEN}`
          },
          // Enable Next.js caching with 5 minute revalidation
          next: { 
            revalidate: 300, // 5 minutes
            tags: [`article:${slug}`] // For targeted invalidation
          }
        }
      )
      
      return response
    } catch (error) {
      console.error(`Failed to fetch article ${slug}:`, error)
      return null
    }
  }),

  // Article metadata can be cached longer
  getArticleMetadata: cache(async (slug: string) => {
    try {
      const response = await httpClient(
        `${process.env.CONTENT_API_URL}/articles/${slug}/meta`,
        {
          next: { 
            revalidate: 3600, // 1 hour
            tags: [`article-meta:${slug}`]
          }
        }
      )
      
      return response
    } catch (error) {
      return null
    }
  })
}
```

## Layer 2: Next.js Data Cache (Persistent Caching)

The Next.js Data Cache automatically stores fetch results across requests. We configure different cache strategies based on content type:

```typescript
// src/lib/http/client.ts (updated)
import 'server-only'

interface FetchOptions extends RequestInit {
  timeout?: number
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
}

export async function httpClient<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 5000, next, ...fetchOptions } = options
  
  // Configure caching based on Next.js standards
  const cacheOptions: RequestInit = {
    ...fetchOptions,
    // @ts-ignore - Next.js extends RequestInit
    next: next || { revalidate: false }, // Default to no cache
  }
  
  // ... rest of implementation
}
```

## Caching Rules for Different Content Types

```typescript
// src/lib/services/tracker/tracker.api.ts
// NEVER CACHE cloaking decisions - security critical
const cloakDecision = await httpClient('/api/cloak/decide', {
  cache: 'no-store' // Explicit no caching
})

// src/lib/services/content/content.api.ts
// CACHE article content with short TTL
const article = await httpClient('/api/articles/slug', {
  next: { 
    revalidate: 300, // 5 minutes
    tags: ['articles']
  }
})

// CACHE static resources with long TTL
const config = await httpClient('/api/config', {
  next: { 
    revalidate: 3600 // 1 hour
  }
})
```

## Cache Invalidation Patterns

```typescript
// src/app/actions/admin.ts
'use server'

import { revalidateTag, revalidatePath } from 'next/cache'

// Invalidate specific article
export async function invalidateArticle(slug: string) {
  revalidateTag(`article:${slug}`)
  revalidateTag(`article-meta:${slug}`)
}

// Invalidate all articles
export async function invalidateAllArticles() {
  revalidateTag('articles')
  revalidatePath('/article/[slug]', 'page')
}

// Force refresh everything
export async function purgeCache() {
  revalidatePath('/', 'layout')
}
```

## Client-Side Caching with React Query

For client-side interactions (promocode widgets, analytics), we use React Query with conservative cache settings:

```typescript
// src/lib/api/client-config.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Conservative defaults for affiliate content
      staleTime: 0, // Always check freshness
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 2,
    },
  },
})

// Usage in client components
const { data: promoCode } = useQuery({
  queryKey: ['promo', articleSlug],
  queryFn: () => fetchPromoCode(articleSlug),
  staleTime: 60 * 1000, // Consider fresh for 1 minute
  gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
})
```

## Performance Monitoring

```typescript
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Log cache performance in development
    if (process.env.NODE_ENV === 'development') {
      const { performance } = await import('perf_hooks')
      
      // Monitor fetch performance
      global.fetch = new Proxy(global.fetch, {
        apply: async (target, thisArg, args) => {
          const start = performance.now()
          const result = await target.apply(thisArg, args)
          const duration = performance.now() - start
          
          console.log(`[CACHE] ${args[0]} - ${duration.toFixed(2)}ms`)
          return result
        }
      })
    }
  }
}
```

## Best Practices

1. **Never cache security-critical decisions** (cloaking, user verification)
2. **Use short TTLs for dynamic content** (5-15 minutes for articles)
3. **Tag all cached requests** for granular invalidation
4. **Monitor cache hit rates** in production
5. **Implement cache warming** for popular articles

## Cache Decision Matrix

| Content Type | Cache Strategy | TTL | Reason |
|-------------|----------------|-----|---------|
| Cloak Decision | `no-store` | 0 | Security critical |
| Article Content | `revalidate` | 5 min | Balance freshness/performance |
| Article Metadata | `revalidate` | 1 hour | Changes rarely |
| Promo Codes | React Query | 1 min | Time-sensitive |
| Static Config | `revalidate` | 1 hour | Rarely changes |

```typescript
// src/lib/api/client-config.ts
import { QueryClient } from '@tanstack/react-query'

// React Query configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cloak decisions should not be cached
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500) return false
        }
        // Retry up to 2 times for other errors
        return failureCount < 2
      }
    },
    mutations: {
      retry: false
    }
  }
})
```

# Type Safety & Validation

## Overview

We enforce comprehensive type safety and runtime validation throughout the application, with Zod schemas validating all external data at system boundaries.

## Core Principles

1. **Validate at the Edge**: All external data (API responses, form inputs, URL params) must be validated
2. **Parse, Don't Validate**: Use Zod's `parse()` to transform unknown data into typed data
3. **Single Source of Truth**: Zod schemas define both runtime validation and TypeScript types
4. **Fail Fast**: Invalid data should be caught immediately, not propagate through the system
5. **Detailed Error Messages**: Provide actionable error messages for debugging

## Comprehensive API Response Validation

```typescript
// src/lib/validation/schemas/article.ts
import { z } from 'zod'

// Strict schemas for all API responses
export const ArticleMetadataSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500),
  publishedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  author: z.object({
    name: z.string(),
    avatar: z.string().url().optional(),
  }),
  tags: z.array(z.string()).max(10),
  readTime: z.number().positive(),
  seo: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    canonicalUrl: z.string().url().optional(),
    ogImage: z.string().url().optional(),
  }),
})

export const ArticleContentSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  content: z.string().min(1),
  metadata: ArticleMetadataSchema,
  promocodes: z.array(z.object({
    code: z.string().regex(/^[A-Z0-9]{4,20}$/),
    discount: z.string(),
    description: z.string().optional(),
    validUntil: z.string().datetime().optional(),
    termsUrl: z.string().url().optional(),
    position: z.enum(['inline', 'sidebar', 'footer']),
  })).optional(),
  relatedArticles: z.array(z.object({
    slug: z.string(),
    title: z.string(),
    excerpt: z.string(),
    thumbnail: z.string().url().optional(),
  })).max(5).optional(),
})

// Response wrapper schemas
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.string(), z.any()).optional(),
    }).optional(),
    meta: z.object({
      timestamp: z.string().datetime(),
      version: z.string(),
      requestId: z.string().uuid(),
    }).optional(),
  })

// Paginated response schema
export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number().positive(),
      pageSize: z.number().positive().max(100),
      totalItems: z.number().nonnegative(),
      totalPages: z.number().nonnegative(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  })

// Types
export type ArticleMetadata = z.infer<typeof ArticleMetadataSchema>
export type ArticleContent = z.infer<typeof ArticleContentSchema>
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  meta?: {
    timestamp: string
    version: string
    requestId: string
  }
}
```

## Enhanced HTTP Client with Validation

```typescript
// src/lib/http/client.ts
import 'server-only'
import { z } from 'zod'
import { logger } from '@/lib/logging/logger'

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError,
    public rawData: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

interface FetchOptions<T extends z.ZodType> extends RequestInit {
  timeout?: number
  schema?: T
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
}

export async function httpClient<T = unknown>(
  url: string,
  options: FetchOptions<z.ZodType<T>> = {}
): Promise<T> {
  const { timeout = 5000, schema, next, ...fetchOptions } = options
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      // @ts-ignore - Next.js extends RequestInit
      next: next || { revalidate: false },
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new APIError(
        `API request failed: ${response.statusText}`,
        response.status,
        `HTTP_${response.status}`
      )
    }
    
    const rawData = await response.json()
    
    // If schema provided, validate the response
    if (schema) {
      try {
        const validatedData = schema.parse(rawData)
        return validatedData as T
      } catch (error) {
        if (error instanceof z.ZodError) {
          logger.error('api_response_validation_failed', {
            url,
            errors: error.errors,
            rawData,
          })
          
          throw new ValidationError(
            'Invalid API response format',
            error,
            rawData
          )
        }
        throw error
      }
    }
    
    // No schema provided, return raw data
    return rawData as T
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}
```

## Form Validation Patterns

```typescript
// src/lib/validation/schemas/forms.ts
import { z } from 'zod'

// Reusable field schemas
export const EmailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim()

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')

export const PhoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')

// Form schemas
export const NewsletterSubscriptionSchema = z.object({
  email: EmailSchema,
  name: z.string().min(2).max(50).optional(),
  preferences: z.array(z.enum(['deals', 'news', 'guides'])).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms' }),
  }),
})

export const FeedbackFormSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  email: EmailSchema.optional(),
  articleSlug: z.string(),
  screenshot: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Max file size is 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png'].includes(file.type),
      'Only JPEG and PNG files are allowed'
    )
    .optional(),
})

// Type-safe form parsing
export function parseFormData<T extends z.ZodType>(
  formData: FormData,
  schema: T
): z.SafeParseReturnType<z.input<T>, z.output<T>> {
  const data = Object.fromEntries(formData.entries())
  
  // Handle array fields
  const arrayFields = new Set<string>()
  for (const key of formData.keys()) {
    if (formData.getAll(key).length > 1) {
      arrayFields.add(key)
    }
  }
  
  arrayFields.forEach((key) => {
    data[key] = formData.getAll(key) as any
  })
  
  return schema.safeParse(data)
}
```

## URL Parameter Validation

```typescript
// src/lib/validation/schemas/params.ts
import { z } from 'zod'

// Search params schemas
export const ArticleSearchParamsSchema = z.object({
  // Click tracking
  yclid: z.string().optional(),
  gclid: z.string().optional(),
  fbclid: z.string().optional(),
  
  // UTM parameters
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  
  // Pagination
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  
  // Filtering
  tag: z.string().optional(),
  author: z.string().optional(),
  
  // Sorting
  sort: z.enum(['newest', 'oldest', 'popular']).optional(),
})

// Route params schemas
export const ArticleRouteParamsSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid article slug'),
})

// Helper to parse and validate search params
export function parseSearchParams<T extends z.ZodType>(
  searchParams: URLSearchParams | Record<string, string | string[]>,
  schema: T
): z.infer<T> {
  const params = searchParams instanceof URLSearchParams
    ? Object.fromEntries(searchParams.entries())
    : searchParams
  
  const result = schema.safeParse(params)
  
  if (!result.success) {
    logger.warn('invalid_search_params', {
      errors: result.error.errors,
      params,
    })
    // Return default values for invalid params
    return schema.parse({})
  }
  
  return result.data
}
```

## Service Layer with Validation

```typescript
// src/lib/services/content/content.api.ts
import 'server-only'
import { cache } from 'react'
import { httpClient } from '@/lib/http/client'
import { 
  ArticleContentSchema,
  PaginatedResponseSchema,
  ApiResponseSchema 
} from '@/lib/validation/schemas/article'
import type { ArticleContent } from './content.types'

export const contentApiService = {
  // Single article with validation
  getArticle: cache(async (slug: string): Promise<ArticleContent | null> => {
    try {
      const response = await httpClient(
        `${process.env.CONTENT_API_URL}/articles/${slug}`,
        {
          schema: ApiResponseSchema(ArticleContentSchema),
          headers: {
            'Authorization': `Bearer ${process.env.CONTENT_API_TOKEN}`
          },
          next: { 
            revalidate: 300,
            tags: [`article:${slug}`]
          }
        }
      )
      
      return response.data
    } catch (error) {
      if (error instanceof ValidationError) {
        // Log validation errors for monitoring
        logger.error('article_validation_failed', {
          slug,
          errors: error.errors.errors,
        })
      }
      return null
    }
  }),

  // List articles with pagination validation
  listArticles: cache(async (params: {
    page?: number
    limit?: number
    tag?: string
  }) => {
    const query = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 10),
      ...(params.tag && { tag: params.tag }),
    })
    
    const response = await httpClient(
      `${process.env.CONTENT_API_URL}/articles?${query}`,
      {
        schema: PaginatedResponseSchema(ArticleContentSchema),
        next: { 
          revalidate: 60,
          tags: ['articles']
        }
      }
    )
    
    return response
  }),
}
```

## Error Boundary with Validation Errors

```typescript
// src/app/error.tsx
'use client'

import { useEffect } from 'react'
import { ValidationError } from '@/lib/http/client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (error instanceof ValidationError) {
      // Send validation errors to monitoring
      console.error('Validation Error:', {
        message: error.message,
        errors: error.errors.errors,
        rawData: error.rawData,
      })
    }
  }, [error])
  
  if (error instanceof ValidationError) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-red-600">
          Data Validation Error
        </h2>
        <p className="mt-2">
          The server returned unexpected data format. This has been reported.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600">
            Technical Details
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-4 rounded">
            {JSON.stringify(error.errors.errors, null, 2)}
          </pre>
        </details>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Try Again
        </button>
      </div>
    )
  }
  
  // Default error UI
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

## Testing Validation

```typescript
// src/lib/validation/__tests__/schemas.test.ts
import { describe, it, expect } from 'vitest'
import { ArticleContentSchema, EmailSchema } from '../schemas'

describe('Validation Schemas', () => {
  describe('ArticleContentSchema', () => {
    it('validates correct article data', () => {
      const validArticle = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-article',
        content: '<h1>Test</h1>',
        metadata: {
          title: 'Test Article',
          slug: 'test-article',
          excerpt: 'Test excerpt',
          publishedAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          author: { name: 'John Doe' },
          tags: ['test'],
          readTime: 5,
          seo: {},
        },
      }
      
      expect(() => ArticleContentSchema.parse(validArticle)).not.toThrow()
    })
    
    it('rejects invalid slug format', () => {
      const invalidArticle = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'Test Article!', // Invalid: contains space and special char
        content: '<h1>Test</h1>',
        metadata: { /* ... */ },
      }
      
      expect(() => ArticleContentSchema.parse(invalidArticle)).toThrow()
    })
  })
  
  describe('EmailSchema', () => {
    it('normalizes email to lowercase', () => {
      const result = EmailSchema.parse('USER@EXAMPLE.COM')
      expect(result).toBe('user@example.com')
    })
    
    it('trims whitespace', () => {
      const result = EmailSchema.parse('  user@example.com  ')
      expect(result).toBe('user@example.com')
    })
  })
})
```

## Best Practices

1. **Always validate at system boundaries**: API responses, form inputs, URL params
2. **Use `.parse()` for critical paths**: Fail fast with clear errors
3. **Use `.safeParse()` for recoverable errors**: Handle validation gracefully
4. **Create reusable schemas**: Share common patterns like email, phone, etc.
5. **Log validation errors**: Monitor for API contract changes
6. **Test your schemas**: Ensure they catch the errors you expect
7. **Document complex validations**: Add comments explaining business rules

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| **Components** | PascalCase | `PromocodeWidget.tsx`, `ArticleContent.tsx` |
| **Component Props** | PascalCase + Props suffix | `PromocodeWidgetProps` |
| **Hooks** | camelCase with 'use' prefix | `useCloak`, `usePromocode` |
| **Utilities** | camelCase | `formatDate`, `parseArticle` |
| **Constants** | SCREAMING_SNAKE_CASE | `MAX_RETRY_ATTEMPTS`, `CLOAK_WINDOW_MS` |
| **Types/Interfaces** | PascalCase | `Article`, `CloakDecision` |
| **API Functions** | camelCase | `fetchArticle`, `verifyCloakStatus` |
| **Event Handlers** | camelCase with 'handle' prefix | `handleCopy`, `handleClick` |
| **Boolean Props** | camelCase with 'is/has' prefix | `isLoading`, `hasError` |
| **Files (non-components)** | kebab-case | `use-cloak.ts`, `format-date.ts` |

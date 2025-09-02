# Affiliate Article UI Frontend Architecture Document

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-01-07 | 1.0 | Initial frontend architecture document | Winston (Architect) |

## Template and Framework Selection

**Current Framework Setup:**
- **Framework**: Next.js with App Router
- **Language**: TypeScript for full type safety
- **Styling**: Tailwind CSS (no Axios - using native fetch)
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: React Query (@tanstack/react-query)
- **Internationalization**: next-intl
- **Analytics**: PostHog + Sentry
- **Testing**: Vitest + Testing Library + MSW

**Existing Project Structure to Maintain:**
```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   └── article/             # Article routes
│       └── [slug]/          # Dynamic article pages
├── components/              # UI components
│   ├── layout/             # Layout patterns
│   ├── ui/                 # shadcn/ui primitives
│   └── shared/             # Custom components
├── lib/                    # Core logic
├── providers/              # React Context providers
├── messages/               # i18n translations
└── middleware.ts           # i18n locale detection
```

**Key Architectural Decisions Already Made:**
1. **No starter template** - Custom implementation from scratch
2. **Two-stage cloaking mechanism** with CSS-based content control
3. **Server-side rendering** for SEO and performance
4. **Native fetch API** instead of Axios for data fetching
5. **shadcn/ui** for component library (not a traditional UI kit)

## Frontend Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Framework | Next.js | 15.3.4 | Full-stack React framework with App Router | SSR for SEO, fastest initial page load (<100ms), built-in API routes for cloaking logic |
| UI Library | React | 19.1 | Component-based UI development | Latest stable with improved performance, server components, and concurrent features including useActionState, useOptimistic |
| State Management | @tanstack/react-query | Latest | Server state management and caching | Handles TDS API calls, caching for performance, automatic retries |
| Routing | Next.js App Router | Built-in | File-based routing with RSC support | Native to Next.js, supports streaming, perfect for dynamic article routes |
| Build Tool | Next.js/Turbopack | Built-in | Fast bundling and HMR | Zero-config, optimized for Next.js, faster than webpack |
| Styling | Tailwind CSS | 4.1.11 | Utility-first CSS framework | Rapid development, small bundle size, perfect for dynamic class switching (is-black-mode) |
| Testing | Vitest | Latest | Unit and component testing | Fast, ESM-first, compatible with React Testing Library |
| Component Library | shadcn/ui + Radix UI | Latest | Accessible, unstyled components | Copy-paste components, full control, perfect for custom promocode widgets |
| Form Handling | Native React | Built-in | Simple form interactions | No complex forms needed, reduces bundle size vs react-hook-form |
| Animation | CSS + Radix UI | Built-in | Subtle UI transitions | Lightweight, no heavy animation library needed for simple transitions |
| Dev Tools | TypeScript + ESLint + Prettier | Latest | Type safety and code quality | Catch errors early, maintain consistent code style |

**Additional Core Dependencies:**
- **next-intl**: Internationalization for Russian/English support
- **@sentry/nextjs**: Error tracking and performance monitoring
- **posthog-js**: Analytics for tracking promocode interactions
- **clsx + tailwind-merge**: Utility for dynamic className management
- **lucide-react**: Lightweight icon set for UI elements

## Project Structure

```plaintext
affiliate-article-ui/
├── .github/                      # GitHub Actions CI/CD workflows
│   └── workflows/
│       ├── ci.yml               # Test, lint, type-check on PR
│       └── deploy.yml           # Deploy to production
├── .husky/                      # Git hooks
│   ├── pre-commit              # Run lint-staged
│   └── pre-push                # Run tests
├── .vscode/                     # VS Code settings
│   ├── settings.json           # Project-specific settings
│   └── extensions.json         # Recommended extensions
├── public/                      # Static assets
│   ├── fonts/                  # Web fonts
│   ├── images/                 # Static images
│   └── favicon.ico            # Favicon
├── src/
│   ├── app/                    # App Router (pages + API)
│   │   ├── (marketing)/        # Route group for public pages
│   │   │   ├── layout.tsx      # Marketing layout
│   │   │   └── article/
│   │   │       └── [slug]/
│   │   │           ├── page.tsx        # Article page (Server Component)
│   │   │           ├── loading.tsx     # Loading skeleton
│   │   │           └── error.tsx       # Error boundary
│   │   ├── api/                # API routes
│   │   │   ├── cloak/
│   │   │   │   └── route.ts    # Initial cloak decision endpoint
│   │   │   ├── verify-cloak/
│   │   │   │   └── route.ts    # Fingerprint verification endpoint
│   │   │   └── go/
│   │   │       └── [token]/
│   │   │           └── route.ts # Affiliate link proxy
│   │   ├── layout.tsx          # Root layout
│   │   ├── global-error.tsx    # Global error boundary
│   │   └── not-found.tsx       # 404 page
│   ├── components/
│   │   ├── article/            # Article-specific components
│   │   │   ├── ArticleContent.tsx      # Main article renderer
│   │   │   ├── PromocodeWidget.tsx     # Promocode overlay widget
│   │   │   └── ActionHydrator.tsx      # Hydrates [data-action] elements
│   │   ├── layout/             # Layout components
│   │   │   ├── Container.tsx   # Max-width container
│   │   │   └── Section.tsx     # Section wrapper
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx      # Button component
│   │   │   ├── dialog.tsx      # Dialog component
│   │   │   ├── card.tsx        # Card component
│   │   │   └── toast.tsx       # Toast notifications
│   │   └── shared/             # Shared components
│   │       ├── CopyButton.tsx  # Copy to clipboard button
│   │       └── Countdown.tsx   # Offer countdown timer
│   ├── lib/
│   │   ├── api/               # API client functions
│   │   │   ├── tracker.ts     # TDS API client
│   │   │   └── content.ts     # Content fetching
│   │   ├── cloak/             # Cloaking logic
│   │   │   ├── fingerprint.ts # Browser fingerprinting
│   │   │   ├── detector.ts    # Investigation detection
│   │   │   └── constants.ts   # Cloaking constants
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── use-cloak.ts   # Cloak state hook
│   │   │   └── use-promocode.ts # Promocode interactions
│   │   ├── analytics/         # Analytics setup
│   │   │   ├── posthog.ts     # PostHog client
│   │   │   └── sentry.ts      # Sentry config
│   │   └── utils/             # Utility functions
│   │       ├── cn.ts          # className helper
│   │       └── formatters.ts  # Date/number formatters
│   ├── providers/
│   │   ├── cloak-provider.tsx # Cloaking context
│   │   ├── query-provider.tsx # React Query setup
│   │   └── intl-provider.tsx  # Internationalization
│   ├── types/
│   │   ├── article.ts         # Article types
│   │   ├── cloak.ts           # Cloaking types
│   │   └── api.ts             # API response types
│   ├── messages/              # i18n translations
│   │   ├── en.json            # English
│   │   └── ru.json            # Russian
│   ├── styles/
│   │   └── globals.css        # Global styles + Tailwind
│   └── middleware.ts          # Next.js middleware
├── .env.example               # Environment variables template
├── .eslintrc.json            # ESLint config
├── .gitignore                # Git ignore rules
├── .nvmrc                    # Node version
├── CLAUDE.md                 # AI assistant guidelines
├── components.json           # shadcn/ui config
├── instrumentation.ts        # Sentry/PostHog setup
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies
├── postcss.config.mjs        # PostCSS config
├── prettier.config.js        # Code formatting
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript config
└── vitest.config.ts          # Test configuration
```

**Naming Convention Summary:**
- **Components**: PascalCase (e.g., `CopyButton.tsx`, `ArticleContent.tsx`)
- **shadcn/ui components**: lowercase (e.g., `button.tsx`, `dialog.tsx`) - following shadcn convention
- **Pages/layouts**: lowercase (e.g., `page.tsx`, `layout.tsx`) - Next.js convention
- **Non-component files**: kebab-case (e.g., `use-cloak.ts`, `tracker.ts`)
- **Directories**: kebab-case (e.g., `verify-cloak/`)

## Component Standards

### Component Template

```typescript
'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface PromocodeWidgetProps extends HTMLAttributes<HTMLDivElement> {
  code: string
  discount: string
  description?: string
  expiresAt?: Date
  onCopy?: (code: string) => void
}

export const PromocodeWidget = forwardRef<HTMLDivElement, PromocodeWidgetProps>(
  ({ code, discount, description, expiresAt, onCopy, className, ...props }, ref) => {
    const handleCopy = async () => {
      await navigator.clipboard.writeText(code)
      onCopy?.(code)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-lg border bg-card p-6 shadow-lg',
          'transition-all duration-200 hover:shadow-xl',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Exclusive Discount</p>
            <p className="text-2xl font-bold">{discount}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-2 rounded-md bg-primary px-4 py-2',
              'text-primary-foreground transition-colors hover:bg-primary/90'
            )}
          >
            <span className="font-mono text-sm">{code}</span>
            <CopyIcon className="h-4 w-4" />
          </button>
        </div>
        {expiresAt && (
          <p className="mt-4 text-xs text-muted-foreground">
            Expires: {new Intl.DateTimeFormat('en-US').format(expiresAt)}
          </p>
        )}
      </div>
    )
  }
)

PromocodeWidget.displayName = 'PromocodeWidget'
```

## React 19 Features

### Overview

React 19 introduces powerful new hooks that simplify common patterns in our affiliate article application. We adopt these features for better UX and cleaner code.

### Key Features We Use

1. **useActionState** - Simplified form handling with Server Actions
2. **useOptimistic** - Instant UI feedback for promocode interactions
3. **useFormStatus** - Loading states without prop drilling
4. **use** - Simplified async data handling in Client Components

### useActionState for Forms

Replace complex form state management with React 19's built-in solution:

```typescript
// src/app/actions/feedback.ts
'use server'

import { z } from 'zod'
import { trackerApiService } from '@/lib/services/tracker/tracker.api'

const FeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  articleSlug: z.string(),
})

export type FeedbackState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  timestamp?: number
}

export async function submitFeedback(
  prevState: FeedbackState,
  formData: FormData
): Promise<FeedbackState> {
  try {
    const data = FeedbackSchema.parse({
      rating: Number(formData.get('rating')),
      comment: formData.get('comment'),
      articleSlug: formData.get('articleSlug'),
    })
    
    // Submit feedback to API
    await trackerApiService.submitFeedback(data)
    
    return {
      status: 'success',
      message: 'Thank you for your feedback!',
      timestamp: Date.now(),
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to submit',
      timestamp: Date.now(),
    }
  }
}
```

```typescript
// src/components/article/FeedbackForm.tsx
'use client'

import { useActionState } from 'react'
import { submitFeedback, type FeedbackState } from '@/app/actions/feedback'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

export function FeedbackForm({ articleSlug }: { articleSlug: string }) {
  const initialState: FeedbackState = { status: 'idle' }
  const [state, formAction, isPending] = useActionState(
    submitFeedback,
    initialState
  )
  
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="articleSlug" value={articleSlug} />
      
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <label key={rating} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={rating}
              required
              className="sr-only"
            />
            <Star className="h-6 w-6 hover:fill-yellow-400" />
          </label>
        ))}
      </div>
      
      <textarea
        name="comment"
        placeholder="Additional comments (optional)"
        className="w-full rounded-md border p-2"
        rows={3}
      />
      
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit Feedback'}
      </Button>
      
      {state.status === 'success' && (
        <p className="text-green-600">{state.message}</p>
      )}
      
      {state.status === 'error' && (
        <p className="text-red-600">{state.message}</p>
      )}
    </form>
  )
}
```

### useOptimistic for Promocode Interactions

Provide instant feedback when users interact with promocodes:

```typescript
// src/components/article/PromocodeWidget.tsx
'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { analytics } from '@/lib/analytics/posthog'

interface PromocodeWidgetProps {
  code: string
  discount: string
  description?: string
  articleSlug: string
  traceId: string
}

export function PromocodeWidget({
  code,
  discount,
  description,
  articleSlug,
  traceId,
}: PromocodeWidgetProps) {
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  
  // Optimistic state for immediate feedback
  const [optimisticCopied, setOptimisticCopied] = useOptimistic(
    copied,
    (state, newValue: boolean) => newValue
  )
  
  const handleCopy = () => {
    startTransition(async () => {
      // Immediately show copied state
      setOptimisticCopied(true)
      
      try {
        // Copy to clipboard
        await navigator.clipboard.writeText(code)
        
        // Track analytics
        analytics.promocodeInteraction({
          action: 'copied',
          code,
          articleSlug,
          traceId,
        })
        
        // Confirm the optimistic update
        setCopied(true)
        
        // Reset after 2 seconds
        setTimeout(() => {
          setCopied(false)
          setOptimisticCopied(false)
        }, 2000)
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticCopied(false)
        console.error('Failed to copy:', error)
      }
    })
  }
  
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-card p-6',
        'transition-all duration-200 hover:shadow-lg',
        optimisticCopied && 'ring-2 ring-green-500'
      )}
      data-testid="promocode-widget"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Exclusive Discount</p>
          <p className="text-2xl font-bold">{discount}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        
        <button
          onClick={handleCopy}
          disabled={isPending}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2',
            'transition-all duration-200',
            optimisticCopied
              ? 'bg-green-500 text-white'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          <span className="font-mono text-sm">{code}</span>
          {optimisticCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {optimisticCopied && (
        <div className="absolute inset-x-0 bottom-0 h-1 bg-green-500 animate-pulse" />
      )}
    </div>
  )
}
```

### useFormStatus for Nested Loading States

Show loading states in child components without prop drilling:

```typescript
// src/components/shared/SubmitButton.tsx
'use client'

import { useFormStatus } from 'react-dom'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps extends ButtonProps {
  loadingText?: string
}

export function SubmitButton({ 
  children, 
  loadingText = 'Loading...',
  ...props 
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  
  return (
    <Button {...props} disabled={pending || props.disabled}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

// Usage in any form:
<form action={serverAction}>
  <input name="email" type="email" required />
  <SubmitButton loadingText="Subscribing...">
    Subscribe to Newsletter
  </SubmitButton>
</form>
```

### use Hook for Async Data

Simplify async data handling in Client Components:

```typescript
// src/components/article/RelatedArticles.tsx
'use client'

import { use, Suspense } from 'react'
import Link from 'next/link'

// This promise would typically come from a parent Server Component
interface RelatedArticlesProps {
  articlesPromise: Promise<Array<{
    slug: string
    title: string
    excerpt: string
  }>>
}

function RelatedArticlesList({ articlesPromise }: RelatedArticlesProps) {
  // use() unwraps the promise - component suspends until resolved
  const articles = use(articlesPromise)
  
  return (
    <div className="grid gap-4">
      {articles.map((article) => (
        <Link
          key={article.slug}
          href={`/article/${article.slug}`}
          className="block rounded-lg border p-4 hover:shadow-md"
        >
          <h3 className="font-semibold">{article.title}</h3>
          <p className="text-sm text-muted-foreground">{article.excerpt}</p>
        </Link>
      ))}
    </div>
  )
}

export function RelatedArticles({ articlesPromise }: RelatedArticlesProps) {
  return (
    <Suspense fallback={<RelatedArticlesSkeleton />}>
      <RelatedArticlesList articlesPromise={articlesPromise} />
    </Suspense>
  )
}

function RelatedArticlesSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}
```

### Advanced Pattern: Optimistic Cart Updates

For future e-commerce features:

```typescript
// src/components/shop/AddToCartButton.tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { addToCart } from '@/app/actions/cart'
import { ShoppingCart } from 'lucide-react'

interface CartItem {
  id: string
  quantity: number
}

export function AddToCartButton({ 
  productId, 
  cartItems 
}: { 
  productId: string
  cartItems: CartItem[]
}) {
  const [isPending, startTransition] = useTransition()
  
  // Optimistic cart state
  const [optimisticCart, addOptimisticItem] = useOptimistic(
    cartItems,
    (state, newItem: CartItem) => {
      const existing = state.find(item => item.id === newItem.id)
      if (existing) {
        return state.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...state, newItem]
    }
  )
  
  const isInCart = optimisticCart.some(item => item.id === productId)
  const quantity = optimisticCart.find(item => item.id === productId)?.quantity || 0
  
  const handleAddToCart = () => {
    startTransition(async () => {
      // Optimistically add to cart
      addOptimisticItem({ id: productId, quantity: 1 })
      
      // Server action will revalidate and update real cart
      await addToCart(productId)
    })
  }
  
  return (
    <button
      onClick={handleAddToCart}
      disabled={isPending}
      className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white"
    >
      <ShoppingCart className="h-4 w-4" />
      {isInCart ? `In Cart (${quantity})` : 'Add to Cart'}
    </button>
  )
}
```

### Best Practices

1. **useActionState**: Perfect for forms with validation and error handling
2. **useOptimistic**: Use for instant feedback on user actions (copy, like, add to cart)
3. **useFormStatus**: Place in child components to avoid prop drilling
4. **use**: Simplifies promise handling but requires Suspense boundary
5. **Always provide fallback UI**: Users should see loading states
6. **Handle errors gracefully**: Revert optimistic updates on failure

### Migration Guide

From old pattern to React 19:

```typescript
// OLD: Complex state management
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState(null)
const [data, setData] = useState(null)

const handleSubmit = async (e) => {
  e.preventDefault()
  setIsLoading(true)
  try {
    const result = await submitForm(data)
    setData(result)
  } catch (err) {
    setError(err)
  } finally {
    setIsLoading(false)
  }
}

// NEW: With useActionState
const [state, formAction, isPending] = useActionState(
  submitFormAction,
  initialState
)

// That's it! React handles loading, error, and success states
```

## Type Safety & Validation

### Overview

We enforce comprehensive type safety and runtime validation throughout the application, with Zod schemas validating all external data at system boundaries.

### Core Principles

1. **Validate at the Edge**: All external data (API responses, form inputs, URL params) must be validated
2. **Parse, Don't Validate**: Use Zod's `parse()` to transform unknown data into typed data
3. **Single Source of Truth**: Zod schemas define both runtime validation and TypeScript types
4. **Fail Fast**: Invalid data should be caught immediately, not propagate through the system
5. **Detailed Error Messages**: Provide actionable error messages for debugging

### Comprehensive API Response Validation

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

### Enhanced HTTP Client with Validation

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

### Form Validation Patterns

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

### URL Parameter Validation

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

### Service Layer with Validation

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

### Error Boundary with Validation Errors

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

### Testing Validation

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

### Best Practices

1. **Always validate at system boundaries**: API responses, form inputs, URL params
2. **Use `.parse()` for critical paths**: Fail fast with clear errors
3. **Use `.safeParse()` for recoverable errors**: Handle validation gracefully
4. **Create reusable schemas**: Share common patterns like email, phone, etc.
5. **Log validation errors**: Monitor for API contract changes
6. **Test your schemas**: Ensure they catch the errors you expect
7. **Document complex validations**: Add comments explaining business rules

### Naming Conventions

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

## State Management

### Store Structure

```plaintext
src/
├── providers/
│   ├── cloak-provider.tsx      # Cloaking state context
│   ├── query-provider.tsx      # React Query setup
│   └── intl-provider.tsx       # Internationalization
└── lib/
    ├── hooks/
    │   ├── use-cloak.ts        # Cloak state hook
    │   └── use-promocode.ts    # Promocode interaction hook
    └── store/
        └── cloak-store.ts      # Cloak state logic
```

### State Management Template

```typescript
// src/lib/store/cloak-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CloakState {
  mode: 'white' | 'black'
  verificationToken: string | null
  isVerified: boolean
  userId: string | null
  fingerprint: string | null
  firstVisitAt: number | null
  isBlacklisted: boolean
  
  // Actions
  setMode: (mode: 'white' | 'black') => void
  setVerificationData: (data: { token: string; userId: string }) => void
  setFingerprint: (fingerprint: string) => void
  markAsVerified: () => void
  markAsBlacklisted: () => void
  resetState: () => void
}

const FIVE_MINUTES = 5 * 60 * 1000

export const useCloakStore = create<CloakState>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: 'white',
      verificationToken: null,
      isVerified: false,
      userId: null,
      fingerprint: null,
      firstVisitAt: null,
      isBlacklisted: false,

      // Actions
      setMode: (mode) => {
        const state = get()
        const now = Date.now()
        
        // Enforce 5-minute window
        if (state.firstVisitAt && now - state.firstVisitAt > FIVE_MINUTES) {
          set({ mode: 'white', isBlacklisted: true })
          return
        }
        
        set({ 
          mode,
          firstVisitAt: state.firstVisitAt || now
        })
      },

      setVerificationData: ({ token, userId }) => {
        set({ 
          verificationToken: token,
          userId 
        })
      },

      setFingerprint: (fingerprint) => {
        const state = get()
        
        // Check for fingerprint reuse
        if (state.fingerprint && state.fingerprint !== fingerprint) {
          set({ 
            mode: 'white',
            isBlacklisted: true,
            fingerprint 
          })
          return
        }
        
        set({ fingerprint })
      },

      markAsVerified: () => set({ isVerified: true }),
      
      markAsBlacklisted: () => {
        set({ 
          mode: 'white',
          isBlacklisted: true 
        })
      },

      resetState: () => {
        set({
          mode: 'white',
          verificationToken: null,
          isVerified: false,
          userId: null,
          fingerprint: null,
          firstVisitAt: null,
          isBlacklisted: false
        })
      }
    }),
    {
      name: 'cloak-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userId: state.userId,
        isBlacklisted: state.isBlacklisted,
        fingerprint: state.fingerprint
      })
    }
  )
)
```

## API Integration

### Server-Only Service Layer Pattern

We adopt a strict server-only pattern for all API integrations to prevent accidental client-side API key exposure and centralize API logic. This pattern ensures that sensitive credentials and internal API endpoints are never exposed to the browser.

### Service Structure

```plaintext
src/lib/
├── http/                 # Shared HTTP client (server-only)
│   └── client.ts        # Base fetch wrapper with auth
├── services/            # API services (all server-only)
│   ├── tracker/        # TDS API integration
│   │   ├── tracker.api.ts      # Service implementation
│   │   └── tracker.types.ts    # Types and schemas
│   └── content/        # Content API (if using CMS)
│       ├── content.api.ts
│       └── content.types.ts
```

### Base HTTP Client

```typescript
// src/lib/http/client.ts
import 'server-only' // This ensures the file is never included in client bundles

class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number
}

// Base HTTP client for all server-side API calls
export async function httpClient<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 5000, ...fetchOptions } = options
  
  // Create AbortController for timeout
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
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new APIError(
        `API request failed: ${response.statusText}`,
        response.status,
        `HTTP_${response.status}`
      )
    }
    
    const data = await response.json()
    return data as T
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, 'TIMEOUT')
    }
    
    throw error
  }
}
```

### Service Implementation Pattern

```typescript
// src/lib/services/tracker/tracker.types.ts
import { z } from 'zod'

// Response schemas with comprehensive validation
export const CloakDecisionSchema = z.object({
  mode: z.enum(['white', 'black']),
  verifyToken: z.string().uuid().optional(),
  reason: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  ttl: z.number().positive().optional(),
})

export const VerificationResponseSchema = z.object({
  valid: z.boolean(),
  blacklisted: z.boolean().optional(),
  reason: z.string().optional(),
  riskScore: z.number().min(0).max(100).optional(),
  timestamp: z.string().datetime().optional(),
})

// Types
export type CloakDecision = z.infer<typeof CloakDecisionSchema>
export type VerificationResponse = z.infer<typeof VerificationResponseSchema>

// Service interface
export interface ITrackerApiService {
  getCloakDecision(params: {
    slug: string
    clickId?: string
    userAgent?: string
    ip?: string
  }): Promise<CloakDecision>
  
  verifyFingerprint(params: {
    token: string
    fingerprint: Record<string, any>
    userId: string
  }): Promise<VerificationResponse>
}
```

```typescript
// src/lib/services/tracker/tracker.api.ts
import 'server-only'
import { httpClient } from '@/lib/http/client'
import { 
  type ITrackerApiService,
  type CloakDecision,
  type VerificationResponse,
  CloakDecisionSchema,
  VerificationResponseSchema
} from './tracker.types'

// Get API configuration from server-only environment variables
const API_BASE_URL = process.env.TRACKER_API_URL || ''
const API_KEY = process.env.TRACKER_API_KEY || ''

class TrackerAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'TrackerAPIError'
  }
}

// Service implementation
export const trackerApiService: ITrackerApiService = {
  async getCloakDecision(params) {
    try {
      const response = await httpClient<unknown>(`${API_BASE_URL}/api/cloak/decide`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          slug: params.slug,
          clickId: params.clickId,
          userAgent: params.userAgent,
          ip: params.ip,
          timestamp: Date.now()
        }),
        cache: 'no-store' // Never cache cloak decisions
      })
      
      // Validate response with Zod
      return CloakDecisionSchema.parse(response)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new TrackerAPIError(
          'Invalid response format from TDS',
          500,
          'PARSE_ERROR'
        )
      }
      throw error
    }
  },

  async verifyFingerprint(params) {
    try {
      const response = await httpClient<unknown>(`${API_BASE_URL}/api/cloak/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'X-User-ID': params.userId,
          'X-Verify-Token': params.token
        },
        body: JSON.stringify({
          fingerprint: params.fingerprint,
          timestamp: Date.now()
        }),
        cache: 'no-store'
      })
      
      // Validate response with Zod
      return VerificationResponseSchema.parse(response)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new TrackerAPIError(
          'Invalid verification response',
          500,
          'PARSE_ERROR'  
        )
      }
      throw error
    }
  }
}
```

### Usage in Server Components

```typescript
// src/app/article/[slug]/page.tsx
import { trackerApiService } from '@/lib/services/tracker/tracker.api'
import { headers } from 'next/headers'

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  // Get request headers for cloaking decision
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  const ip = headersList.get('x-forwarded-for') || ''
  
  // Make server-side API call
  const cloakDecision = await trackerApiService.getCloakDecision({
    slug: params.slug,
    userAgent,
    ip
  })
  
  // Render based on decision
  return (
    <div className={cloakDecision.mode === 'black' ? 'is-black-mode' : ''}>
      {/* Content */}
    </div>
  )
}
```

### Usage in Server Actions

```typescript
// src/app/actions/verify-cloak.ts
'use server'

import { trackerApiService } from '@/lib/services/tracker/tracker.api'

export async function verifyCloakAction(
  token: string,
  fingerprint: Record<string, any>,
  userId: string
) {
  try {
    const result = await trackerApiService.verifyFingerprint({
      token,
      fingerprint,
      userId
    })
    
    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Cloak verification failed:', error)
    return {
      success: false,
      error: 'Verification failed'
    }
  }
}
```

### Benefits of This Pattern

1. **Security**: API keys and sensitive endpoints never reach the client
2. **Type Safety**: Full TypeScript support with Zod validation
3. **Centralization**: All API logic in one place, easy to maintain
4. **Error Handling**: Consistent error handling across all API calls
5. **Testing**: Easy to mock the service layer for testing

## Caching Strategy

### Overview

We implement a simplified two-layer caching strategy optimized for our affiliate article use case:

1. **React.cache()** - Request-scoped deduplication for server renders
2. **Next.js Data Cache** - Persistent caching for article content

### Layer 1: React Cache (Request Deduplication)

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

### Layer 2: Next.js Data Cache (Persistent Caching)

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

### Caching Rules for Different Content Types

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

### Cache Invalidation Patterns

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

### Client-Side Caching with React Query

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

### Performance Monitoring

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

### Best Practices

1. **Never cache security-critical decisions** (cloaking, user verification)
2. **Use short TTLs for dynamic content** (5-15 minutes for articles)
3. **Tag all cached requests** for granular invalidation
4. **Monitor cache hit rates** in production
5. **Implement cache warming** for popular articles

### Cache Decision Matrix

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

## Routing

### Route Configuration

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

## Styling Guidelines

### Styling Approach

For the Affiliate Article UI, we'll use Tailwind CSS 4.1.11 with a utility-first approach, complemented by CSS custom properties for theming.

### Global Theme Variables

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Colors - Light Mode */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    
    /* Spacing */
    --radius: 0.5rem;
    --container-padding: 1rem;
    --section-spacing: 4rem;
    
    /* Typography */
    --font-sans: system-ui, -apple-system, sans-serif;
    --font-mono: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    
    /* Animations */
    --animation-fast: 150ms;
    --animation-normal: 300ms;
    --animation-slow: 500ms;
  }
  
  .dark {
    /* Colors - Dark Mode */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
  }
  
  /* Critical cloaking styles */
  .is-black-mode .cloak-hide {
    @apply hidden;
  }
  
  .cloak-show {
    @apply hidden;
  }
  
  .is-black-mode .cloak-show {
    @apply block;
  }
}
```

## Testing Strategy

### Overview

We implement a focused testing pyramid optimized for our affiliate article platform, with emphasis on critical paths:

1. **Unit Tests** (Vitest) - Component logic and utilities
2. **Integration Tests** (Vitest + MSW) - API interactions and component integration
3. **E2E Tests** (Playwright) - Critical cloaking flows and user journeys

### Test Structure

```plaintext
tests/
├── setup.ts                    # Global test setup
├── msw/                        # Mock Service Worker
│   ├── server.ts              # MSW server setup
│   ├── handlers/              # API mock handlers
│   │   ├── tracker.ts         # TDS API mocks
│   │   └── content.ts         # Content API mocks
│   └── fixtures/              # Test data fixtures
│       ├── articles.ts        # Sample articles
│       └── cloak-responses.ts # Cloak decision fixtures
├── utils/                      # Test utilities
│   ├── test-utils.tsx         # Custom render functions
│   └── mock-providers.tsx     # Provider wrappers
└── e2e/                        # Playwright tests
    ├── cloak-flow.spec.ts     # Critical cloaking tests
    ├── article-view.spec.ts   # Article viewing tests
    └── fixtures/              # E2E test data
```

### MSW Setup for API Mocking

```typescript
// tests/msw/server.ts
import { setupServer } from 'msw/node'
import { trackerHandlers } from './handlers/tracker'
import { contentHandlers } from './handlers/content'

export const server = setupServer(
  ...trackerHandlers,
  ...contentHandlers
)

// tests/msw/handlers/tracker.ts
import { http, HttpResponse } from 'msw'
import { fixtures } from '../fixtures/cloak-responses'

export const trackerHandlers = [
  // Mock cloak decision endpoint
  http.post('*/api/cloak/decide', async ({ request }) => {
    const body = await request.json()
    
    // Simulate suspicious user
    if (body.userAgent?.includes('bot')) {
      return HttpResponse.json(fixtures.whiteMode)
    }
    
    // Normal user gets black mode
    return HttpResponse.json(fixtures.blackModeWithToken)
  }),

  // Mock fingerprint verification
  http.post('*/api/cloak/verify', async ({ request }) => {
    const token = request.headers.get('X-Verify-Token')
    
    if (token === 'invalid-token') {
      return HttpResponse.json({ valid: false, blacklisted: true })
    }
    
    return HttpResponse.json({ valid: true })
  })
]

// tests/msw/fixtures/cloak-responses.ts
export const fixtures = {
  whiteMode: {
    mode: 'white',
    reason: 'suspicious_user_agent'
  },
  blackModeWithToken: {
    mode: 'black',
    verifyToken: 'test-verify-token-123',
    reason: 'trusted_source'
  }
}
```

### Test Utilities

```typescript
// tests/utils/test-utils.tsx
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import { CloakProvider } from '@/providers/cloak-provider'
import messages from '@/messages/en.json'

// Create a new QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  })
}

interface TestProviderProps {
  children: React.ReactNode
  initialCloakState?: Partial<CloakState>
}

function TestProviders({ children, initialCloakState }: TestProviderProps) {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider messages={messages} locale="en">
        <CloakProvider initialState={initialCloakState}>
          {children}
        </CloakProvider>
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

// Custom render function
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & { initialCloakState?: Partial<CloakState> }
) {
  const { initialCloakState, ...renderOptions } = options || {}
  
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders initialCloakState={initialCloakState}>
        {children}
      </TestProviders>
    ),
    ...renderOptions,
  })
}

// Re-export testing library utilities
export * from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
```

### Global Test Setup

```typescript
// tests/setup.ts
import { afterAll, afterEach, beforeAll } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { server } from './msw/server'

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

### Component Testing Examples

```typescript
// src/components/article/ArticleContent.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/tests/utils/test-utils'
import { ArticleContent } from './ArticleContent'
import { server } from '@/tests/msw/server'
import { http, HttpResponse } from 'msw'

describe('ArticleContent', () => {
  it('renders article in white mode by default', () => {
    renderWithProviders(
      <ArticleContent 
        content="<h1>Test Article</h1><p>Safe content</p>"
        slug="test-article"
      />
    )
    
    expect(screen.getByRole('heading', { name: 'Test Article' })).toBeInTheDocument()
    expect(screen.queryByTestId('promocode-widget')).not.toBeInTheDocument()
  })

  it('shows promocodes in black mode', async () => {
    renderWithProviders(
      <ArticleContent 
        content='<h1>Test Article</h1><div data-action="promocode" data-code="SAVE20">Click here</div>'
        slug="test-article"
      />,
      { initialCloakState: { mode: 'black' } }
    )
    
    await waitFor(() => {
      expect(screen.getByTestId('promocode-widget')).toBeInTheDocument()
    })
  })

  it('handles fingerprint verification failure', async () => {
    // Override the default handler for this test
    server.use(
      http.post('*/api/cloak/verify', () => {
        return HttpResponse.json({ valid: false, blacklisted: true })
      })
    )
    
    renderWithProviders(
      <ArticleContent 
        content="<h1>Test Article</h1>"
        slug="test-article"
      />,
      { initialCloakState: { mode: 'black', verificationToken: 'test-token' } }
    )
    
    // Should revert to white mode after failed verification
    await waitFor(() => {
      expect(document.body.classList.contains('is-black-mode')).toBe(false)
    })
  })
})
```

### E2E Testing with Playwright

```typescript
// tests/e2e/cloak-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Cloaking Flow', () => {
  test('trusted user sees black mode content', async ({ page }) => {
    // Navigate with trusted parameters
    await page.goto('/article/test-article?yclid=trusted123')
    
    // Should see black mode content
    await expect(page.locator('body')).toHaveClass(/is-black-mode/)
    await expect(page.getByTestId('promocode-widget')).toBeVisible()
    
    // Test promocode interaction
    await page.getByRole('button', { name: /copy code/i }).click()
    await expect(page.getByText('Copied!')).toBeVisible()
  })

  test('suspicious user is shown white mode', async ({ page, context }) => {
    // Modify user agent to trigger white mode
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (compatible; Googlebot/2.1)'
      })
    })
    
    await page.goto('/article/test-article')
    
    // Should see white mode content only
    await expect(page.locator('body')).not.toHaveClass(/is-black-mode/)
    await expect(page.getByTestId('promocode-widget')).not.toBeVisible()
  })

  test('enforces 5-minute decision window', async ({ page }) => {
    await page.goto('/article/test-article')
    
    // Initially white mode
    await expect(page.locator('body')).not.toHaveClass(/is-black-mode/)
    
    // Wait 5 minutes (or mock time in test)
    await page.evaluate(() => {
      // Mock time advancement
      const originalDate = Date.now
      Date.now = () => originalDate() + 6 * 60 * 1000 // 6 minutes
    })
    
    // Try to switch modes - should be blocked
    await page.evaluate(() => {
      document.body.classList.add('is-black-mode')
    })
    
    // Verify mode was reverted
    await expect(page.locator('body')).not.toHaveClass(/is-black-mode/)
  })

  test('tracks fingerprint changes', async ({ page, context }) => {
    // First visit
    await page.goto('/article/test-article?yclid=trusted123')
    await expect(page.locator('body')).toHaveClass(/is-black-mode/)
    
    // Clear cookies and visit again
    await context.clearCookies()
    await page.goto('/article/test-article?yclid=trusted123')
    
    // Should be blocked due to fingerprint mismatch
    await expect(page.locator('body')).not.toHaveClass(/is-black-mode/)
  })
})

// tests/e2e/article-view.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Article Viewing', () => {
  test('renders article with proper SEO tags', async ({ page }) => {
    await page.goto('/article/seo-test-article')
    
    // Check meta tags
    await expect(page).toHaveTitle(/SEO Test Article/)
    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description).toContain('article description')
  })

  test('handles missing articles gracefully', async ({ page }) => {
    await page.goto('/article/non-existent-article')
    
    await expect(page.getByRole('heading', { name: /not found/i })).toBeVisible()
    expect(page.url()).toContain('/404')
  })

  test('tracks promocode interactions', async ({ page }) => {
    // Intercept analytics calls
    const analyticsRequests: string[] = []
    await page.route('**/api/analytics/**', route => {
      analyticsRequests.push(route.request().url())
      route.fulfill({ status: 200 })
    })
    
    await page.goto('/article/tracked-article?yclid=tracking123')
    
    // Interact with promocode
    await page.getByRole('button', { name: /copy code/i }).click()
    
    // Verify analytics were sent
    expect(analyticsRequests).toContainEqual(
      expect.stringContaining('promocode_copied')
    )
  })
})
```

### Testing Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockServiceWorker.js',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})

// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

### Testing Best Practices

1. **Test Pyramid Balance**: More unit/integration tests, fewer E2E tests
2. **Critical Path Focus**: E2E tests only for cloaking decisions and core flows
3. **Mock at the Network Layer**: Use MSW for consistent API mocking
4. **Test User Behavior**: Focus on what users do, not implementation details
5. **Performance Testing**: Include tests for loading states and timeouts
6. **Security Testing**: Verify cloaking rules can't be bypassed

## Observability Strategy

### Overview

We implement a comprehensive observability strategy focused on tracing cloaking decisions and user journeys through correlated logs, errors, and analytics.

### Core Components

1. **Trace ID Correlation** - Universal identifier linking all telemetry
2. **Structured Logging** - JSON logs with consistent schema
3. **Error Tracking** - Sentry with enriched context
4. **User Analytics** - PostHog with session replay
5. **Performance Monitoring** - Web Vitals and API latency

### Trace ID Architecture

```typescript
// src/lib/tracing/trace-id.ts
import { randomUUID } from 'crypto'

export interface TraceContext {
  traceId: string
  spanId?: string
  userId?: string
  clickId?: string
  articleSlug?: string
  cloakMode?: 'white' | 'black'
}

// Generate W3C Trace Context compliant ID
export function generateTraceId(): string {
  return randomUUID().replace(/-/g, '')
}

// Extract or generate trace ID from headers
export function getTraceId(headers: Headers): string {
  // Check for existing trace from upstream
  const traceParent = headers.get('traceparent')
  if (traceParent) {
    const [, traceId] = traceParent.split('-')
    return traceId
  }
  
  // Check for custom header
  const customTrace = headers.get('x-trace-id')
  if (customTrace) return customTrace
  
  // Generate new trace ID
  return generateTraceId()
}
```

### Middleware Integration

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getTraceId } from '@/lib/tracing/trace-id'
import { logger } from '@/lib/logging/logger'

export function middleware(request: NextRequest) {
  const traceId = getTraceId(request.headers)
  const startTime = Date.now()
  
  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-trace-id', traceId)
  
  // Create response with trace ID
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  
  // Add trace ID to response headers
  response.headers.set('x-trace-id', traceId)
  
  // Log the request
  logger.info('request_received', {
    traceId,
    method: request.method,
    path: request.nextUrl.pathname,
    query: Object.fromEntries(request.nextUrl.searchParams),
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    ip: request.headers.get('x-forwarded-for') || request.ip,
  })
  
  // Log response timing
  const duration = Date.now() - startTime
  logger.info('request_completed', {
    traceId,
    duration,
    path: request.nextUrl.pathname,
  })
  
  return response
}
```

### Structured Logging

```typescript
// src/lib/logging/logger.ts
import pino from 'pino'

// Server-side logger configuration
const isServer = typeof window === 'undefined'

export const logger = isServer
  ? pino({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => ({ level: label }),
        bindings: () => ({
          environment: process.env.NODE_ENV,
          service: 'affiliate-article-ui',
          version: process.env.NEXT_PUBLIC_APP_VERSION,
        }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      // Redact sensitive fields
      redact: {
        paths: [
          'email',
          'password',
          'token',
          'api_key',
          '*.email',
          '*.password',
          'headers.authorization',
          'headers.cookie',
        ],
        censor: '[REDACTED]',
      },
    })
  : // Client-side logger (browser-safe)
    {
      info: (msg: string, data?: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[INFO] ${msg}`, data)
        }
      },
      error: (msg: string, data?: any) => {
        console.error(`[ERROR] ${msg}`, data)
      },
      warn: (msg: string, data?: any) => {
        console.warn(`[WARN] ${msg}`, data)
      },
      debug: (msg: string, data?: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.debug(`[DEBUG] ${msg}`, data)
        }
      },
    }

// Typed logger for cloaking events
export const cloakLogger = {
  decision: (traceId: string, data: {
    mode: 'white' | 'black'
    reason: string
    userAgent?: string
    clickId?: string
    articleSlug?: string
  }) => {
    logger.info('cloak_decision', {
      traceId,
      ...data,
      timestamp: new Date().toISOString(),
    })
  },
  
  verification: (traceId: string, data: {
    valid: boolean
    blacklisted?: boolean
    fingerprint?: string
    reason?: string
  }) => {
    logger.info('cloak_verification', {
      traceId,
      ...data,
      timestamp: new Date().toISOString(),
    })
  },
  
  violation: (traceId: string, data: {
    type: 'time_window' | 'fingerprint_mismatch' | 'blacklisted'
    details?: any
  }) => {
    logger.warn('cloak_violation', {
      traceId,
      ...data,
      timestamp: new Date().toISOString(),
    })
  },
}
```

### Sentry Integration

```typescript
// src/lib/logging/sentry.ts
import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event, hint) {
      // Add trace context if available
      if (typeof window !== 'undefined') {
        const traceId = window.__TRACE_ID__
        if (traceId) {
          event.tags = { ...event.tags, trace_id: traceId }
        }
      }
      
      // Redact sensitive data
      if (event.request?.cookies) {
        event.request.cookies = '[REDACTED]'
      }
      
      return event
    },
    integrations: [
      new Sentry.BrowserTracing({
        // Track navigation timing
        routingInstrumentation: Sentry.nextRouterInstrumentation,
      }),
    ],
  })
}

// Helper to enrich Sentry context
export function setSentryContext(context: {
  traceId: string
  userId?: string
  clickId?: string
  cloakMode?: string
}) {
  Sentry.setTags({
    trace_id: context.traceId,
    cloak_mode: context.cloakMode,
  })
  
  if (context.userId) {
    Sentry.setUser({ id: context.userId })
  }
  
  Sentry.setContext('session', {
    clickId: context.clickId,
    traceId: context.traceId,
  })
}
```

### PostHog Analytics Integration

```typescript
// src/lib/analytics/posthog.ts
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false, // Manual control
      capture_pageleave: true,
      // Link errors to session replays
      beforeSend(event) {
        // Add trace ID to all events
        const traceId = window.__TRACE_ID__
        if (traceId) {
          event.properties = {
            ...event.properties,
            trace_id: traceId,
          }
        }
        return event
      },
    })
  }
}

// Typed analytics events
export const analytics = {
  pageView: (properties: {
    path: string
    articleSlug?: string
    cloakMode?: string
    traceId?: string
  }) => {
    posthog?.capture('$pageview', properties)
  },
  
  cloakDecision: (properties: {
    mode: 'white' | 'black'
    reason: string
    articleSlug: string
    traceId: string
  }) => {
    posthog?.capture('cloak_decision', properties)
  },
  
  promocodeInteraction: (properties: {
    action: 'viewed' | 'copied' | 'clicked'
    code: string
    articleSlug: string
    position?: string
    traceId: string
  }) => {
    posthog?.capture('promocode_interaction', properties)
  },
  
  conversionEvent: (properties: {
    type: 'click' | 'lead' | 'sale'
    value?: number
    articleSlug: string
    traceId: string
  }) => {
    posthog?.capture('conversion', properties)
  },
}
```

### Client-Side Initialization

```typescript
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    const { logger } = await import('@/lib/logging/logger')
    
    // Log server startup
    logger.info('server_started', {
      node_version: process.version,
      next_version: require('next/package.json').version,
    })
  }
}

// src/app/layout.tsx (client initialization)
'use client'

import { useEffect } from 'react'
import { initSentry, setSentryContext } from '@/lib/logging/sentry'
import { initPostHog } from '@/lib/analytics/posthog'

function ClientInit({ traceId }: { traceId: string }) {
  useEffect(() => {
    // Store trace ID globally for client-side logging
    window.__TRACE_ID__ = traceId
    
    // Initialize observability tools
    initSentry()
    initPostHog()
    
    // Set initial context
    setSentryContext({ traceId })
    
    // Clean up on unmount
    return () => {
      delete window.__TRACE_ID__
    }
  }, [traceId])
  
  return null
}
```

### Server Component Integration

```typescript
// src/app/article/[slug]/page.tsx
import { headers } from 'next/headers'
import { trackerApiService } from '@/lib/services/tracker/tracker.api'
import { logger, cloakLogger } from '@/lib/logging/logger'
import { getTraceId } from '@/lib/tracing/trace-id'

export default async function ArticlePage({ 
  params,
  searchParams 
}: { 
  params: { slug: string }
  searchParams: { [key: string]: string }
}) {
  const headersList = headers()
  const traceId = getTraceId(headersList)
  
  // Log page request
  logger.info('article_page_requested', {
    traceId,
    slug: params.slug,
    clickId: searchParams.yclid || searchParams.gclid,
    referer: headersList.get('referer'),
  })
  
  try {
    // Make cloak decision with trace ID
    const cloakDecision = await trackerApiService.getCloakDecision({
      slug: params.slug,
      clickId: searchParams.yclid || searchParams.gclid,
      userAgent: headersList.get('user-agent') || '',
      ip: headersList.get('x-forwarded-for') || '',
    })
    
    // Log the decision
    cloakLogger.decision(traceId, {
      mode: cloakDecision.mode,
      reason: cloakDecision.reason || 'none',
      articleSlug: params.slug,
      clickId: searchParams.yclid || searchParams.gclid,
    })
    
    return (
      <>
        <ClientInit traceId={traceId} />
        <ArticleContent 
          mode={cloakDecision.mode}
          verifyToken={cloakDecision.verifyToken}
          traceId={traceId}
        />
      </>
    )
  } catch (error) {
    logger.error('article_page_error', {
      traceId,
      error: error instanceof Error ? error.message : 'Unknown error',
      slug: params.slug,
    })
    
    // Default to white mode on error
    return <ArticleContent mode="white" traceId={traceId} />
  }
}
```

### Debugging Dashboard

```typescript
// src/app/api/debug/trace/[traceId]/route.ts
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logging/logger'

// Development-only endpoint to view logs for a trace
export async function GET(
  request: Request,
  { params }: { params: { traceId: string } }
) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }
  
  // In production, this would query your log aggregator
  // For development, return mock data
  return NextResponse.json({
    traceId: params.traceId,
    logs: [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'request_received',
        data: { path: '/article/test' },
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'cloak_decision',
        data: { mode: 'black', reason: 'trusted_source' },
      },
    ],
  })
}
```

### Monitoring Best Practices

1. **Trace Every Decision**: All cloaking decisions must include trace ID
2. **Log Liberally**: Server-side logs are cheap, log all decision points
3. **Structured Data**: Always use consistent field names in logs
4. **Privacy First**: Never log PII or sensitive data
5. **Correlation is Key**: Link logs, errors, and analytics via trace ID
6. **Monitor Performance**: Track decision latency and page load times

### Key Metrics to Track

| Metric | Purpose | Alert Threshold |
|--------|---------|-----------------|
| Cloak Decision Time | Performance | > 200ms |
| White Mode Rate | Security effectiveness | > 80% |
| Verification Failures | Fingerprint issues | > 5% |
| 5-min Violations | Security breaches | > 1% |
| Conversion Rate | Business impact | < 2% |

## Environment Configuration

```bash
# .env.example

# API Configuration
NEXT_PUBLIC_TRACKER_API_URL=https://api.tracker.example.com
TRACKER_API_KEY=your-secret-api-key-here

# Affiliate Configuration
NEXT_PUBLIC_FALLBACK_URL=https://partner.example.com
AFFILIATE_NETWORK_ID=your-network-id

# Analytics & Monitoring
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=affiliate-article-ui

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
NEXT_PUBLIC_CLOAK_WINDOW_MS=300000  # 5 minutes in milliseconds

# Development
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_SHOW_DEV_TOOLS=false

# Deployment
VERCEL_URL=
VERCEL_ENV=development
NODE_ENV=development

# Internationalization
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,ru

# Content API (if using external CMS)
CONTENT_API_URL=https://cms.example.com/api
CONTENT_API_TOKEN=your-content-api-token

# Redis Cache (for production)
REDIS_URL=redis://localhost:6379
REDIS_TOKEN=your-redis-token

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=100
```

## Development Standards

### Overview

We enforce strict development standards to ensure code quality, maintainability, and consistency across the codebase. These standards are non-negotiable and must be followed by all developers.

### File Organization & Naming

```typescript
// ✅ CORRECT: Descriptive file names with proper conventions
src/
├── components/
│   ├── article/
│   │   ├── ArticleContent.tsx        // Component: PascalCase
│   │   ├── ArticleContent.test.tsx   // Test: .test.tsx
│   │   └── ArticleContent.stories.tsx // Storybook: .stories.tsx
│   └── ui/
│       └── button.tsx                 // shadcn/ui: lowercase
├── hooks/
│   ├── use-cloak.ts                  // Hook: use-* prefix, kebab-case
│   └── use-cloak.test.ts             // Test: .test.ts
├── lib/
│   ├── utils/
│   │   ├── format-date.ts            // Utility: kebab-case
│   │   └── format-date.test.ts       // Test: .test.ts
│   └── constants.ts                  // Constants: kebab-case
├── types/
│   └── article.ts                    // Types: kebab-case
└── app/
    ├── actions/
    │   └── feedback.ts               // Server Actions: kebab-case
    └── api/
        └── cloak/
            └── route.ts              // API Routes: route.ts

// ❌ WRONG: Inconsistent naming
src/
├── components/
│   ├── article_content.tsx          // Wrong: snake_case
│   ├── ArticleContent/              // Wrong: folder for single component
│   │   └── index.tsx
│   └── UI/                          // Wrong: uppercase folder
└── hooks/
    └── useCloakHook.ts              // Wrong: redundant "Hook" suffix
```

### TypeScript Standards

```typescript
// ✅ CORRECT: Strict TypeScript with proper types

// 1. Always define explicit return types
export function calculateDiscount(price: number, percentage: number): number {
  return price * (percentage / 100)
}

// 2. Use const assertions for literals
const CLOAK_MODES = ['white', 'black'] as const
type CloakMode = typeof CLOAK_MODES[number]

// 3. Prefer interfaces for object types
interface ArticleProps {
  title: string
  content: string
  author?: Author // Optional properties marked clearly
}

// 4. Use discriminated unions for state
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Article }
  | { status: 'error'; error: Error }

// 5. Avoid any at all costs
function processData<T extends Record<string, unknown>>(data: T): T {
  // Process data with proper typing
  return data
}

// ❌ WRONG: Poor TypeScript practices

// 1. Missing return type
export function calculateDiscount(price, percentage) {
  return price * (percentage / 100)
}

// 2. Using any
function processData(data: any) {
  return data.someProperty // Unsafe access
}

// 3. Type assertions without validation
const user = JSON.parse(userJson) as User // Dangerous!

// 4. Implicit any in callbacks
items.map(item => item.name) // item is implicitly any
```

### Component Standards

```typescript
// ✅ CORRECT: Well-structured component

'use client' // 1. Explicit client/server designation

import { forwardRef, memo } from 'react'
import { cn } from '@/lib/utils/cn'
import type { ButtonHTMLAttributes } from 'react'

// 2. Export interface for props
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

// 3. Use forwardRef for components that might need refs
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    // 4. Early returns for edge cases
    if (loading) {
      return (
        <button
          ref={ref}
          className={cn(buttonVariants({ variant, size }), className)}
          disabled
          {...props}
        >
          <Spinner className="mr-2" />
          Loading...
        </button>
      )
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

// 5. Display name for debugging
Button.displayName = 'Button'

// 6. Memoize if needed for performance
export default memo(Button)

// ❌ WRONG: Poor component structure

// Missing 'use client' directive
import React from 'react'

// Props not exported, no interface
const Button = ({ variant, size, ...props }) => {
  // Inline styles
  const styles = {
    padding: size === 'lg' ? '12px' : '8px',
    background: variant === 'primary' ? 'blue' : 'gray'
  }

  // No forwardRef, no display name
  return <button style={styles} {...props} />
}

export default Button
```

### Hook Standards

```typescript
// ✅ CORRECT: Well-structured custom hook

// File: src/hooks/use-clipboard.ts
import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/toast'

interface UseClipboardOptions {
  timeout?: number
  onSuccess?: (text: string) => void
  onError?: (error: Error) => void
}

interface UseClipboardReturn {
  copy: (text: string) => Promise<void>
  copied: boolean
  error: Error | null
}

export function useClipboard({
  timeout = 2000,
  onSuccess,
  onError,
}: UseClipboardOptions = {}): UseClipboardReturn {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setError(null)
        onSuccess?.(text)
        
        setTimeout(() => setCopied(false), timeout)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to copy')
        setError(error)
        setCopied(false)
        onError?.(error)
        toast.error('Failed to copy to clipboard')
      }
    },
    [timeout, onSuccess, onError]
  )

  return { copy, copied, error }
}

// ❌ WRONG: Poor hook structure

// Wrong naming convention
export function ClipboardHook() {
  const [copied, setCopied] = useState(false)
  
  // Not using useCallback
  const copy = async (text) => {
    // No error handling
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }
  
  // Incomplete return
  return { copy }
}
```

### Error Handling Standards

```typescript
// ✅ CORRECT: Comprehensive error handling

// 1. Custom error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 2. Type-safe error handling
async function fetchArticle(slug: string): Promise<Result<Article, ApiError>> {
  try {
    const response = await fetch(`/api/articles/${slug}`)
    
    if (!response.ok) {
      return {
        ok: false,
        error: new ApiError(
          'Failed to fetch article',
          'ARTICLE_NOT_FOUND',
          response.status
        ),
      }
    }
    
    const data = await response.json()
    const validated = ArticleSchema.safeParse(data)
    
    if (!validated.success) {
      return {
        ok: false,
        error: new ApiError(
          'Invalid article data',
          'VALIDATION_ERROR',
          500,
          validated.error
        ),
      }
    }
    
    return { ok: true, data: validated.data }
  } catch (error) {
    return {
      ok: false,
      error: new ApiError(
        'Network error',
        'NETWORK_ERROR',
        0,
        error
      ),
    }
  }
}

// 3. Error boundaries
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error boundary caught:', error)
    Sentry.captureException(error, { contexts: { react: info } })
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} reset={this.reset} />
    }
    
    return this.props.children
  }
}

// ❌ WRONG: Poor error handling

async function fetchArticle(slug) {
  try {
    const response = await fetch(`/api/articles/${slug}`)
    return response.json() // No validation, no error checking
  } catch (error) {
    console.log(error) // Just logging
    return null // Losing error information
  }
}
```

### API Integration Standards

```typescript
// ✅ CORRECT: Proper API integration

// 1. Centralized API client
class ApiClient {
  private baseUrl: string
  private headers: HeadersInit
  
  constructor(baseUrl: string, headers: HeadersInit = {}) {
    this.baseUrl = baseUrl
    this.headers = {
      'Content-Type': 'application/json',
      ...headers,
    }
  }
  
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    }
    
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new ApiError(
        `API Error: ${response.statusText}`,
        `HTTP_${response.status}`,
        response.status
      )
    }
    
    return response.json()
  }
}

// 2. Type-safe API methods
export const articleApi = {
  async getBySlug(slug: string): Promise<Article> {
    const data = await apiClient.request<unknown>(`/articles/${slug}`)
    return ArticleSchema.parse(data)
  },
  
  async list(params: ListParams): Promise<PaginatedResponse<Article>> {
    const query = new URLSearchParams(params as any)
    const data = await apiClient.request<unknown>(`/articles?${query}`)
    return PaginatedArticleSchema.parse(data)
  },
}

// ❌ WRONG: Poor API integration

// Scattered fetch calls
export async function getArticle(slug) {
  const response = await fetch(`${process.env.API_URL}/articles/${slug}`)
  return response.json()
}

// No type safety
export async function updateArticle(id, data) {
  return fetch(`/api/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
```

### Performance Standards

```typescript
// ✅ CORRECT: Performance-conscious code

// 1. Lazy load heavy components
const PromocodeWidget = dynamic(
  () => import('@/components/article/PromocodeWidget'),
  { 
    loading: () => <PromocodeWidgetSkeleton />,
    ssr: false,
  }
)

// 2. Optimize re-renders
const ArticleList = memo(({ articles }: Props) => {
  // Use stable references
  const sortedArticles = useMemo(
    () => articles.sort((a, b) => b.date - a.date),
    [articles]
  )
  
  // Stable callbacks
  const handleClick = useCallback((id: string) => {
    router.push(`/article/${id}`)
  }, [router])
  
  return (
    <div>
      {sortedArticles.map(article => (
        <Article 
          key={article.id}
          article={article}
          onClick={handleClick}
        />
      ))}
    </div>
  )
})

// 3. Image optimization
<Image
  src={article.thumbnail}
  alt={article.title}
  width={800}
  height={400}
  placeholder="blur"
  blurDataURL={article.blurDataUrl}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={index < 3} // Priority for above-fold images
/>

// ❌ WRONG: Performance issues

// No memoization
const ArticleList = ({ articles }) => {
  // Recreated every render
  const sorted = articles.sort((a, b) => b.date - a.date)
  
  return sorted.map(article => (
    // Inline function recreated every render
    <Article 
      key={article.id}
      onClick={() => router.push(`/article/${article.id}`)}
    />
  ))
}
```

### Testing Standards

```typescript
// ✅ CORRECT: Comprehensive testing

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from '@/tests/msw/server'
import { http, HttpResponse } from 'msw'

describe('ArticleContent', () => {
  const user = userEvent.setup()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('should handle user interactions correctly', async () => {
    // Arrange
    const onCopy = vi.fn()
    render(
      <PromocodeWidget 
        code="SAVE20"
        discount="20% OFF"
        onCopy={onCopy}
      />
    )
    
    // Act
    const copyButton = screen.getByRole('button', { name: /copy/i })
    await user.click(copyButton)
    
    // Assert
    expect(onCopy).toHaveBeenCalledWith('SAVE20')
    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })
  
  it('should handle API errors gracefully', async () => {
    // Override handler for this test
    server.use(
      http.get('*/api/articles/*', () => {
        return HttpResponse.error()
      })
    )
    
    render(<ArticlePage slug="test" />)
    
    await waitFor(() => {
      expect(screen.getByText(/error loading article/i)).toBeInTheDocument()
    })
  })
})

// ❌ WRONG: Poor testing

test('button works', () => {
  render(<Button />)
  // No assertions
})

test('api call', async () => {
  // Testing implementation details
  const spy = jest.spyOn(window, 'fetch')
  render(<Component />)
  expect(spy).toHaveBeenCalled() // Brittle test
})
```

### Code Review Checklist

Before submitting code for review, ensure:

#### TypeScript
- [ ] No `any` types
- [ ] All functions have explicit return types
- [ ] All props interfaces are exported
- [ ] Proper error types, not generic Error

#### Components
- [ ] 'use client'/'use server' directives where needed
- [ ] ForwardRef for reusable components
- [ ] Display names set
- [ ] Props destructured with defaults

#### Performance
- [ ] Heavy components lazy loaded
- [ ] Lists have stable keys
- [ ] Callbacks wrapped in useCallback
- [ ] Expensive computations in useMemo

#### Testing
- [ ] Unit tests for utilities
- [ ] Integration tests for features
- [ ] Error cases covered
- [ ] Loading states tested

#### Security
- [ ] No API keys in client code
- [ ] Input validation on all forms
- [ ] XSS prevention (no dangerouslySetInnerHTML with user content)
- [ ] CSRF protection on mutations

### Git Commit Standards

```bash
# ✅ CORRECT: Clear, conventional commits
feat: add promocode copy functionality
fix: prevent XSS in article content rendering
perf: lazy load promotional widgets
docs: update API integration guide
test: add coverage for cloak decision flow
refactor: extract useClipboard hook
chore: update dependencies

# ❌ WRONG: Poor commit messages
updated stuff
fix
working on feature
WIP
asdf
```

### Import Order Convention

```typescript
// ✅ CORRECT: Organized imports
// 1. React and core libraries
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { z } from 'zod'
import { format } from 'date-fns'

// 3. Internal absolute imports
import { Button } from '@/components/ui/button'
import { useCloak } from '@/hooks/use-cloak'
import { articleApi } from '@/lib/api/article'

// 4. Relative imports
import { ArticleHeader } from './ArticleHeader'
import type { ArticleProps } from './types'

// 5. Styles (if any)
import styles from './Article.module.css'

// ❌ WRONG: Disorganized imports
import styles from './Article.module.css'
import { useState } from 'react'
import { ArticleHeader } from './ArticleHeader'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
```

### Quick Reference

**Common Commands**
```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # Check TypeScript types
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode

# Code Quality
pnpm format           # Format with Prettier
pnpm lint:fix         # Fix ESLint issues
pnpm analyze          # Analyze bundle size

# Deployment
pnpm deploy:preview   # Deploy to preview
pnpm deploy:prod      # Deploy to production
```

**Key Import Patterns**
```typescript
// Components
import { Button } from '@/components/ui/button'
import { PromocodeWidget } from '@/components/article/PromocodeWidget'

// Hooks
import { useCloak } from '@/lib/hooks/use-cloak'
import { useQuery } from '@tanstack/react-query'

// Utils
import { cn } from '@/lib/utils/cn'
import { formatDate } from '@/lib/utils/formatters'

// Types
import type { Article } from '@/types/article'
import type { CloakState } from '@/types/cloak'

// API
import { trackerAPI } from '@/lib/api/tracker'
```

**File Naming Conventions**
- Components: `PascalCase.tsx` (e.g., `ArticleContent.tsx`)
- Hooks: `kebab-case.ts` (e.g., `use-cloak.ts`)
- Utils: `kebab-case.ts` (e.g., `format-date.ts`)
- Types: `kebab-case.ts` (e.g., `article.ts`)
- API routes: `route.ts` in appropriate folder

**Project-Specific Patterns**
```typescript
// Cloaking check pattern
const isBlackMode = document.body.classList.contains('is-black-mode')

// Safe clipboard copy
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied!')
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

// Time window check
const isWithinWindow = (firstVisit: number) => {
  return Date.now() - firstVisit < 5 * 60 * 1000
}

// Fingerprint collection
const fingerprint = {
  screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: navigator.language,
  platform: navigator.platform || 'unknown'
}
```
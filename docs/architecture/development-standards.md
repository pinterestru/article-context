# Development Standards

## Overview

We enforce strict development standards to ensure code quality, maintainability, and consistency across the codebase. These standards are non-negotiable and must be followed by all developers.

## File Organization & Naming

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

## TypeScript Standards

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

## Component Standards

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

## Hook Standards

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

## Error Handling Standards

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

## API Integration Standards

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

## Performance Standards

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

## Testing Standards

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

## Code Review Checklist

Before submitting code for review, ensure:

### TypeScript
- [ ] No `any` types
- [ ] All functions have explicit return types
- [ ] All props interfaces are exported
- [ ] Proper error types, not generic Error

### Components
- [ ] 'use client'/'use server' directives where needed
- [ ] ForwardRef for reusable components
- [ ] Display names set
- [ ] Props destructured with defaults

### Performance
- [ ] Heavy components lazy loaded
- [ ] Lists have stable keys
- [ ] Callbacks wrapped in useCallback
- [ ] Expensive computations in useMemo

### Testing
- [ ] Unit tests for utilities
- [ ] Integration tests for features
- [ ] Error cases covered
- [ ] Loading states tested

### Security
- [ ] No API keys in client code
- [ ] Input validation on all forms
- [ ] XSS prevention (no dangerouslySetInnerHTML with user content)
- [ ] CSRF protection on mutations

## Git Commit Standards

```bash
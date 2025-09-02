# React 19 Features

## Overview

React 19 introduces powerful new hooks that simplify common patterns in our affiliate article application. We adopt these features for better UX and cleaner code.

## Key Features We Use

1. **useActionState** - Simplified form handling with Server Actions
2. **useOptimistic** - Instant UI feedback for promocode interactions
3. **useFormStatus** - Loading states without prop drilling
4. **use** - Simplified async data handling in Client Components

## useActionState for Forms

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

## useOptimistic for Promocode Interactions

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

## useFormStatus for Nested Loading States

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

## use Hook for Async Data

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

## Advanced Pattern: Optimistic Cart Updates

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

## Best Practices

1. **useActionState**: Perfect for forms with validation and error handling
2. **useOptimistic**: Use for instant feedback on user actions (copy, like, add to cart)
3. **useFormStatus**: Place in child components to avoid prop drilling
4. **use**: Simplifies promise handling but requires Suspense boundary
5. **Always provide fallback UI**: Users should see loading states
6. **Handle errors gracefully**: Revert optimistic updates on failure

## Migration Guide

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

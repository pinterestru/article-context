# Service Layer Pattern Guide

## File Structure

Each service module follows this structure:
```
{service}/
├── {service}.types.ts    # Types, interfaces, schemas, errors
├── {service}.api.ts      # Public API (what consumers import)
└── {service}.service.ts  # Internal implementation (optional)
```

## Key Patterns

### 1. Public API Pattern
```typescript
// {service}.api.ts
import 'server-only'
import { cache } from 'react'

export const serviceMethod = cache(async (params): Promise<Result<T>> => {
  try {
    const data = await internalImplementation(params)
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
})
```

### 2. Result Type
All public methods return:
```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error }
```

### 3. Custom Error Classes
```typescript
// {service}.types.ts
export class ServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'ServiceError'
  }
}
```

### 4. Import Rules
- **External code**: Import from `.api.ts`
- **Internal use**: Import from `.service.ts` or `.types.ts`
- **Never**: Import `.service.ts` from outside the service module

### 5. Caching Strategy
- Use React's `cache()` for request deduplication
- Set appropriate `revalidate` times in Next.js cache options
- Cache keys should include all parameters that affect the result

## Example Usage

```typescript
// Good - Consumer code
import { fetchArticleById } from '@/lib/services/article/article.api'

const result = await fetchArticleById(id)
if (!result.success) {
  // Handle error
  console.error(result.error)
  return
}
// Use result.data
```

## Service Checklist

- [ ] `server-only` directive in `.api.ts`
- [ ] All public methods return `Result<T>`
- [ ] Custom error classes in `.types.ts`
- [ ] React `cache()` wrapper on public methods
- [ ] Proper TypeScript types and Zod schemas
- [ ] Structured logging with context
- [ ] Backward compatibility via legacy exports
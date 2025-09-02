# API Integration

## Server-Only Service Layer Pattern

We adopt a strict server-only pattern for all API integrations to prevent accidental client-side API key exposure and centralize API logic. This pattern ensures that sensitive credentials and internal API endpoints are never exposed to the browser.

## Service Structure

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

## Base HTTP Client

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

## Service Implementation Pattern

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

## Usage in Server Components

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

## Usage in Server Actions

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

## Benefits of This Pattern

1. **Security**: API keys and sensitive endpoints never reach the client
2. **Type Safety**: Full TypeScript support with Zod validation
3. **Centralization**: All API logic in one place, easy to maintain
4. **Error Handling**: Consistent error handling across all API calls
5. **Testing**: Easy to mock the service layer for testing

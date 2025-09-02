# Testing Strategy

## Overview

We implement a focused testing pyramid optimized for our affiliate article platform, with emphasis on critical paths:

1. **Unit Tests** (Vitest) - Component logic and utilities
2. **Integration Tests** (Vitest + MSW) - API interactions and component integration
3. **E2E Tests** (Playwright) - Critical cloaking flows and user journeys

## Test Structure

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

## MSW Setup for API Mocking

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

## Test Utilities

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

## Global Test Setup

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

## Component Testing Examples

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

## E2E Testing with Playwright

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

## Testing Configuration

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

## Testing Best Practices

1. **Test Pyramid Balance**: More unit/integration tests, fewer E2E tests
2. **Critical Path Focus**: E2E tests only for cloaking decisions and core flows
3. **Mock at the Network Layer**: Use MSW for consistent API mocking
4. **Test User Behavior**: Focus on what users do, not implementation details
5. **Performance Testing**: Include tests for loading states and timeouts
6. **Security Testing**: Verify cloaking rules can't be bypassed

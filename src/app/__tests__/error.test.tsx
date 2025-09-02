import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as Sentry from '@sentry/nextjs'
import GlobalError from '../global-error'
import ArticleError from '../(context)/article/[slug]/error'

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  lastEventId: vi.fn(() => 'test-event-id'),
  showReportDialog: vi.fn(),
}))

// Mock isAPIError
vi.mock('@/lib/http/client', () => ({
  isAPIError: vi.fn((error: unknown) => {
    return error && typeof error === 'object' && 'status' in error && 'code' in error
  }),
}))

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('Error Boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GlobalError', () => {
    const mockError = new Error('Test global error')
    const mockReset = vi.fn()

    it('should render error message and details', () => {
      render(<GlobalError error={{ ...mockError, digest: 'error-digest-123' }} reset={mockReset} />)

      expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
      expect(
        screen.getByText('An unexpected error occurred. Our team has been notified.')
      ).toBeInTheDocument()
      expect(screen.getByText(/error-digest-123/)).toBeInTheDocument()
    })

    it('should capture exception to Sentry on mount', () => {
      render(<GlobalError error={{ ...mockError, digest: 'error-digest-123' }} reset={mockReset} />)

      expect(Sentry.captureException).toHaveBeenCalledWith(
        { ...mockError, digest: 'error-digest-123' },
        {
          tags: {
            error_boundary: 'global',
          },
          contexts: {
            error: {
              digest: 'error-digest-123',
            },
          },
        }
      )
    })

    it('should call reset when Try again button is clicked', () => {
      render(<GlobalError error={mockError} reset={mockReset} />)

      const tryAgainButton = screen.getByText('Try again')
      fireEvent.click(tryAgainButton)

      expect(mockReset).toHaveBeenCalled()
    })

    it('should show report dialog when Report button is clicked', () => {
      render(<GlobalError error={mockError} reset={mockReset} />)

      const reportButton = screen.getByText('Report this error')
      fireEvent.click(reportButton)

      expect(Sentry.showReportDialog).toHaveBeenCalledWith({
        eventId: 'test-event-id',
      })
    })
  })

  describe('ArticleError', () => {
    const mockError = Object.assign(new Error('Test article error'), {
      name: 'Error',
    })
    const mockReset = vi.fn()

    beforeEach(() => {
      // Mock window properties
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000/article/test',
          pathname: '/article/test',
        },
        writable: true,
      })

      Object.defineProperty(window, 'navigator', {
        value: {
          userAgent: 'test-user-agent',
        },
        writable: true,
      })
    })

    it('should render error page with recovery suggestions', () => {
      render(
        <ArticleError error={{ ...mockError, digest: 'error-digest-456' }} reset={mockReset} />
      )

      expect(screen.getByText('Unable to Load Article')).toBeInTheDocument()
      expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument()
      expect(screen.getByText('What you can try:')).toBeInTheDocument()
      expect(screen.getByText(/error-digest-456/)).toBeInTheDocument()
    })

    it('should capture exception to Sentry with article context', () => {
      render(
        <ArticleError error={{ ...mockError, digest: 'error-digest-456' }} reset={mockReset} />
      )

      expect(Sentry.captureException).toHaveBeenCalledWith(
        { ...mockError, digest: 'error-digest-456' },
        expect.objectContaining({
          tags: {
            error_boundary: 'article',
            error_type: 'Error',
          },
        })
      )
    })

    it('should display API error messages correctly', () => {
      const apiError = Object.assign(new Error('API Error'), {
        status: 500,
        code: 'SERVER_ERROR',
        details: { reason: 'Internal server error' },
      })

      render(<ArticleError error={apiError} reset={mockReset} />)

      // Should show server error message from translations
      expect(
        screen.getByText('Our servers are experiencing issues. Please try again later.')
      ).toBeInTheDocument()
    })

    it('should have action buttons', () => {
      render(<ArticleError error={mockError} reset={mockReset} />)

      expect(screen.getByText('Try again')).toBeInTheDocument()
      expect(screen.getByText('Go home')).toBeInTheDocument()
      expect(screen.getByText('Report issue')).toBeInTheDocument()
    })

    it('should call reset when Try again is clicked', () => {
      render(<ArticleError error={mockError} reset={mockReset} />)

      const tryAgainButton = screen.getByText('Try again')
      fireEvent.click(tryAgainButton)

      expect(mockReset).toHaveBeenCalled()
    })

    it('should show Sentry report dialog when Report issue is clicked', () => {
      render(<ArticleError error={mockError} reset={mockReset} />)

      const reportButton = screen.getByText('Report issue')
      fireEvent.click(reportButton)

      expect(Sentry.showReportDialog).toHaveBeenCalledWith({
        eventId: 'test-event-id',
      })
    })
  })
})

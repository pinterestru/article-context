'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { DEFAULT_LOCALE } from '@/config/client-env'
import { getErrorNamespace, type GeneralErrorTranslations } from '@/lib/i18n/error-boundary-translations'
import { Button } from '@/components/shared/Button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = getErrorNamespace<GeneralErrorTranslations>('errors.general')
  
  useEffect(() => {
    console.error('Global error:', error)
    
    // Log to Sentry
    Sentry.captureException(error, {
      tags: {
        error_boundary: 'global',
      },
      contexts: {
        error: {
          digest: error.digest,
        },
      },
    })
  }, [error])

  return (
    <html lang={DEFAULT_LOCALE}>
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-destructive mb-4 text-4xl font-bold">{t.title}</h1>
            <p className="text-muted-foreground mx-auto mb-8 max-w-md">
              {t.description}
            </p>
            {error.digest && (
              <p className="text-muted-foreground mb-4 text-sm">
                {t.errorId}: <code className="bg-muted rounded px-2 py-1">{error.digest}</code>
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => reset()}
                size="lg"
                color="primary"
              >
                {t.tryAgain}
              </Button>
              <Button
                onClick={() => {
                  const eventId = Sentry.lastEventId()
                  if (eventId) {
                    Sentry.showReportDialog({ eventId })
                  }
                }}
                size="lg"
                variant="secondary"
              >
                {t.reportError}
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

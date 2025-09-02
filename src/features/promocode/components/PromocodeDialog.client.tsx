'use client'

/**
 * PromocodeDialog Component
 *
 * This is the main production implementation of the promocode dialog.
 * It uses React 19's use() hook with Suspense for data fetching.
 *
 * Pattern Choice:
 * - We chose the use() hook pattern over Server Actions for better control
 *   over loading states and error handling in the dialog context
 * - The dialog can be triggered from various places with URL parameters
 * - Client-side fetching allows for smoother transitions and immediate feedback
 *
 * Component Flow:
 * 1. ArticleInteractiveHandler renders PromocodeDialogWrapper
 * 2. PromocodeDialogWrapper checks for promocode_id in URL params
 * 3. This component fetches and displays the promocode data
 */

import React, { useState, useCallback, useTransition, Suspense, useMemo } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import type { Route } from 'next'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog.client'
import type { PromocodeData } from '../types'
import { DialogSkeleton } from './DialogSkeleton'
import { PromocodeErrorBoundary } from './PromocodeErrorBoundary.client'
import { PromocodeDialogContent } from './PromocodeDialogContent.client'
import { useTranslations } from 'next-intl'
import { transformToPromocodeData } from '../transformers'
import { Button } from '@/components/shared/Button'

// Icons are now imported directly - Next.js 15 handles optimization

// Error display component
function DialogError({ error, onClose }: { error: string; onClose: () => void }) {
  const t = useTranslations('common')

  return (
    <div className="py-8 text-center">
      <p className="mb-4 text-red-600">{error}</p>
      <Button onClick={onClose} variant="link" size="sm">
        {t('close')}
      </Button>
    </div>
  )
}

interface PromocodeDialogClientProps {
  initialData?: PromocodeData
  error?: string
  loading?: boolean
  dialogType?: string
}

export function PromocodeDialogClient({
  initialData,
  error: initialError,
  loading: initialLoading,
  dialogType = 'default',
}: PromocodeDialogClientProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [, startTransition] = useTransition()

  const promocodeId = searchParams.get('promocode_id')
  const [isOpen, setIsOpen] = useState(!!promocodeId)
  const [error, setError] = useState<string | undefined>(initialError)

  // Handle dialog close
  const handleClose = useCallback(() => {
    // Remove promocode_id from URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('promocode_id')

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname

    // Use router.replace in a transition
    startTransition(() => {
      router.replace(newUrl as Route, { scroll: false })
    })

    setIsOpen(false)
    // Reset error when closing
    setError(undefined)
  }, [searchParams, pathname, router])

  // Create promise for data fetching
  const dataPromise = useMemo((): Promise<PromocodeData | null> => {
    if (initialData) {
      return Promise.resolve(initialData)
    }

    if (!promocodeId) {
      return Promise.reject(new Error('No promocode ID'))
    }

    // Only fetch on client side to avoid SSR issues with relative URLs
    if (typeof window === 'undefined') {
      return Promise.resolve(null as PromocodeData | null)
    }

    return fetch(`/api/promocode/${promocodeId}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch promocode')
        }
        const result = await response.json()

        if (result.message === '404' || !result.item) {
          // Close dialog if promocode not found
          handleClose()
          return null
        }

        // Transform API response to PromocodeData
        const transformedData = transformToPromocodeData(result.item)

        if (!transformedData) {
          throw new Error('Invalid promocode data')
        }

        return transformedData
      })
      .catch((err) => {
        // Return a rejected promise that will be caught by error boundary
        return Promise.reject(err)
      })
  }, [initialData, promocodeId, handleClose])

  // Handle dialog open/close
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleClose()
      }
    },
    [handleClose]
  )

  // Sync with URL changes
  if (promocodeId && !isOpen) {
    setIsOpen(true)
  } else if (!promocodeId && isOpen) {
    setIsOpen(false)
  }

  if (!isOpen) {
    return null
  }

  // Dialog content based on state
  const dialogContent = error ? (
    <DialogError error={error} onClose={handleClose} />
  ) : initialLoading ? (
    <DialogSkeleton />
  ) : (
    <Suspense fallback={<DialogSkeleton />}>
      <PromocodeDialogContent dataPromise={dataPromise} dialogType={dialogType} />
    </Suspense>
  )

  return (
    <PromocodeErrorBoundary>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="overflow-hidden bg-white p-0 sm:max-w-[600px]"
          showCloseButton
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            {error ? 'Error loading promocode' : 'Promocode details'}
          </DialogTitle>

          <div className="bg-white p-6">{dialogContent}</div>
        </DialogContent>
      </Dialog>
    </PromocodeErrorBoundary>
  )
}

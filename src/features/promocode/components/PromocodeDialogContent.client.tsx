'use client'

import { use, useState, useCallback, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { PromocodeData } from '../types'
import { copyToClipboard } from '../utils/clipboard'
import { buildAffiliateUrl, getTrackingParams } from '@/lib/utils/affiliate'
import { PROMOCODE_CONFIG } from '../constants'
import { analytics } from '@/lib/analytics'
import { PromocodeDialogContentDefault } from './promocode-dialog-contents'

interface PromocodeDialogContentProps {
  dataPromise: Promise<PromocodeData | null>
  dialogType?: string
}

/**
 * Component that uses React 19's use() hook to handle promise data
 * and displays the promocode card content with copy functionality
 */
export function PromocodeDialogContent({
  dataPromise,
  dialogType = 'default',
}: PromocodeDialogContentProps) {
  const data = use(dataPromise)
  const [copied, setCopied] = useState(false)
  const t = useTranslations('promocode.dialog')
  const tToast = useTranslations('promocode.toast')

  // Calculate hasCode - safe to do with null data
  const hasCode = !!data?.code && data.code !== '-'

  // Memoize the affiliate URL - handle null data case
  const affiliateUrl = useMemo(() => {
    if (!data) return ''
    return buildAffiliateUrl({
      targetUrl: data.targetUrl || `https://${data.slug}`,
      queryParams: getTrackingParams(),
    })
  }, [data])

  // Show store name or extract from URL - handle null data case
  const storeName = useMemo(() => {
    if (!data) return 'Store'
    if (data.storeName) return data.storeName
    if (data.targetUrl) {
      try {
        const url = new URL(
          data.targetUrl.startsWith('http') ? data.targetUrl : `https://${data.targetUrl}`
        )
        return url.hostname.replace('www.', '')
      } catch {
        return 'Store'
      }
    }
    return 'Store'
  }, [data])

  const handleCopy = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }

      if (!hasCode || !data?.code) return

      const success = await copyToClipboard(data.code)

      if (success) {
        setCopied(true)
        toast.success(tToast('copySuccess'))
        setTimeout(() => setCopied(false), PROMOCODE_CONFIG.COPY_FEEDBACK_DURATION)

        // Track successful copy
        analytics.promocode.copied(
          data.code,
          data.storeName || 'Unknown',
          'dialog' // position in dialog
        )

        // Open affiliate link after 1 second delay
        setTimeout(() => {
          window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
        }, 1000)
      } else {
        toast.error(tToast('copyError'))

        // Track failed copy (if copyFailed method exists)
        // Note: copyFailed might not be available in analytics.promocode
      }
    },
    [hasCode, data, tToast, affiliateUrl]
  )

  const handleCtaClick = useCallback(async () => {
    if (!data) return

    // Copy code if present
    if (hasCode && data.code) {
      const success = await copyToClipboard(data.code)
      if (success) {
        setCopied(true)
        toast.success(tToast('copySuccess'))
        setTimeout(() => setCopied(false), PROMOCODE_CONFIG.COPY_FEEDBACK_DURATION)

        // Track successful copy
        analytics.promocode.copied(data.code, data.storeName || 'Unknown', 'dialog')
      }
    }

    // Track the click action
    analytics.promocode.clicked(
      data.code || 'NO_CODE',
      data.storeName || 'Unknown',
      affiliateUrl,
      'dialog'
    )

    // Delay to show copy feedback before opening new tab
    setTimeout(() => {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
    }, 1000)
  }, [hasCode, data, affiliateUrl, tToast])

  const handleStoreNameClick = useCallback(() => {
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
  }, [affiliateUrl])

  // Early return after all hooks have been declared
  if (!data || !data.id) {
    return null
  }

  // Select promocode dialog content variant based on dialogType prop
  const props = {
    data,
    copied,
    hasCode,
    storeName,
    affiliateUrl,
    t,
    onCopy: handleCopy,
    onCtaClick: handleCtaClick,
    onStoreNameClick: handleStoreNameClick,
  }

  switch (dialogType) {
    case 'default':
      return <PromocodeDialogContentDefault {...props} />
    default:
      // Fallback to default for unknown types
      console.warn(`Unknown promocode dialog type: ${dialogType}, falling back to default`)
      return <PromocodeDialogContentDefault {...props} />
  }
}

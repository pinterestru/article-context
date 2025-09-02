'use client'

import { cn } from '@/lib/utils/cn'
import type { Promocode } from '../types'
import { Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { buildAffiliateUrl, getTrackingParams } from '@/lib/utils/affiliate'
import { analytics } from '@/lib/analytics'

interface PromocodeButtonProps {
  promocode: Promocode
  className?: string
  withIcon?: boolean
}

export function PromocodeButton({ promocode, className, withIcon = true }: PromocodeButtonProps) {
  const t = useTranslations('promocode.button')

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Build URL with promocode_id parameter
    if (typeof window === 'undefined') return
    
    // Set _last_log cookie
    document.cookie = `_last_log=${Date.now().toString()}; path=/; max-age=31536000; SameSite=Lax`
    
    const currentUrl = window.location.href.split('?')[0].split('#')[0]
    const currentParams = new URLSearchParams(window.location.search)
    currentParams.set('promocode_id', promocode.id)
    const newUrl = `${currentUrl}?${currentParams.toString()}`
    
    // Open new tab with promocode dialog
    window.open(newUrl, '_blank')
    
    // Redirect current tab to affiliate URL after a short delay
    // This sets the affiliate cookie while user views promocode in new tab
    setTimeout(() => {
      if (promocode.slug) {
        // Build affiliate URL using the general builder
        const affiliateUrl = buildAffiliateUrl({
          targetUrl: "https://" + promocode.slug,
          queryParams: getTrackingParams()
        })
        
        // Track promocode click with new analytics
        analytics.promocode.clicked(
          promocode.code,
          promocode.storeLabel || 'Unknown',
          affiliateUrl,
          0 // position
        )
        
        if (typeof window !== 'undefined') {
          window.location.href = affiliateUrl
        }
      }
    }, 300)
  }

  return (
    <span
      className={cn(
        'relative inline-flex h-12 rounded-xl px-2 sm:px-4 font-mono text-sm font-bold transition-all duration-200',
        'border-2 border-dashed',
        'bg-card hover:bg-card-hover text-foreground border-border',
        'transform hover:scale-[1.02] active:scale-[0.98]',
        'select-none cursor-pointer',
        className
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e as unknown as React.MouseEvent<HTMLSpanElement>)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={t('getPromocode')}
      data-promocode-id={promocode.id}
    >
      <span className="relative flex h-full w-full items-center justify-center gap-2">
        <span className="text-base tracking-wider uppercase">
          {promocode.code}
        </span>
        {withIcon && <Copy className="h-4 w-4 flex-shrink-0 opacity-60 hidden sm:block" />}
      </span>
    </span>
  )
}

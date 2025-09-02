'use client'

import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SafeStoreImage } from '@/components/ui/safe-image.client'
import type { PromocodeData } from '../../../types'

interface PromocodeDialogContentDefaultProps {
  data: PromocodeData
  copied: boolean
  hasCode: boolean
  storeName: string
  affiliateUrl: string
  t: (key: string) => string
  onCopy: (e?: React.MouseEvent) => void
  onCtaClick: () => void
  onStoreNameClick: () => void
}

export function PromocodeDialogContentDefault({
  data,
  copied,
  hasCode,
  storeName,
  affiliateUrl: _affiliateUrl,
  t,
  onCopy,
  onCtaClick,
  onStoreNameClick,
}: PromocodeDialogContentDefaultProps) {
  return (
    <div className="space-y-4 text-center">
      {/* Store logo and name - only show if we have actual store data */}
      {(data.storeImage || data.storeName) && (
        <div className="mb-4 flex items-center justify-center gap-3">
          {data.storeImage && (
            <div className="relative flex h-12 items-center justify-center">
              <SafeStoreImage
                src={data.storeImage}
                alt={data.storeName || storeName}
                height={48}
                width={48}
                autoSize={true}
                maxHeight={48}
                className="object-contain"
                showSkeleton={false}
              />
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">{data.storeName || storeName}</h3>
        </div>
      )}

      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-900">{data.title}</h2>

      <div className="my-4 border-t border-gray-200" />

      {/* Instructions */}
      <p className="text-base text-gray-700">
        {t('goToSite')}{' '}
        <button
          onClick={onStoreNameClick}
          className="cursor-pointer font-semibold text-green-600 hover:underline"
        >
          «{storeName}»
        </button>{' '}
        {t('andUsePromocode')}:
      </p>

      {/* Promocode box */}
      {hasCode && data.code ? (
        <div className="relative inline-flex items-center justify-center">
          <div className="rounded-lg border-2 border-dashed border-gray-400 bg-gray-100 px-8 py-4">
            <span className="font-mono text-2xl font-bold tracking-wider">{data.code}</span>
          </div>
          <button
            onClick={onCopy}
            className={`absolute -top-3 -right-3 cursor-pointer rounded-full p-2 shadow-lg transition-all hover:shadow-xl ${
              copied ? 'bg-green-500 text-white' : 'bg-white'
            }`}
            aria-label={t('copyCode')}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 text-gray-600" />}
          </button>
        </div>
      ) : (
        <div className="text-lg font-semibold text-gray-700">{t('noCodeNeeded')}</div>
      )}

      {/* Additional info */}
      {data.description && (
        <div className="mt-4 text-sm text-gray-600">
          <p>{data.description}</p>
        </div>
      )}

      {/* More details link */}
      {data.targetUrl && (
        <p className="text-sm text-gray-500">
          {t('moreDetails')}{' '}
          <button onClick={onCtaClick} className="cursor-pointer text-blue-600 hover:underline">
            {storeName}
          </button>
        </p>
      )}

      {/* CTA Button */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={onCtaClick}
          size="lg"
          className="w-full max-w-sm cursor-pointer bg-green-600 font-semibold text-white hover:bg-green-700"
        >
          {copied ? <Check className="mr-2 h-5 w-5" /> : <Copy className="mr-2 h-5 w-5" />}
          {t('copyAndGoToSite')}
        </Button>
      </div>
    </div>
  )
}

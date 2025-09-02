import { cn } from '@/lib/utils/cn'
import type { Promocode } from '../../../types'
import { Percent } from 'lucide-react'
import { PromocodeButton } from '../../PromocodeButton.client'
import { getTranslations } from 'next-intl/server'

interface PromocodeCardProps {
  promocode: Promocode
  className?: string
  onClick?: () => void
}

export async function PromocodeCardDefault({ promocode, className, onClick }: PromocodeCardProps) {
  const t = await getTranslations('promocode.card')

  const { discount, description, expiresAt, featured, storeLabel } = promocode

  const isExpired = expiresAt && new Date(expiresAt) < new Date()

  // Extract percentage from discount string if available
  const discountMatch = discount?.match(/(\d+)%/)
  const discountPercentage = discountMatch ? discountMatch[1] : null

  return (
    <div
      className={cn(
        'group relative flex min-h-[72px] items-center gap-2 rounded-xl p-3 pr-2 transition-all duration-200 sm:gap-3 sm:pr-3',
        isExpired && 'opacity-60',
        onClick && 'cursor-pointer',
        'bg-card border-border hover:border-primary/30 border shadow-xs hover:shadow-sm',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Featured Badge */}
      {featured && !isExpired && (
        <div className="absolute -top-2.5 left-2 z-10">
          <div className="from-featured-gradient-from to-featured-gradient-to flex items-center gap-0.5 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
            <span className="tracking-wider uppercase">{t('featured')}</span>
          </div>
        </div>
      )}
      {/* Discount percentage or icon - inline with content - hidden on mobile */}
      {!isExpired && (
        <div className="border-border mr-3 hidden w-20 flex-shrink-0 items-center justify-center border-r pr-3 sm:flex">
          {discountPercentage ? (
            <span className="text-2xl font-bold">-{discountPercentage}%</span>
          ) : (
            <Percent className="text-primary h-7 w-7" />
          )}
        </div>
      )}

      {/* Middle - Title/Description */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="text-foreground line-clamp-3 text-base leading-tight break-all hyphens-auto opacity-80 sm:break-normal">
          {description ||
            t('defaultDescription', {
              discount: discount || t('defaultDiscount'),
              store: storeLabel || t('defaultStore'),
            })}
        </span>
      </div>

      {/* Right side - Prominent button */}
      <div className="flex-shrink-0">
        <PromocodeButton promocode={promocode} className="w-24 sm:w-32" />
      </div>
    </div>
  )
}

// Removed formatDate function - now using getExpiryText from utils

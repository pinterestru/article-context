import { cn } from '@/lib/utils/cn'
import { useTranslations } from 'next-intl'
import type { PromocodeListWidgetProps } from '../types'
import { PromocodeCard } from './PromocodeCard.server'
import { getLocalizedMonth } from '../utils/date'

export function PromocodeList({
  promocodes,
  layout,
  variant: _variant = 'default',
  showTags: _showTags = true,
  showExpiration: _showExpiration = true,
  white = false,
  withTitle = true,
  className,
}: PromocodeListWidgetProps) {
  const t = useTranslations()

  // Use layout from props, or default to 'list'
  const finalLayout = layout || 'list'

  // Filter out expired promocodes if needed
  const activePromocodes = promocodes.filter((promo) => {
    if (!promo.expiresAt) return true
    return new Date(promo.expiresAt) >= new Date()
  })

  // Sort promocodes: featured first, then by date
  const sortedPromocodes = [...activePromocodes].sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return 0
  })

  if (sortedPromocodes.length === 0) {
    return (
      <div className={cn('text-muted-foreground py-8 text-center', className)}>
        No promocodes available at this time.
      </div>
    )
  }

  // Grid layout classes based on layout type
  const gridClasses = {
    list: 'grid-cols-1',
    grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    inline: 'grid-cols-1',
    featured: 'grid-cols-1 lg:grid-cols-2',
  }

  // Get store name from first promocode
  const storeName = sortedPromocodes[0]?.storeLabel
  const showTitle = withTitle && storeName && sortedPromocodes.length > 0

  // Get current date for title
  const now = new Date()
  const currentMonth = getLocalizedMonth(now, t)
  const currentYear = now.getFullYear()

  return (
    <div className={cn('promocode-list', !white && 'chide', className)}>
      {showTitle && (
        <span className="mb-6 block text-3xl font-semibold">
          {t('promocode.list.title', {
            storeName,
            month: currentMonth,
            year: currentYear,
          })}
        </span>
      )}
      <div className={cn('grid gap-3', gridClasses[finalLayout])}>
        {sortedPromocodes.map((promocode) => (
          <PromocodeCard
            key={promocode.id}
            promocode={promocode}
            className={cn(finalLayout === 'featured' && promocode.featured && 'lg:col-span-2')}
          />
        ))}
      </div>
    </div>
  )
}

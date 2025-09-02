import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { enUS, ru } from 'date-fns/locale'
import { DEFAULT_LOCALE } from '@/config/client-env'

// Get the appropriate date-fns locale
export const getDateLocale = () => {
  return DEFAULT_LOCALE === 'ru' ? ru : enUS
}

// Format date with locale support
export const formatDate = (date: Date | string, formatStr: string = 'PPP') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, { locale: getDateLocale() })
}

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: getDateLocale(),
  })
}

// Get expiry text for promocodes
export const getExpiryText = (
  expiryDate: Date | string,
  t: (key: string, values?: Record<string, string | number>) => string
) => {
  const dateObj = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate

  if (dateObj < new Date()) {
    return t('promocode.card.expired')
  }

  if (isToday(dateObj)) {
    return t('promocode.card.today')
  }

  if (isTomorrow(dateObj)) {
    return t('promocode.card.tomorrow')
  }

  const daysUntil = Math.ceil((dateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  return t('promocode.card.inDays', { days: daysUntil })
}

// Format currency based on locale
export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency,
  }).format(amount)
}

// Format number based on locale
export const formatNumber = (num: number) => {
  return new Intl.NumberFormat(DEFAULT_LOCALE).format(num)
}

// Pluralization helper
export const pluralize = (
  count: number,
  key: string,
  t: (key: string, values?: Record<string, string | number>) => string
) => {
  // For Russian, we need special pluralization rules
  if (DEFAULT_LOCALE === 'ru') {
    const mod10 = count % 10
    const mod100 = count % 100

    let suffix: string
    if (mod10 === 1 && mod100 !== 11) {
      suffix = 'one'
    } else if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
      suffix = 'few'
    } else {
      suffix = 'many'
    }

    const pluralKey = `${key}_${suffix}`
    // Try to get the plural form, fallback to regular key
    try {
      return t(pluralKey, { count })
    } catch {
      return t(key, { count })
    }
  }

  // For English, simple plural rules
  const suffix = count === 1 ? 'one' : 'other'
  const pluralKey = `${key}_${suffix}`
  try {
    return t(pluralKey, { count })
  } catch {
    return t(key, { count })
  }
}

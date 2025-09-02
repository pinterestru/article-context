import type { SiteConfig } from '../types'

/**
 * Telegram Hub site configuration
 * A site that appears as a Telegram channel directory
 */
export const telegramHubConfig: SiteConfig = {
  id: 'telegram-hub',
  brand: {
    name: 'TGboost',
    logoUrl: '/images/sites/telegram-hub/logo.svg',
    faviconUrl: '/images/sites/telegram-hub/favicon.svg',
    metaDescription: 'Лучшие образовательные Telegram-каналы для вашего развития',
  },
  theme: 'telegram-hub',
  homepage: 'telegram-hub',
  header: 'telegram-hub',
  footer: 'telegram-hub',
  promocodeCard: 'default'
}
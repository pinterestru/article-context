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
  contact: {
    email: 'hello@toedu.ru',
    phone: '+7 (966) 124-79-67',
    legalName: 'ИП Ильинский Дмитрий Феликсович',
    address: 'г.Саратов, ул. Московская 43А',
    legalInfo: 'ИНН: 645327647894, ОГРНИП: 324645700100736'
  },
  theme: 'telegram-hub',
  homepage: 'telegram-hub',
  header: 'telegram-hub',
  footer: 'telegram-hub',
  promocodeCard: 'default'
}
import { getSiteConfig } from '@/config/sites/static'
import { DefaultHomePage } from './default/DefaultHomePage'
import { TelegramHubPage } from './telegram-hub/TelegramHubPage'
import type { HomePageProps } from './types'

export async function HomePage(_props: HomePageProps) {
  const siteConfig = getSiteConfig()
  const homepage = siteConfig.homepage || siteConfig.id

  switch (homepage) {
    case 'telegram-hub':
      return <TelegramHubPage />
    case 'default':
    default:
      return <DefaultHomePage />
  }
}

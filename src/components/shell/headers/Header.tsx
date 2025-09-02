import { getSiteConfig } from '@/config/sites/static'
import { HeaderDefault } from './default/HeaderDefault'
import { HeaderTelegramHub } from './telegram-hub/HeaderTelegramHub'

export async function Header() {
  const config = getSiteConfig()
  const headerType = config.header || 'default'
  
  // Select header implementation based on config
  switch (headerType) {
    case 'telegram-hub':
      return <HeaderTelegramHub />
    case 'default':
      return <HeaderDefault />
    default:
      // Fallback to default for unknown types
      console.warn(`Unknown header type: ${headerType}, falling back to default`)
      return <HeaderDefault />
  }
}
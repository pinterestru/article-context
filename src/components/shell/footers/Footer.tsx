import { getSiteConfig } from '@/config/sites/static'
import { FooterDefault } from './default/FooterDefault'
import { FooterTelegramHub } from './telegram-hub/FooterTelegramHub'

export async function Footer() {
  const config = getSiteConfig()
  const footerType = config.footer || 'default'
  
  // Select footer implementation based on config
  switch (footerType) {
    case 'telegram-hub':
      return <FooterTelegramHub />
    case 'default':
      return <FooterDefault />
    default:
      // Fallback to default for unknown types
      console.warn(`Unknown footer type: ${footerType}, falling back to default`)
      return <FooterDefault />
  }
}
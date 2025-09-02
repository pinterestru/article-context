import { getSiteConfig } from '@/config/sites/static'
import { CookiesPageDefault } from './default/CookiesPageDefault'
import { CookiesPageTelegramHub } from './telegram-hub/CookiesPageTelegramHub'
import { metadata as metadataDefault } from './default/metadata'
import { metadata as metadataTelegramHub } from './telegram-hub/metadata'
import { generateFullMetadata } from '../utils'
import type { StaticPageProps, StaticPageMetadata } from '../types'
import type { Metadata } from 'next'

export function CookiesPage({ className }: StaticPageProps) {
  const siteConfig = getSiteConfig()
  
  switch (siteConfig.id) {
    case 'telegram-hub':
      return <CookiesPageTelegramHub className={className} />
    case 'default':
    default:
      return <CookiesPageDefault className={className} />
  }
}

export function getCookiesPageMetadata(baseUrl: string): Partial<Metadata> {
  const siteConfig = getSiteConfig()
  let metadata: StaticPageMetadata
  
  switch (siteConfig.id) {
    case 'telegram-hub':
      metadata = metadataTelegramHub
      break
    case 'default':
    default:
      metadata = metadataDefault
      break
  }
  
  return generateFullMetadata(metadata, 'cookies', baseUrl)
}
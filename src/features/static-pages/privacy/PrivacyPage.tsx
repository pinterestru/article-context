import { getSiteConfig } from '@/config/sites/static'
import { PrivacyPageDefault } from './default/PrivacyPageDefault'
import { PrivacyPageTelegramHub } from './telegram-hub/PrivacyPageTelegramHub'
import { metadata as metadataDefault } from './default/metadata'
import { metadata as metadataTelegramHub } from './telegram-hub/metadata'
import { generateFullMetadata } from '../utils'
import type { StaticPageProps, StaticPageMetadata } from '../types'
import type { Metadata } from 'next'

export function PrivacyPage({ className }: StaticPageProps) {
  const siteConfig = getSiteConfig()
  
  switch (siteConfig.id) {
    case 'telegram-hub':
      return <PrivacyPageTelegramHub className={className} />
    case 'default':
    default:
      return <PrivacyPageDefault className={className} />
  }
}

export function getPrivacyPageMetadata(baseUrl: string): Partial<Metadata> {
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
  
  return generateFullMetadata(metadata, 'privacy', baseUrl)
}
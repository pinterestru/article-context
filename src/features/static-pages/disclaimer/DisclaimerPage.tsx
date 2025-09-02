import { getSiteConfig } from '@/config/sites/static'
import { DisclaimerPageDefault } from './default/DisclaimerPageDefault'
import { DisclaimerPageTelegramHub } from './telegram-hub/DisclaimerPageTelegramHub'
import { metadata as metadataDefault } from './default/metadata'
import { metadata as metadataTelegramHub } from './telegram-hub/metadata'
import { generateFullMetadata } from '../utils'
import type { StaticPageProps, StaticPageMetadata } from '../types'
import type { Metadata } from 'next'

export function DisclaimerPage({ className }: StaticPageProps) {
  const siteConfig = getSiteConfig()
  
  switch (siteConfig.id) {
    case 'telegram-hub':
      return <DisclaimerPageTelegramHub className={className} />
    case 'default':
    default:
      return <DisclaimerPageDefault className={className} />
  }
}

export function getDisclaimerPageMetadata(baseUrl: string): Partial<Metadata> {
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
  
  return generateFullMetadata(metadata, 'disclaimer', baseUrl)
}
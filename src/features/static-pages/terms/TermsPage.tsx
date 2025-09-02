import { getSiteConfig } from '@/config/sites/static'
import { TermsPageDefault } from './default/TermsPageDefault'
import { TermsPageTelegramHub } from './telegram-hub/TermsPageTelegramHub'
import { metadata as metadataDefault } from './default/metadata'
import { metadata as metadataTelegramHub } from './telegram-hub/metadata'
import { generateFullMetadata } from '../utils'
import type { StaticPageProps, StaticPageMetadata } from '../types'
import type { Metadata } from 'next'

export function TermsPage({ className }: StaticPageProps) {
  const siteConfig = getSiteConfig()
  
  switch (siteConfig.id) {
    case 'telegram-hub':
      return <TermsPageTelegramHub className={className} />
    case 'default':
    default:
      return <TermsPageDefault className={className} />
  }
}

export function getTermsPageMetadata(baseUrl: string): Partial<Metadata> {
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
  
  return generateFullMetadata(metadata, 'terms', baseUrl)
}
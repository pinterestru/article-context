import type { Metadata } from 'next'
import type { StaticPageMetadata } from './types'
import { getSiteConfig } from '@/config/sites/static'

export function generateFullMetadata(
  pageMetadata: StaticPageMetadata,
  pageType: string,
  baseUrl: string
): Partial<Metadata> {
  const siteConfig = getSiteConfig()
  
  // Replace {siteName} placeholder with actual site name from config
  const processedTitle = pageMetadata.title.replace('{siteName}', siteConfig.brand.name)
  const processedDescription = pageMetadata.description.replace('{siteName}', siteConfig.brand.name)
  
  return {
    title: processedTitle,
    description: processedDescription,
    keywords: pageMetadata.keywords,
    openGraph: {
      title: processedTitle,
      description: processedDescription,
      type: 'website',
      url: `${baseUrl}/${pageType}`,
      siteName: siteConfig.brand.name,
    },
    twitter: {
      card: 'summary',
      title: processedTitle,
      description: processedDescription,
    },
    alternates: {
      canonical: `${baseUrl}/${pageType}`,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  }
}
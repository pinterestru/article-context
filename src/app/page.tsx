import type { Metadata } from 'next'
import { HomePage } from '@/features/home-pages'
import { getSiteConfig } from '@/config/sites/static'

const siteConfig = getSiteConfig()

const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://example.com'

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.brand.name,
  },
  description: siteConfig.brand.metaDescription || 'Discover the best deals and promocodes',
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: siteConfig.brand.name,
    description: siteConfig.brand.metaDescription || 'Discover the best deals and promocodes',
    type: 'website',
    url: baseUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.brand.name,
    description: siteConfig.brand.metaDescription || 'Discover the best deals and promocodes',
  },
}

export default function Page() {
  return <HomePage />
}
import type { MetadataRoute } from 'next'
import { getWebsiteUrl } from '@/lib/utils/domain'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/article/',
      },
    ],
    sitemap: `${getWebsiteUrl()}/sitemap.xml`,
  }
}

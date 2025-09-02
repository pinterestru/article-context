import type { MetadataRoute } from 'next'
import { getWebsiteUrl } from '@/lib/utils/media'

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

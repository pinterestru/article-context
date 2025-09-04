import { JsonLd } from './JsonLd'
import { getWebsiteUrl } from '@/lib/utils/domain'
import { getSiteConfig } from '@/config/sites/static'
import type { Article } from '@/lib/services/article/article.types'

interface ArticleJsonLdProps {
  article: Article
}

export function ArticleJsonLd({ article }: ArticleJsonLdProps) {
  const siteConfig = getSiteConfig()
  const baseUrl = getWebsiteUrl()
  
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.brand.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}${siteConfig.brand.logoUrl}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/article/${article.slug}`,
    },
    keywords: article.tags?.join(', '),
  }
  
  return <JsonLd data={articleData} />
}
import { JsonLd } from './JsonLd'
import { getSiteConfig } from '@/config/sites/static'
import { getWebsiteUrl } from '@/lib/utils/domain'

export function OrganizationJsonLd() {
  const siteConfig = getSiteConfig()
  const baseUrl = getWebsiteUrl()

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.brand.name,
    url: baseUrl,
    logo: `${baseUrl}${siteConfig.brand.logoUrl}`,
    ...(siteConfig.brand.metaDescription && { description: siteConfig.brand.metaDescription }),
  }

  return <JsonLd data={organizationData} />
}

import { CookiesPage, getCookiesPageMetadata } from '@/features/static-pages'
import type { Metadata } from 'next'
import { getWebsiteUrl } from '@/lib/utils/domain'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getWebsiteUrl()
  return getCookiesPageMetadata(baseUrl)
}

export default function Page() {
  return <CookiesPage />
}
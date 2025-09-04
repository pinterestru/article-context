import { TermsPage, getTermsPageMetadata } from '@/features/static-pages'
import { getWebsiteUrl } from '@/lib/utils/domain'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getWebsiteUrl()
  return getTermsPageMetadata(baseUrl)
}

export default function Page() {
  return <TermsPage />
}
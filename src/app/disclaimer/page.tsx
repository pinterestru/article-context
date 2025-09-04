import { DisclaimerPage, getDisclaimerPageMetadata } from '@/features/static-pages'
import type { Metadata } from 'next'
import { getWebsiteUrl } from '@/lib/utils/domain'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getWebsiteUrl()
  return getDisclaimerPageMetadata(baseUrl)
}

export default function Page() {
  return <DisclaimerPage />
}
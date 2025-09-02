import { DisclaimerPage, getDisclaimerPageMetadata } from '@/features/static-pages'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://example.com'
  return getDisclaimerPageMetadata(baseUrl)
}

export default function Page() {
  return <DisclaimerPage />
}
import { TermsPage, getTermsPageMetadata } from '@/features/static-pages'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://example.com'
  return getTermsPageMetadata(baseUrl)
}

export default function Page() {
  return <TermsPage />
}
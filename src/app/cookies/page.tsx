import { CookiesPage, getCookiesPageMetadata } from '@/features/static-pages'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://example.com'
  return getCookiesPageMetadata(baseUrl)
}

export default function Page() {
  return <CookiesPage />
}
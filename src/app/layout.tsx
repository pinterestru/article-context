import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import '@/styles/globals.css'
import { env } from '@/config/env'
import { cookies } from 'next/headers'
import { COOKIES } from '@/config/constants'
import { AnalyticsScripts, AnalyticsHeadScripts, PageTracker } from '@/components/analytics'
import { Header } from '@/components/shell/headers/Header'
import { Footer } from '@/components/shell/footers/Footer'
import { getLocalizationScripts } from '@/lib/localization/scripts.obfuscated'
import { Toaster } from '@/components/ui/sonner.client'
import { getWebsiteUrl } from '@/lib/utils/domain'
import { getSiteConfig } from '@/config/sites/static'
import { OrganizationJsonLd } from '@/components/seo'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const siteConfig = getSiteConfig()

export const metadata: Metadata = {
  title: {
    default: siteConfig.brand.name,
    template: `%s | ${siteConfig.brand.name}`,
  },
  description:
    siteConfig.brand.metaDescription ||
    'Affiliate article system with cloaking and promocode functionality',
  metadataBase: new URL(getWebsiteUrl()),
  icons: {
    icon: siteConfig.brand.faviconUrl,
    apple: siteConfig.brand.faviconUrl,
  },
  openGraph: {
    title: siteConfig.brand.name,
    description:
      siteConfig.brand.metaDescription ||
      'Affiliate article system with cloaking and promocode functionality',
    type: 'website',
    siteName: siteConfig.brand.name,
  },
  twitter: {
    card: 'summary',
    title: siteConfig.brand.name,
    description:
      siteConfig.brand.metaDescription ||
      'Affiliate article system with cloaking and promocode functionality',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const targetCookie = cookieStore.get(COOKIES.TARGET)?.value
  const cloakClass = env.CLOAK_DISABLED || targetCookie === 'true' ? 'is-localized' : ''

  // Get locale and messages from next-intl
  const locale = await getLocale()
  const messages = await getMessages()

  // Get localization scripts
  const localizationScripts = getLocalizationScripts()

  return (
    <html lang={locale} className={cloakClass}>
      <head>
        {!env.CLOAK_DISABLED && !targetCookie && (
          <Script
            id="localization-unified"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: localizationScripts.unified }}
          />
        )}
        <AnalyticsHeadScripts />
        <OrganizationJsonLd />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} bg-background text-foreground font-sans antialiased`.trim()}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </NextIntlClientProvider>

        {/* Analytics Scripts */}
        <AnalyticsScripts />
        <PageTracker />
      </body>
    </html>
  )
}

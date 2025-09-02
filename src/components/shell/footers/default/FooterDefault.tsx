import { Container } from '@/components/layout/Container'
import Link from 'next/link'
import type { Route } from 'next'
import { getTranslations } from 'next-intl/server'
import { siteConfig } from '@/config/sites/static'

export async function FooterDefault() {
  const t = await getTranslations('footer')
  const currentYear = new Date().getFullYear()

  // Reusable footer sections
  const companyInfoSection = (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{t('about.title')}</h3>
      <p className="text-muted-foreground text-sm">{t('about.description')}</p>
    </div>
  )

  const quickLinksSection = (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{t('quickLinks.title')}</h3>
      <nav className="flex flex-col space-y-2">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          {t('quickLinks.home')}
        </Link>
        <Link
          href="/privacy"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          {t('quickLinks.privacyPolicy')}
        </Link>
        <Link
          href="/terms"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          {t('quickLinks.termsOfService')}
        </Link>
      </nav>
    </div>
  )

  const contactSection = (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{t('contact.title')}</h3>
      <div className="text-muted-foreground space-y-2 text-sm">
        <p>{t('contact.email')}</p>
        <p>{t('contact.hours')}</p>
      </div>
    </div>
  )

  const copyrightSection = (
    <div className="flex flex-col items-center gap-4 border-t pt-6 md:flex-row md:justify-between">
      <p className="text-muted-foreground text-sm">
        {t('copyright', { year: currentYear, brand: siteConfig.brand.name })}
      </p>
      <div className="flex gap-4">
        <Link
          href={'/sitemap' as Route}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          {t('quickLinks.sitemap')}
        </Link>
        <Link
          href="/cookies"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          {t('quickLinks.cookiePolicy')}
        </Link>
      </div>
    </div>
  )

  return (
    <footer className="bg-background mt-auto border-t">
      <Container>
        <div className="flex flex-col gap-6 py-8 md:py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {companyInfoSection}
            {quickLinksSection}
            {contactSection}
          </div>
          {copyrightSection}
        </div>
      </Container>
    </footer>
  )
}

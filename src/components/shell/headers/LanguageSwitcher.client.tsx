'use client'

import { useLocale } from 'next-intl'
import { LOCALES, LOCALE_COOKIE_NAME } from '@/config/i18n'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const currentLocale = useLocale()

  const handleLocaleChange = (newLocale: string) => {
    // Set cookie and reload page to apply new locale
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale};path=/;max-age=${365 * 24 * 60 * 60};samesite=lax`
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-2">
      {LOCALES.map((locale) => (
        <Button
          key={locale}
          variant={currentLocale === locale ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleLocaleChange(locale)}
          className="min-w-[40px]"
        >
          {locale.toUpperCase()}
        </Button>
      ))}
    </div>
  )
}
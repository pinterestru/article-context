// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { DEFAULT_LOCALE } from '@/config/client-env'
import { LOCALES, LOCALE_COOKIE_NAME, type Locale } from '@/config/i18n'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const storedLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value
  const locale =
    storedLocale && LOCALES.includes(storedLocale as Locale) ? storedLocale : DEFAULT_LOCALE

  return {
    locale: locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})

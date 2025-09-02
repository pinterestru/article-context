'use client'

import { useLocale } from 'next-intl'
import { Globe } from 'lucide-react'
import { LOCALES } from '@/config/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const locale = useLocale()

  const onSelectChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
    window.location.reload()
  }

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      en: 'English',
      ru: 'Русский'
    }
    return labels[lang] || lang.toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change language">
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => onSelectChange(lang)}
            disabled={locale === lang}
            className={locale === lang ? 'bg-muted' : ''}
          >
            {getLanguageLabel(lang)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
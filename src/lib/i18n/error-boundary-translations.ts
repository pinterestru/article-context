import { DEFAULT_LOCALE } from '@/config/client-env'
import enMessages from '@/messages/en.json'
import ruMessages from '@/messages/ru.json'

// Type-safe message access
type Messages = typeof enMessages
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: `${K & string}` | `${K & string}.${NestedKeyOf<T[K]>}` }[keyof T]
  : never

// Pre-loaded messages for synchronous access in error boundaries
const messages = {
  en: enMessages,
  ru: ruMessages,
} as const

/**
 * Get nested value from object using dot notation path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

/**
 * Synchronously get translations for error boundaries
 * This is necessary because error boundaries can't use async hooks
 *
 * @param key - The translation key using dot notation (e.g., 'errors.article.title')
 * @returns The translated string or the key if not found
 */
export function getErrorTranslation(key: NestedKeyOf<Messages>): string {
  const locale = DEFAULT_LOCALE as keyof typeof messages
  const localeMessages = messages[locale] || messages.en

  const value = getNestedValue(localeMessages, key)

  // Return the value if it's a string, otherwise return the key
  return typeof value === 'string' ? value : key
}

/**
 * Get all translations for a specific namespace
 * Useful for error components that need multiple translations
 *
 * @param namespace - The namespace (e.g., 'errors.article')
 * @returns The namespace object or empty object if not found
 */
export function getErrorNamespace<T = Record<string, unknown>>(namespace: string): T {
  const locale = DEFAULT_LOCALE as keyof typeof messages
  const localeMessages = messages[locale] || messages.en

  const value = getNestedValue(localeMessages, namespace)

  return (typeof value === 'object' ? value : {}) as T
}

// Type exports for error translations
export type GeneralErrorTranslations = Messages['errors']['general'] & {
  tryAgain: string
  reportError: string
  errorId: string
}

export type ArticleErrorTranslations = Messages['errors']['article'] & {
  defaultMessage: string
  errorId: string
  whatYouCanTry: string
  developerDetails: string
  buttons: {
    tryAgain: string
    goHome: string
    reportIssue: string
  }
  errors: Record<string, string>
  suggestions: Record<string, string[]>
}

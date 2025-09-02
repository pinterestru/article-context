/**
 * Type definitions for translation keys
 *
 * This provides type safety for translation keys based on our message structure
 */

import type enMessages from '@/messages/en.json'

// Extract the type from the English messages (they should match across all locales)
export type Messages = typeof enMessages

// Helper type to create dot-notation paths
type PathImpl<T, K extends keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? T[K] extends ArrayLike<unknown>
      ? K | `${K}.${PathImpl<T[K], Exclude<keyof T[K], keyof unknown[]>>}`
      : K | `${K}.${PathImpl<T[K], keyof T[K]>}`
    : K
  : never

type Path<T> = PathImpl<T, keyof T> | keyof T

// Extract all valid translation keys as a union type
export type TranslationKey = Path<Messages>

// Namespace types for better organization
export type CommonKeys = Path<Messages['common']>
export type ErrorKeys = Path<Messages['errors']>
export type HeaderKeys = Path<Messages['header']>
export type FooterKeys = Path<Messages['footer']>
export type PromocodeKeys = Path<Messages['promocode']>
export type ArticleKeys = Path<Messages['article']>
export type ComplianceKeys = Path<Messages['compliance']>
export type ThemeKeys = Path<Messages['theme']>
export type HomeKeys = Path<Messages['home']>

// Type-safe translation function signature
export interface TypedTranslate {
  (key: TranslationKey, values?: Record<string, string | number | boolean>): string
  rich(
    key: TranslationKey,
    values?: Record<string, string | number | boolean | React.ReactNode>
  ): React.ReactNode
  has(key: TranslationKey): boolean
}

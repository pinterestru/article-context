/**
 * Shared types for all home page variants
 */

export interface HomePageProps {
  /** Optional className for styling */
  className?: string
}

export type HomePageVariant = 'default' | 'telegram-directory' | 'telegram-hub' | string
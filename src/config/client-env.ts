import { z } from 'zod'
import type { Locale } from './i18n'

const clientEnvSchema = z.object({
  // Website domain (needed for client-side redirects and absolute URLs)
  WEBSITE_DOMAIN: z.string().default('localhost:3000'),
  
  // Default locale for the application
  DEFAULT_LOCALE: z.enum(['en', 'ru']).default('en'),
  
  // Analytics (client-side tracking)
  GA4_MEASUREMENT_ID: z.string().optional(),
  GTM_ID: z.string().optional(),
  YANDEX_METRICA_ID: z.string().optional(),
  
  // Monitoring (client-side error tracking)
  SENTRY_DSN: z.string().optional(),
})

function validateClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    WEBSITE_DOMAIN: process.env.NEXT_PUBLIC_WEBSITE_DOMAIN,
    DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE as 'en' | 'ru' | undefined,
    GA4_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
    GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
    YANDEX_METRICA_ID: process.env.NEXT_PUBLIC_YANDEX_METRICA_ID,
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  })

  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid client environment variables')
  }

  return parsed.data
}

// Validate and export client environment
export const clientEnv = validateClientEnv()

// Export DEFAULT_LOCALE using the validated environment
export const DEFAULT_LOCALE = clientEnv.DEFAULT_LOCALE as Locale

// Type export for autocomplete
export type ClientEnv = z.infer<typeof clientEnvSchema>
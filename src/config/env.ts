import { z } from 'zod'

const envSchema = z.object({
  // API Configuration
  API_BASE_URL: z.string().url(),
  MEDIA_BASE_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ARTICLE_ECOMMERCE_STORE_ID: z.string().optional(),
  PROMOCODE_ECOMMERCE_STORE_ID: z.string().optional(),
  SITE_CONFIG: z.string().default('default'),
  PROMOCODE_CACHE_TTL: z.number().positive().default(3600),
  ARTICLE_CACHE_TTL: z.number().positive().default(3600),
  
  // Feature Flags (server-side only)
  ENABLE_OPENTELEMETRY: z.preprocess((val) => String(val).toLowerCase() === 'true', z.boolean()).default(false),
  CLOAK_DISABLED: z.preprocess((val) => String(val).toLowerCase() === 'true', z.boolean()).default(false),
  
  // Logging
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
})

function validateEnv() {
  const parsed = envSchema.safeParse({
    API_BASE_URL: process.env.API_BASE_URL,
    MEDIA_BASE_URL: process.env.MEDIA_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    ARTICLE_ECOMMERCE_STORE_ID: process.env.ARTICLE_ECOMMERCE_STORE_ID,
    PROMOCODE_ECOMMERCE_STORE_ID: process.env.PROMOCODE_ECOMMERCE_STORE_ID,
    SITE_CONFIG: process.env.SITE_CONFIG,
    PROMOCODE_CACHE_TTL: process.env.PROMOCODE_CACHE_TTL ? parseInt(process.env.PROMOCODE_CACHE_TTL, 10) : undefined,
    ARTICLE_CACHE_TTL: process.env.ARTICLE_CACHE_TTL ? parseInt(process.env.ARTICLE_CACHE_TTL, 10) : undefined,
    ENABLE_OPENTELEMETRY: process.env.ENABLE_OPENTELEMETRY,
    CLOAK_DISABLED: process.env.CLOAK_DISABLED,
    LOG_LEVEL: process.env.LOG_LEVEL as 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | undefined,
  })


  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

export const env = validateEnv()

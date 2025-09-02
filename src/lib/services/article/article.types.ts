import { z } from 'zod'

export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E }

export class ArticleNotFoundError extends Error {
  constructor(slug: string) {
    super(`Article with slug "${slug}" not found`)
    this.name = 'ArticleNotFoundError'
  }
}

export class ArticleValidationError extends Error {
  public details?: unknown

  constructor(message: string, details?: unknown) {
    super(message)
    this.name = 'ArticleValidationError'
    this.details = details
  }
}

// Validation schemas
export const articleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string(),
  author: z.string(),
  publishedAt: z.string(), // More flexible date format
  tags: z.array(z.string()),
  ecommerceStoreId: z.string().optional(),
})

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema.nullable(),
    meta: z.record(z.string(), z.unknown()).optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional(),
      })
      .optional(),
  })

export const articleResponseSchema = apiResponseSchema(articleSchema)

export type Article = z.infer<typeof articleSchema>
export type ApiResponse<T> = {
  data: T | null
  meta?: Record<string, unknown>
  error?: {
    code: string
    message: string
    details?: unknown
  }
}
export type ArticleResponse = z.infer<typeof articleResponseSchema>

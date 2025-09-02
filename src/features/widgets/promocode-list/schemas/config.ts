import { z } from 'zod'

/**
 * Custom boolean schema that properly handles string values
 */
const booleanStringSchema = z.union([
  z.boolean(),
  z.string().transform((val) => {
    if (val === 'true' || val === '1') return true
    if (val === 'false' || val === '0') return false
    return Boolean(val) // fallback for other values
  }),
])

/**
 * Schema for individual promocode data
 */
export const promocodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  discount: z.string(),
  description: z.string().optional(),
  targetUrl: z.string().default('#'),
  expiresAt: z.string().datetime().optional(),
  expirationDate: z.date().optional(), // Legacy field
  tags: z.array(z.enum(['gift', 'discount', 'promocode', 'other'])).optional(),
  featured: booleanStringSchema.default(false),
  maskCode: booleanStringSchema.default(false),
  requiresEmail: booleanStringSchema.default(false),
  telegramLink: z.string().optional(),
  clickId: z.string().optional(),
  partner: z.string().optional(),
  storeLabel: z.string().optional(),
  storeLogo: z.string().optional(),
  originalCode: z.string().optional(), // Original unmasked code when maskCode is true
  slug: z.string().optional(),
  priority: z.number().optional(),
  terms: z.array(z.string()).optional(),
  variant: z.string().optional(),
})

/**
 * Schema for dynamic query parameters
 */
export const dynamicQuerySchema = z.object({
  slug: z.string().optional(),
  count: z.coerce.number().int().positive().max(50).optional(),
})

/**
 * Schema for widget props - flattened structure
 */
export const promocodeListPropsSchema = z.object({
  // Data source
  source: z.enum(['static', 'dynamic']).default('dynamic'),
  staticPromocodes: z.array(promocodeSchema).optional(),
  dynamicQuery: dynamicQuerySchema.optional(),

  // Display options
  layout: z.enum(['list', 'grid', 'inline', 'featured']).default('list'),
  itemsPerPage: z.coerce.number().int().positive().max(50).optional(),
  showExpiration: booleanStringSchema.default(true),
  showTags: booleanStringSchema.default(true),
  white: booleanStringSchema.default(false),
  variant: z.enum(['default', 'compact', 'detailed']).default('default'),
  withTitle: booleanStringSchema.default(true),

  // Interaction options
  copyOnClick: booleanStringSchema.default(false),
  trackingEnabled: booleanStringSchema.default(true),
})

/**
 * Validate and parse widget props
 */
export function parsePromocodeListProps(props: unknown) {
  return promocodeListPropsSchema.parse(props)
}

/**
 * Type guards for props validation
 */
export function isValidPromocodeListProps(
  props: unknown
): props is z.infer<typeof promocodeListPropsSchema> {
  return promocodeListPropsSchema.safeParse(props).success
}

// Keep old names for backward compatibility
export const promocodeListConfigSchema = promocodeListPropsSchema
export const parsePromocodeListConfig = parsePromocodeListProps
export const isValidPromocodeListConfig = isValidPromocodeListProps

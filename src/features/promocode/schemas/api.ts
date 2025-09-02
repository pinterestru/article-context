import { z } from 'zod';

// URL validation helper
const urlSchema = z.string().url().or(z.string().regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/));

// Promocode item schema
const promocodeItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  code: z.string().optional(),
  link: urlSchema.optional(),
  link_query_params: z.string().optional(),
  store_name: z.string().optional(),
  store_image: urlSchema.optional(),
  slug: z.string().optional(),
  images: z.string().optional(),
});

// Schema for promocode API response
export const PromocodeApiResponseSchema = z.object({
  item: promocodeItemSchema.optional(),
  message: z.string().optional(),
});

export type PromocodeApiResponse = z.infer<typeof PromocodeApiResponseSchema>;
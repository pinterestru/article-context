import { z } from 'zod';

/**
 * Schema for track event query parameters (supports legacy parameter names)
 */
export const trackEventQuerySchema = z.object({
  // Primary parameters
  event_type: z.string().optional(),
  track_type: z.string().optional(),
  track_value: z.string().optional(),
  url: z.string().url().optional().or(z.string().optional()), // Allow non-URL strings for flexibility
  domain: z.string().optional(),
  mtfi: z.string().optional(),
  created_at: z.string().optional(),
  with_flow: z.string().optional().transform(val => val === 'true'),
  with_view: z.string().optional().transform(val => val === 'true'),
  
  // Legacy parameter aliases
  localization_type: z.string().optional(),
  type: z.string().optional(),
  value: z.string().optional(),
  localization_page: z.string().optional(),
  
  // Metadata parameters (typically in body but can be in query)
  js_meta: z.string().optional(),
  localization_meta: z.string().optional(),
}).refine(
  (data) => data.event_type || data.localization_type,
  {
    message: "Either 'event_type' or 'localization_type' is required",
    path: ['event_type']
  }
);

/**
 * Schema for track event request body
 */
export const trackEventBodySchema = z.object({
  // Event parameters (when using POST)
  event_type: z.string().optional(),
  track_type: z.string().optional(),
  track_value: z.string().optional(),
  url: z.string().optional(),
  domain: z.string().optional(),
  mtfi: z.string().optional(),
  created_at: z.string().optional(),
  with_flow: z.boolean().optional(),
  with_view: z.boolean().optional(),
  
  // Legacy parameter aliases
  localization_type: z.string().optional(),
  type: z.string().optional(),
  value: z.string().optional(),
  localization_page: z.string().optional(),
  
  // Metadata
  js_meta: z.union([
    z.string(),
    z.record(z.string(), z.unknown())
  ]).optional(),
  localization_meta: z.union([
    z.string(),
    z.record(z.string(), z.unknown())
  ]).optional(),
}).optional();

/**
 * Schema for successful track event response
 */
export const trackEventSuccessResponseSchema = z.object({
  ok: z.literal(true),
  mtfi: z.string().optional(),
  localized: z.boolean().optional(),
});

/**
 * Schema for error track event response
 */
export const trackEventErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});

/**
 * Union schema for track event response
 */
export const trackEventResponseSchema = z.union([
  trackEventSuccessResponseSchema,
  trackEventErrorResponseSchema,
]);

/**
 * Type exports
 */
export type TrackEventQuery = z.infer<typeof trackEventQuerySchema>;
export type TrackEventBody = z.infer<typeof trackEventBodySchema>;
export type TrackEventResponse = z.infer<typeof trackEventResponseSchema>;
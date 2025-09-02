import { z } from 'zod';

/**
 * Result type for consistent error handling
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

/**
 * Custom error types for notification service
 */
export class NotificationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'NotificationError';
  }
}

export class NotificationDeliveryError extends NotificationError {
  constructor(message: string, public channel?: string) {
    super(message, 'DELIVERY_FAILED');
    this.name = 'NotificationDeliveryError';
  }
}

/**
 * Schema for notification options
 */
export const NotificationOptionsSchema = z.object({
  apiPath: z.string().optional(),
  channel: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
});

/**
 * Schema for notification request
 */
export const NotificationRequestSchema = z.object({
  message: z.string(),
  channel: z.string().default('default'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  timestamp: z.string().datetime(),
  source: z.string(),
});

/**
 * Schema for batch notification
 */
export const BatchNotificationItemSchema = z.object({
  message: z.string(),
  options: NotificationOptionsSchema.optional(),
});

/**
 * TypeScript types inferred from schemas
 */
export type NotificationOptions = z.infer<typeof NotificationOptionsSchema>;
export type NotificationRequest = z.infer<typeof NotificationRequestSchema>;
export type BatchNotificationItem = z.infer<typeof BatchNotificationItemSchema>;

/**
 * The interface (contract) for our notification API service.
 * This defines all methods related to notification operations.
 */
export interface INotificationApiService {
  /**
   * Send a notification message
   * This can be integrated with various notification systems like Slack, Discord, email, etc.
   */
  notify(message: string, options?: NotificationOptions): Promise<void>;

  /**
   * Send a batch of notifications
   */
  notifyBatch(messages: BatchNotificationItem[]): Promise<void>;
}
import 'server-only'
import { httpClient } from '@/lib/http/client'
import { env } from '@/config/env'
import { clientEnv } from '@/config/client-env'
import { logger } from '@/lib/logging/logger'
import {
  type INotificationApiService,
  type NotificationOptions,
  type BatchNotificationItem,
  type Result,
  NotificationError,
} from './notification.types'

/**
 * Internal function to send a notification message
 */
async function _notify(message: string, options: NotificationOptions = {}): Promise<void> {
  try {
    // Log the notification locally
    logger.warn(
      {
        event: 'notification',
        message,
        channel: options.channel || 'default',
        priority: options.priority || 'normal',
      },
      'Notification triggered'
    )

    // Send notification to the API if configured
    if (env.API_BASE_URL) {
      await httpClient(`${env.API_BASE_URL}/api/notify`, {
        method: 'POST',
        body: JSON.stringify({
          text: message,
          type: 'system_notification',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 second timeout for notifications
        cache: 'no-store',
      }).catch((error) => {
        // Don't throw on notification errors, just log them
        logger.error(
          {
            event: 'notification_send_error',
            error: error instanceof Error ? error.message : 'Unknown error',
            message: message.substring(0, 100), // Log first 100 chars of message
          },
          'Failed to send notification to external service'
        )
      })
    }

    // If we have Sentry configured, send as a warning
    if (clientEnv.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        const Sentry = await import('@sentry/nextjs')
        Sentry.captureMessage(message, 'warning')
      } catch {
        // Sentry not available or configured
      }
    }

    // You can add more notification channels here:
    // - Slack webhook
    // - Discord webhook
    // - Email service
    // - SMS service
    // - etc.
  } catch (error) {
    // Don't throw errors from notification service
    logger.error(
      {
        event: 'notification_error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to process notification'
    )
  }
}

/**
 * Internal function to send a batch of notifications
 */
async function _notifyBatch(messages: BatchNotificationItem[]): Promise<void> {
  await Promise.all(messages.map(({ message, options }) => _notify(message, options)))
}

/**
 * Public notification API with Result pattern
 */

/**
 * Send a notification message with Result pattern
 */
export async function notify(
  message: string,
  options: NotificationOptions = {}
): Promise<Result<void>> {
  try {
    await _notify(message, options)
    return { success: true, data: undefined }
  } catch (error) {
    logger.error(
      {
        event: 'notification_api_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: message.substring(0, 100),
      },
      'Failed to send notification'
    )

    return {
      success: false,
      error: error instanceof Error ? error : new NotificationError('Failed to send notification'),
    }
  }
}

/**
 * Send a batch of notifications with Result pattern
 */
export async function notifyBatch(messages: BatchNotificationItem[]): Promise<Result<void>> {
  try {
    await _notifyBatch(messages)
    return { success: true, data: undefined }
  } catch (error) {
    logger.error(
      {
        event: 'notification_batch_api_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        messageCount: messages.length,
      },
      'Failed to send notification batch'
    )

    return {
      success: false,
      error:
        error instanceof Error ? error : new NotificationError('Failed to send notification batch'),
    }
  }
}

/**
 * Legacy interface implementation for backward compatibility
 * @deprecated Use the individual functions instead
 */
export const notificationApiService: INotificationApiService = {
  notify: _notify,
  notifyBatch: _notifyBatch,
}

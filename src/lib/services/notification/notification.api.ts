import 'server-only'
import { httpClient } from '@/lib/http/client'
import { env } from '@/config/env'
import { clientEnv } from '@/config/client-env'
import { logger } from '@/lib/logging/logger'
import {
  type NotificationOptions,
  type Result,
  NotificationError,
} from './notification.types'

/**
 * Send a notification message with Result pattern
 */
export async function notify(
  message: string,
  options: NotificationOptions = {}
): Promise<Result<void>> {
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
        timeout: 10000, // 10 second timeout for notifications
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


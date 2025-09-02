import * as Sentry from '@sentry/nextjs';
import { clientEnv } from '@/config/client-env';

Sentry.init({
  dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Edge-specific settings
  tracesSampleRate: 0.1,
  
  beforeSend(event) {
    event.tags = {
      ...event.tags,
      runtime: 'edge',
    };
    
    // Redact sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    if (event.request?.headers) {
      const headers = event.request.headers as Record<string, string>;
      if (headers.authorization) {
        headers.authorization = '[REDACTED]';
      }
      if (headers.cookie) {
        headers.cookie = '[REDACTED]';
      }
    }
    
    return event;
  },
});
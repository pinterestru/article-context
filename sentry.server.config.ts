import * as Sentry from '@sentry/nextjs';
import { clientEnv } from '@/config/client-env';

Sentry.init({
  dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Server-specific settings
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Profiling (Node.js 16+)
  profilesSampleRate: 0.1,
  
  beforeSend(event) {
    // Server-side context enrichment
    event.tags = {
      ...event.tags,
      runtime: 'nodejs',
      node_version: process.version,
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
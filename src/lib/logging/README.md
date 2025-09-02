# Logging

Structured logging with automatic security redaction and client/server separation.

## Architecture

- **`logger.ts`** - Server-only logger using Pino (marked with `"use server"`)
- **`logger-client.ts`** - Browser-safe logging using console methods
- **`utils.ts`** - Shared utilities for both environments

## Usage

### Server-Side (API routes, server components)
```typescript
import { logger } from '@/lib/logging';

logger.info('User logged in', { userId: '123', event: 'auth.login' });
logger.error('Payment failed', { error, orderId: '456' });
```

### Client-Side (React components, error boundaries)
```typescript
import { logReactError, clientLogger } from '@/lib/logging';

// In error boundaries
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  logReactError(error, errorInfo, { component: 'MyComponent' });
}

// General client logging
clientLogger.info('Button clicked', { action: 'submit' });
```

## Configuration

```bash
LOG_LEVEL=debug  # Server only: trace, debug, info, warn, error, fatal
```

## Security

Server logger automatically redacts:
- IP addresses
- User agents  
- Authorization headers
- Cookies

## Pretty Logs

For development with formatted output:
```bash
pnpm dev | pnpm pino-pretty
```
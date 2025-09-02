import pino from 'pino';

// Safe env import for testing environments
let logLevel = 'info';
try {
  const { env } = require('@/config/env');
  logLevel = env.LOG_LEVEL || 'info';
} catch {
  // Use default in test environments
}

const loggerConfig: pino.LoggerOptions = {
  level: logLevel,
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  serializers: {
    error: pino.stdSerializers.err,
  },
  redact: {
    paths: [
      'ip',
      '*.ip',
      'userAgent',
      '*.userAgent',
      'headers.authorization',
      '*.headers.authorization',
      'headers.cookie',
      '*.headers.cookie',
    ],
    censor: '[REDACTED]',
  },
};

// Note: pino-pretty disabled to avoid worker thread issues in Next.js
// For pretty logs: pnpm dev | pnpm pino-pretty
export const logger = pino(loggerConfig);

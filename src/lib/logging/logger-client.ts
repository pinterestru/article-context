/**
 * Client-safe logging for browser environments
 */

interface ErrorInfo {
  componentStack?: string | null;
  digest?: string | null;
}

export function logReactError(
  error: Error,
  errorInfo: ErrorInfo | null,
  context?: Record<string, unknown>
) {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    console.error('React Error:', error.message);
    console.error('Stack:', error.stack);
    errorInfo?.componentStack && console.error('Component Stack:', errorInfo.componentStack);
    context && console.error('Context:', context);
  } else {
    console.error(`React Error: ${error.message}`, {
      digest: errorInfo?.digest,
      ...context
    });
  }
}

// Client logger with same API as server logger
const createLogMethod = (level: 'log' | 'warn' | 'error' | 'debug', prefix: string) => {
  return (message: string | Record<string, unknown>, ...args: unknown[]) => {
    const formatted = typeof message === 'object' 
      ? [prefix, message, ...args]
      : [`${prefix} ${message}`, ...args];
    
    console[level](...formatted);
  };
};

export const clientLogger = {
  info: createLogMethod('log', '[INFO]'),
  warn: createLogMethod('warn', '[WARN]'),
  error: createLogMethod('error', '[ERROR]'),
  debug: process.env.NODE_ENV === 'development' 
    ? createLogMethod('debug', '[DEBUG]') 
    : () => {} // No-op in production
};
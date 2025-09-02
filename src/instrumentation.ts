import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export async function onRequestError(
  error: Error,
  request: Request,
  context: { renderingType: string; routerKind: string; routePath?: string; routeType?: string }
) {
  // captureRequestError is not async, no need to await
  const requestInfo = {
    path: new URL(request.url).pathname,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
  }

  const errorContext = {
    routerKind: context.routerKind,
    routePath: context.routePath || '',
    routeType: context.routeType || context.renderingType,
  }

  Sentry.captureRequestError(error, requestInfo, errorContext)
}

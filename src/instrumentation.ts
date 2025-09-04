// src/instrumentation.ts

import * as Sentry from '@sentry/nextjs'

export async function register() {
  // This check is for the Node.js runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // ---- SENTRY INITIALIZATION (SERVER) ----
    await import('../sentry.server.config') // Note the path is now ../

    // Import env only in Node.js runtime to avoid Edge runtime validation errors
    const { env } = await import('@/config/env')

    // ---- OPENTELEMETRY INITIALIZATION ----
    // Only initialize OpenTelemetry if enabled
    if (env.ENABLE_OPENTELEMETRY) {
      // SOLUTION: All OpenTelemetry imports are now dynamic and conditional
      const { NodeSDK } = await import('@opentelemetry/sdk-node')
      const { resourceFromAttributes } = await import('@opentelemetry/resources')
      const { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } = await import(
        '@opentelemetry/semantic-conventions'
      )
      const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http')
      const { BatchSpanProcessor } = await import('@opentelemetry/sdk-trace-node')
      const { registerInstrumentations } = await import('@opentelemetry/instrumentation')
      const { getNodeAutoInstrumentations } = await import(
        '@opentelemetry/auto-instrumentations-node'
      )

      const resource = resourceFromAttributes({
        [SEMRESATTRS_SERVICE_NAME]: 'affiliate-article-ui',
        [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      })

      const traceExporter = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
        ? new OTLPTraceExporter({
            url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
            headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
              ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
              : {},
          })
        : undefined

      const sdk = new NodeSDK({
        resource,
        spanProcessors: traceExporter ? [new BatchSpanProcessor(traceExporter)] : [],
        instrumentations: [
          getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': { enabled: false },
            '@opentelemetry/instrumentation-http': {
              requestHook: (span, request) => {
                if ('url' in request && request.url) {
                  span.setAttribute(
                    'http.url.path',
                    new URL(request.url as string, 'http://localhost').pathname
                  )
                }
              },
            },
          }),
        ],
      })

      registerInstrumentations({
        instrumentations: [],
      })

      sdk.start()

      process.on('SIGTERM', () => {
        sdk
          .shutdown()
          .then(() => console.log('OpenTelemetry terminated successfully'))
          .catch((error) => console.error('Error terminating OpenTelemetry', error))
          .finally(() => process.exit(0))
      })
    }
  }

  // This check is for the Edge runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    // ---- SENTRY INITIALIZATION (EDGE) ----
    await import('../sentry.edge.config') // Note the path is now ../
  }
}

// ---- SENTRY OnRequestError HOOK ----
// This is your custom implementation, which is great. It captures server-side errors.
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

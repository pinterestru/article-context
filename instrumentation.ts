import { NodeSDK } from '@opentelemetry/sdk-node'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry
    await import('./sentry.server.config')
    
    // Import env only in Node.js runtime to avoid Edge runtime validation errors
    const { env } = await import('@/config/env')
    
    // Only initialize OpenTelemetry if enabled
    if (env.ENABLE_OPENTELEMETRY) {
      // Initialize OpenTelemetry
      const resource = resourceFromAttributes({
        [SEMRESATTRS_SERVICE_NAME]: 'affiliate-article-ui',
        [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      })

    // Configure OTLP exporter (optional - only if you have an OTLP endpoint)
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
          // Disable fs instrumentation to reduce noise
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
          // Configure HTTP instrumentation
          '@opentelemetry/instrumentation-http': {
            requestHook: (span, request) => {
              // Add custom attributes to HTTP spans
              if ('url' in request && request.url) {
                span.setAttribute('http.url.path', new URL(request.url as string, 'http://localhost').pathname)
              }
            },
          },
        }),
      ],
    })

    // Register instrumentations
    registerInstrumentations({
      instrumentations: [
        // Add any custom instrumentations here
      ],
    })

    // Initialize the SDK
    sdk.start()

      // Graceful shutdown
      process.on('SIGTERM', () => {
        sdk.shutdown()
          .then(() => console.log('OpenTelemetry terminated successfully'))
          .catch((error) => console.error('Error terminating OpenTelemetry', error))
          .finally(() => process.exit(0))
      })
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
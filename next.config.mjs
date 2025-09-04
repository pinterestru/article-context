import { withSentryConfig } from '@sentry/nextjs'
import createNextIntlPlugin from 'next-intl/plugin'
import withBundleAnalyzer from '@next/bundle-analyzer'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // This is the key to fixing the OpenTelemetry build errors.
    // It tells Webpack to ignore these optional dependencies.
    config.externals.push(
      '@opentelemetry/exporter-jaeger',
      '@opentelemetry/winston-transport',
    );
    
    // Important: return the modified config
    return config;
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/api/media/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/c/:path*',
        destination: '/api/c/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://tagmanager.google.com https://www.google-analytics.com https://mc.yandex.ru https://yastatic.net https://browser.sentry-cdn.com",
              "style-src 'self' 'unsafe-inline' https://tagmanager.google.com https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://www.googletagmanager.com https://www.google-analytics.com https://mc.yandex.ru",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://tagmanager.google.com https://mc.yandex.ru https://mc.yandex.com https://*.ingest.sentry.io",
              "frame-src 'self' https://www.googletagmanager.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
        ],
      },
    ]
  },
}


const composedConfig = withNextIntl(nextConfig)
const sentryConfig = withSentryConfig(composedConfig, {
  org: "adsteam",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
})

// 4. Export the final result wrapped in the bundle analyzer
export default bundleAnalyzer(sentryConfig)
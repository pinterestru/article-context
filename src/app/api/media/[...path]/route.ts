import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/env'
import { logger } from '@/lib/logging/logger'

/**
 * Media proxy route handler
 * Proxies requests to the backend API and adds caching headers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const pathSegments = resolvedParams.path

  // Reconstruct the media path
  const mediaPath = pathSegments.join('/')

  try {
    // Log the request
    logger.info(
      {
        action: 'media_proxy_request',
        path: mediaPath,
      },
      'Proxying media request'
    )

    // Construct the backend URL
    const backendUrl = `${env.API_BASE_URL}/media/${mediaPath}`

    // Fetch from backend
    const response = await fetch(backendUrl, {
      headers: {
        // Forward relevant headers
        'User-Agent': request.headers.get('User-Agent') || 'NextJS-Media-Proxy',
        Accept: request.headers.get('Accept') || '*/*',
      },
      // Don't follow redirects automatically
      redirect: 'manual',
    })

    // Handle redirects
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location')
      if (location) {
        return NextResponse.redirect(location)
      }
    }

    // Handle errors
    if (!response.ok) {
      logger.error(
        {
          action: 'media_proxy_error',
          path: mediaPath,
          status: response.status,
          statusText: response.statusText,
        },
        'Failed to fetch media from backend'
      )

      // Return a generic error image
      return new NextResponse(null, {
        status: response.status,
        statusText: response.statusText,
      })
    }

    // Get the content type
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream'

    // Check if it's an image
    const isImage = contentType.startsWith('image/')

    // Get the response body
    const body = await response.arrayBuffer()

    // Create response with appropriate headers
    const proxyResponse = new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': body.byteLength.toString(),
        // Cache for 1 year for images, 1 day for other content
        'Cache-Control': isImage ? 'public, max-age=31536000, immutable' : 'public, max-age=86400',
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        // CORS headers if needed
        'Access-Control-Allow-Origin': '*',
      },
    })

    return proxyResponse
  } catch (error) {
    logger.error(
      {
        action: 'media_proxy_exception',
        path: mediaPath,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Exception in media proxy'
    )

    return new NextResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    })
  }
}

/**
 * Handle HEAD requests for media
 */
export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const pathSegments = resolvedParams.path
  const mediaPath = pathSegments.join('/')

  try {
    const backendUrl = `${env.API_BASE_URL}/api/media/${mediaPath}`

    const response = await fetch(backendUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': request.headers.get('User-Agent') || 'NextJS-Media-Proxy',
      },
    })

    return new NextResponse(null, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Length': response.headers.get('Content-Length') || '0',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    logger.error(
      {
        action: 'media_head_exception',
        path: mediaPath,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Exception in media HEAD request'
    )

    return new NextResponse(null, { status: 500 })
  }
}

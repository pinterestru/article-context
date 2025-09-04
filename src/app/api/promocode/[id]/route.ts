import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logging/logger'
import { COOKIES } from '@/config/constants'
import { fetchPromocodeById } from '@/lib/services/promocode/promocode.api'
import { getStoreBySlug } from '@/lib/services/store/store.api'
import { PROMOCODE_CONFIG } from '@/features/promocode/constants'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const promocodeId = resolvedParams.id
  try {
    // Check if request is from bot based on cookies
    const cookieStore = await cookies()
    const targetCookie = cookieStore.get(COOKIES.TARGET)
    const isBot = targetCookie?.value === 'false'

    // Verify request timing
    const lastLogCookie = cookieStore.get('_last_log')
    const clickTime = lastLogCookie?.value ? parseInt(lastLogCookie.value) : Date.now()
    const currentTime = Date.now()

    // If more than configured time passed since click, reject
    if (currentTime - clickTime > PROMOCODE_CONFIG.MAX_FETCH_DELAY) {
      logger.warn(
        {
          promocodeId,
          timeDiff: currentTime - clickTime,
        },
        'Promocode request timeout'
      )

      return NextResponse.json(
        { message: '404' },
        { status: 200 } // Return 200 with error message for compatibility
      )
    }

    // Return bot response if detected
    if (isBot) {
      logger.info(
        {
          promocodeId,
          isBot: true,
        },
        'Bot detected, returning mock promocode'
      )

      return NextResponse.json(
        { message: '404' },
        { status: 200 } // Return 200 with error message for compatibility
      )
    }

    // Fetch promocode using the API service
    const promocodeResult = await fetchPromocodeById(promocodeId)

    if (!promocodeResult.success) {
      logger.error(
        {
          promocodeId,
          error: promocodeResult.error.message,
        },
        'Failed to fetch promocode'
      )
      return NextResponse.json({ message: '404' }, { status: 200 })
    }

    const promocode = promocodeResult.data

    // Fetch store details if we have a product ID
    let store = null
    if (promocode.partner) {
      const storeResult = await getStoreBySlug(promocode.partner)
      if (storeResult.success) {
        store = storeResult.data
      } else {
        logger.warn(
          {
            promocodeId,
            storeSlug: promocode.partner,
            error: storeResult.error.message,
          },
          'Failed to fetch store for promocode'
        )
      }
    }

    // Transform to match expected API format
    const item = {
      id: promocode.id,
      title: promocode.description || promocode.discount || '',
      description: promocode.description || '',
      code: promocode.code || '',
      link: promocode.targetUrl || '',
      link_query_params: '',
      store_name: store?.name || promocode.storeLabel || '',
      store_image: Array.isArray(store?.images)
        ? store?.images[0]
        : store?.images || promocode.storeLogo || '',
      slug: store?.slug || promocode.partner || '',
      images: promocode.storeLogo || '',
    }

    return NextResponse.json({ item })
  } catch (error) {
    logger.error(
      {
        promocodeId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to fetch promocode'
    )

    // Return generic error
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

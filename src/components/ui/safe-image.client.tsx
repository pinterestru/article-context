'use client'

import { useState, useEffect, useMemo } from 'react'
import Image, { type ImageProps } from 'next/image'
import { getMediaPath, isValidImageUrl, getPlaceholderImage, getImageSize } from '@/lib/utils/media'
import { cn } from '@/lib/utils'

export interface SafeImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  /**
   * The image source - can be a path from API or full URL
   */
  src: string | string[] | null | undefined
  /**
   * Alt text for the image
   */
  alt: string
  /**
   * Fallback image URL or type
   */
  fallback?: string | 'store' | 'product' | 'article' | 'user'
  /**
   * Whether to show a loading skeleton
   */
  showSkeleton?: boolean
  /**
   * Additional class names for the wrapper
   */
  wrapperClassName?: string
  /**
   * Media path options
   */
  mediaOptions?: {
    mediaPath?: string
    absolute?: boolean
  }
  /**
   * Auto-detect dimensions from URL (e.g., __size143x59y)
   */
  autoSize?: boolean
  /**
   * Maximum width constraint for auto-sizing
   */
  maxWidth?: number
  /**
   * Maximum height constraint for auto-sizing
   */
  maxHeight?: number
  /**
   * Number of retry attempts for failed loads
   */
  retryAttempts?: number
  /**
   * Delay between retry attempts in milliseconds
   */
  retryDelay?: number
  /**
   * Base64 encoded blur placeholder
   */
  blurDataURL?: string
  /**
   * Enable blur placeholder while loading
   */
  enableBlur?: boolean
}

/**
 * SafeImage component that handles image URLs from API
 * Provides error handling, loading states, and automatic URL resolution
 */
export function SafeImage({
  src,
  alt,
  fallback,
  showSkeleton = true,
  mediaOptions,
  onError,
  className,
  autoSize = false,
  maxWidth,
  maxHeight,
  width: propWidth,
  height: propHeight,
  retryAttempts = 0,
  retryDelay = 1000,
  blurDataURL,
  enableBlur = false,
  ...props
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Determine fallback image
  const fallbackSrc = fallback
    ? typeof fallback === 'string' && (fallback.startsWith('/') || fallback.startsWith('http'))
      ? fallback
      : getPlaceholderImage(fallback as 'store' | 'product' | 'article' | 'user')
    : getPlaceholderImage('store')

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true)
    setHasError(false)
    setRetryCount(0)

    // Get the media path
    const resolvedSrc = getMediaPath(src, {
      ...mediaOptions,
      fallback: fallbackSrc,
    })

    // Validate the URL
    if (!resolvedSrc || !isValidImageUrl(resolvedSrc)) {
      setImageSrc(fallbackSrc)
      setIsLoading(false)
      setHasError(true)
      return
    }

    setImageSrc(resolvedSrc)
  }, [src, fallbackSrc, mediaOptions])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`Image failed to load: ${imageSrc}, attempt ${retryCount + 1}`)

    // If we have retry attempts left, try again
    if (retryCount < retryAttempts) {
      setTimeout(
        () => {
          setRetryCount((prev) => prev + 1)
          setIsLoading(true)
          setHasError(false)
          // Force re-render by appending timestamp
          setImageSrc(`${imageSrc.split('?')[0]}?retry=${Date.now()}`)
        },
        retryDelay * Math.pow(2, retryCount)
      ) // Exponential backoff
    } else {
      // No more retries, use fallback
      setImageSrc(fallbackSrc)
      setIsLoading(false)
      setHasError(true)

      // Call the onError prop if provided (it will receive the event)
      if (onError) {
        onError(e)
      }
    }
  }

  // Calculate dimensions if autoSize is enabled
  const dimensions = useMemo(() => {
    if (!autoSize || !imageSrc) {
      return { width: propWidth, height: propHeight }
    }

    const { width, height } = getImageSize(imageSrc, { maxWidth, maxHeight })

    // If we got valid dimensions from the URL, use them
    if (width > 0 && height > 0) {
      return { width, height }
    }

    // Otherwise use the provided dimensions
    return { width: propWidth, height: propHeight }
  }, [autoSize, imageSrc, maxWidth, maxHeight, propWidth, propHeight])

  // Don't render anything if no valid source
  if (!imageSrc) {
    return null
  }

  // For fill prop, we need to ensure the wrapper doesn't interfere
  const isFill = 'fill' in props && props.fill

  // If using fill, don't wrap in an extra div unless needed for skeleton/error
  if (isFill && !showSkeleton && !hasError) {
    return (
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        className={cn(
          className,
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100 transition-opacity duration-300'
        )}
        placeholder={enableBlur && blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
      />
    )
  }

  return (
    <>
      {/* Loading skeleton */}
      {showSkeleton && isLoading && (
        <div
          className="absolute inset-0 animate-pulse rounded bg-gray-200"
          role="status"
          aria-label="Loading image"
        >
          <span className="sr-only">Loading image...</span>
        </div>
      )}

      {/* Next.js Image component */}
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        className={cn(
          className,
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100 transition-opacity duration-300'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Error indicator (optional) */}
      {hasError && process.env.NODE_ENV === 'development' && (
        <div
          className="absolute top-0 right-0 z-10 rounded-bl bg-red-500 px-1 text-xs text-white"
          role="alert"
          aria-label="Image failed to load"
        >
          IMG ERR
        </div>
      )}
    </>
  )
}

/**
 * SafeImage with common presets
 */
export const SafeStoreImage = (props: Omit<SafeImageProps, 'fallback'>) => (
  <SafeImage {...props} fallback="store" />
)

export const SafeProductImage = (props: Omit<SafeImageProps, 'fallback'>) => (
  <SafeImage {...props} fallback="product" />
)

export const SafeArticleImage = (props: Omit<SafeImageProps, 'fallback'>) => (
  <SafeImage {...props} fallback="article" />
)

export const SafeUserImage = (props: Omit<SafeImageProps, 'fallback'>) => (
  <SafeImage {...props} fallback="user" />
)

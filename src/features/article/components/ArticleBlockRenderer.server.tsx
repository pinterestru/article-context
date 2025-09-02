import { cn } from '@/lib/utils/cn'
import Image from 'next/image'
import type {
  ArticleBlock,
  WidgetBlock,
  ImageBlock,
  HeadingBlock,
} from '@/lib/article/types/blocks'
import {
  isContentBlock,
  isWidgetBlock,
  isImageBlock,
  isHeadingBlock,
} from '@/lib/article/types/blocks'
import { createDangerousHTML } from '@/lib/article/types/sanitized'
import { widgetRegistry } from '@/features/widgets/lib/registry.server'
import { WidgetErrorBoundary } from './WidgetErrorBoundary.client'
import { WidgetSuspenseWrapper } from './WidgetSuspenseWrapper'
import type { HTMLAttributes } from 'react'
import { logger } from '@/lib/logging/logger'

interface ArticleBlockRendererProps extends HTMLAttributes<HTMLDivElement> {
  blocks: ArticleBlock[]
  ecommerceStoreId?: string
  articleSlug?: string
  articleId?: string
}

export function ArticleBlockRenderer({
  blocks,
  ecommerceStoreId,
  articleSlug: _articleSlug,
  articleId: _articleId,
  className,
  ...domProps
}: ArticleBlockRendererProps) {
  return (
    <article className={cn('article-content', className)} {...domProps}>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} ecommerceStoreId={ecommerceStoreId} />
      ))}
    </article>
  )
}

interface BlockRendererProps {
  block: ArticleBlock
  ecommerceStoreId?: string
}

function BlockRenderer({ block, ecommerceStoreId }: BlockRendererProps) {
  try {
    // Content block
    if (isContentBlock(block)) {
      return <div dangerouslySetInnerHTML={createDangerousHTML(block.html)} />
    }

    // Widget block
    if (isWidgetBlock(block)) {
      return <WidgetBlockRenderer block={block} ecommerceStoreId={ecommerceStoreId} />
    }

    // Image block
    if (isImageBlock(block)) {
      return <ImageBlockRenderer block={block} />
    }

    // Heading block
    if (isHeadingBlock(block)) {
      return <HeadingBlockRenderer block={block} />
    }

    // Unknown block type (this should never happen with proper typing)
    // TypeScript narrows this to 'never', but we keep this for runtime safety
    const unknownBlock = block as ArticleBlock
    const blockType = 'type' in unknownBlock ? unknownBlock.type : 'unknown'
    const blockId = unknownBlock.id || 'unknown'
    logger.error(
      {
        event: 'article_block_render_error',
        error: `Unknown block type: ${blockType}`,
        blockType,
        blockId,
        componentName: 'BlockRenderer',
      },
      `Unknown block type: ${blockType}`
    )
    return null
  } catch (error) {
    logger.error(
      {
        event: 'article_block_render_error',
        error: error as Error,
        blockId: block.id,
        blockType: 'type' in block ? block.type : 'unknown',
        componentName: 'BlockRenderer',
      },
      'Failed to render block'
    )
    return (
      <div className="my-4 rounded-md border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">
          Failed to render content block. Please refresh the page.
        </p>
      </div>
    )
  }
}

interface WidgetBlockRendererProps {
  block: WidgetBlock
  ecommerceStoreId?: string
}

function WidgetBlockRenderer({ block, ecommerceStoreId }: WidgetBlockRendererProps) {
  const { config } = block
  const entry = widgetRegistry.get(config.type)

  if (!entry) {
    logger.warn(
      {
        event: 'widget_load',
        widgetType: config.type,
        success: false,
        widgetId: block.id,
        errorMessage: `No widget registered for type: ${config.type}`,
        componentName: 'WidgetBlockRenderer',
      },
      `No widget registered for type: ${config.type}`
    )
    return (
      <div className="my-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-700">Widget type "{config.type}" is not available.</p>
      </div>
    )
  }

  const Component = entry.component

  try {
    // Log successful widget load
    logger.info(
      {
        event: 'widget_load',
        widgetType: config.type,
        success: true,
        widgetId: block.id,
        componentName: 'WidgetBlockRenderer',
      },
      'Widget loaded successfully'
    )

    // Pass ecommerceStoreId to config for widgets that need it
    const widgetConfig = {
      ...config,
      ecommerceStoreId,
    }

    // Render with error boundary and suspense wrapper
    // Wrap in a div with consistent article spacing
    return (
      <div className="article-widget-wrapper">
        <WidgetErrorBoundary widgetType={config.type}>
          <WidgetSuspenseWrapper
            widgetId={block.id}
            widgetType={config.type}
            component={Component}
            skeleton={entry.skeleton}
            config={widgetConfig}
          />
        </WidgetErrorBoundary>
      </div>
    )
  } catch (error) {
    logger.error(
      {
        event: 'widget_load',
        widgetType: config.type,
        success: false,
        widgetId: block.id,
        errorMessage: (error as Error).message,
        componentName: 'WidgetBlockRenderer',
      },
      'Failed to load widget'
    )
    throw error // Let WidgetErrorBoundary handle it
  }
}

interface ImageBlockRendererProps {
  block: ImageBlock
}

function ImageBlockRenderer({ block }: ImageBlockRendererProps) {
  const { src, alt, width, height, caption, loading = 'lazy' } = block

  try {
    // Check if the image is external
    const isExternal = src.startsWith('http://') || src.startsWith('https://')

    // Use server-side optimized image rendering
    const imageElement = (
      <div className="article-image-wrapper my-6">
        <div className="relative w-full">
          {isExternal ? (
            // External images - use native img tag
            width && height ? (
              // With dimensions - prevent layout shift
              <div
                className="relative w-full overflow-hidden rounded-lg"
                style={{ paddingBottom: `${(height / width) * 100}%` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={loading}
                  width={width}
                  height={height}
                />
              </div>
            ) : (
              // Without dimensions
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="h-auto w-full rounded-lg shadow-lg"
                  loading={loading}
                />
              </>
            )
          ) : (
            // Local images - use Next.js Image component
            <div className="relative w-full overflow-hidden rounded-lg">
              {width && height ? (
                <Image
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  loading={loading}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              ) : (
                // Local image without dimensions - still use Next.js Image but with intrinsic sizing
                <Image
                  src={src}
                  alt={alt}
                  width={800}
                  height={600}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  loading={loading}
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    )

    if (caption) {
      return (
        <figure className="my-8">
          {imageElement}
          <figcaption className="text-muted-foreground mt-2 text-center text-sm">
            {caption}
          </figcaption>
        </figure>
      )
    }

    return imageElement
  } catch (error) {
    logger.error(
      {
        event: 'article_block_render_error',
        error: error as Error,
        blockId: block.id,
        blockType: 'image',
        imageSrc: src,
        componentName: 'ImageBlockRenderer',
      },
      'Failed to render image block'
    )
    return (
      <div className="my-4 rounded-md border border-gray-300 bg-gray-100 p-8 text-center">
        <p className="text-sm text-gray-600">Failed to load image</p>
      </div>
    )
  }
}

interface HeadingBlockRendererProps {
  block: HeadingBlock
}

function HeadingBlockRenderer({ block }: HeadingBlockRendererProps) {
  const { level, text, anchorId } = block

  // Create heading element based on level
  const headingProps = {
    id: anchorId,
    className: getHeadingClassName(level),
    children: text,
  }

  switch (level) {
    case 1:
      return <h1 {...headingProps} />
    case 2:
      return <h2 {...headingProps} />
    case 3:
      return <h3 {...headingProps} />
    case 4:
      return <h4 {...headingProps} />
    case 5:
      return <h5 {...headingProps} />
    case 6:
      return <h6 {...headingProps} />
    default:
      return <h2 {...headingProps} />
  }
}

function getHeadingClassName(level: number): string {
  const baseClasses = 'font-bold tracking-tight'

  switch (level) {
    case 1:
      return cn(baseClasses, 'mt-0 mb-8 text-3xl md:text-3xl lg:text-4xl')
    case 2:
      return cn(baseClasses, 'mt-12 mb-6 text-xl md:text-2xl lg:text-3xl')
    case 3:
      return cn(baseClasses, 'mt-8 mb-4 text-lg md:text-xl lg:text-2xl')
    case 4:
      return cn(baseClasses, 'mt-6 mb-3 text-lg md:text-xl lg:text-2xl')
    case 5:
      return cn(baseClasses, 'mt-4 mb-2 text-base md:text-lg lg:text-xl')
    case 6:
      return cn(baseClasses, 'mt-4 mb-2 text-sm md:text-base lg:text-lg')
    default:
      return baseClasses
  }
}

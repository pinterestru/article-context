import { sanitizeHtmlServer } from '@/lib/article/sanitize-server'
import { parseContentIntoBlocks } from '@/lib/article/block-parser'
import { ArticleInteractiveHandler } from './ArticleInteractiveHandler.client'
import { ArticleBlockRenderer } from './ArticleBlockRenderer.server'
import type { ArticleContentServerProps } from '../types'
import { isWidgetBlock } from '@/lib/article/types/blocks'
import { logger } from '@/lib/logging/logger'
import { headers } from 'next/headers'
import { getArticleBySlug } from '@/lib/services/article/article.api'
import { ArticleNotFoundError } from '@/lib/services/article/article.types'
import { notFound } from 'next/navigation'
import { getSiteConfig } from '@/config/sites/static'

/**
 * Block-based article content server component
 * This implementation parses content into blocks and renders them server-side
 */
export async function ArticleContentServer({
  content: contentProp,
  slug,
  ecommerceStoreId: ecommerceStoreIdProp,
  className,
  articleId: articleIdProp,
  ...props
}: ArticleContentServerProps) {
  const startTime = Date.now()
  const headersList = await headers()
  const _traceId = headersList.get('x-trace-id') || undefined

  // Declare variables outside try block so they're accessible in catch block
  let content = contentProp
  let ecommerceStoreId = ecommerceStoreIdProp
  let articleId = articleIdProp

  try {
    // If slug is provided, fetch the article data
    if (slug && !content) {
      const result = await getArticleBySlug(slug)

      if (!result.success) {
        if (result.error instanceof ArticleNotFoundError) {
          notFound()
        }
        throw result.error
      }

      const article = result.data
      content = article.content
      ecommerceStoreId = ecommerceStoreId || article.ecommerceStoreId
      articleId = articleId || article.id
    }

    if (!content) {
      throw new Error('No content provided and unable to fetch article')
    }

    // 1. Sanitize content server-side
    const sanitizedContent = sanitizeHtmlServer(content)

    if (!sanitizedContent || sanitizedContent.trim().length === 0) {
      throw new Error('Article content is empty after sanitization')
    }

    // 2. Parse content into blocks
    const parsedArticle = parseContentIntoBlocks(sanitizedContent, {
      extractImages: true,
      extractHeadings: true,
      preserveEmptyBlocks: false,
    })

    if (!parsedArticle.blocks || parsedArticle.blocks.length === 0) {
      throw new Error('No content blocks found in article')
    }

    // 3. Count widgets for logging
    const widgetCount = parsedArticle.blocks.filter(isWidgetBlock).length

    // Log successful render performance
    logger.info(
      {
        event: 'article_render_performance',
        metric: 'article_render',
        duration: Date.now() - startTime,
        articleId,
        blockCount: parsedArticle.blocks.length,
        widgetCount,
        articleSize: content.length,
      },
      'Article rendered successfully'
    )

    return (
      <>
        {/* Render all blocks with server components */}
        <ArticleBlockRenderer
          blocks={parsedArticle.blocks}
          ecommerceStoreId={ecommerceStoreId}
          className={className}
          {...props}
        />

        {/* Client component for interactive features */}
        <ArticleInteractiveHandler dialogType={getSiteConfig().promocodeDialog || 'default'} />
      </>
    )
  } catch (error) {
    // Log the error for monitoring with context
    logger.error(
      {
        event: 'article_render_error',
        error: error as Error,
        articleId,
        componentName: 'ArticleContentServer',
        ecommerceStoreId,
        contentLength: content?.length,
        phase: 'article_render',
        renderTime: Date.now() - startTime,
      },
      'Failed to render article'
    )

    // Re-throw to let the error boundary handle it
    // The error boundary at the route level will provide a user-friendly interface
    throw error
  }
}

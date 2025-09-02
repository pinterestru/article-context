import type { WidgetConfig } from '@/features/widgets/lib/config-parser'
import type { SanitizedHTML } from './sanitized'

/**
 * Base block type with common properties
 */
interface BaseBlock {
  id: string
  order: number
}

/**
 * Content block containing HTML content
 * HTML is branded as SanitizedHTML to prevent injection of unsanitized content
 */
export interface ContentBlock extends BaseBlock {
  type: 'content'
  html: SanitizedHTML
}

/**
 * Widget block containing widget configuration and data
 */
export interface WidgetBlock extends BaseBlock {
  type: 'widget'
  config: WidgetConfig
  data?: unknown // Pre-fetched widget data
  element?: {
    attributes: Record<string, string>
    innerHTML?: string
  }
}

/**
 * Image block for optimized image handling
 */
export interface ImageBlock extends BaseBlock {
  type: 'image'
  src: string
  alt: string
  width?: number
  height?: number
  caption?: string
  loading?: 'lazy' | 'eager'
}

/**
 * Heading block for better structure
 */
export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  text: string
  anchorId?: string // For anchor links
}

/**
 * Union type of all possible blocks
 */
export type ArticleBlock = ContentBlock | WidgetBlock | ImageBlock | HeadingBlock

/**
 * Parsed article structure
 */
export interface ParsedArticle {
  blocks: ArticleBlock[]
  metadata: {
    totalBlocks: number
    widgetCount: number
    imageCount: number
    headingCount: number
  }
}

/**
 * Block parsing options
 */
export interface BlockParserOptions {
  /**
   * Whether to extract images as separate blocks
   */
  extractImages?: boolean

  /**
   * Whether to extract headings as separate blocks
   */
  extractHeadings?: boolean

  /**
   * Whether to preserve empty content blocks
   */
  preserveEmptyBlocks?: boolean

  /**
   * Maximum HTML length for a single content block
   */
  maxBlockSize?: number
}

/**
 * Type guards for block types
 */
export function isContentBlock(block: ArticleBlock): block is ContentBlock {
  return block.type === 'content'
}

export function isWidgetBlock(block: ArticleBlock): block is WidgetBlock {
  return block.type === 'widget'
}

export function isImageBlock(block: ArticleBlock): block is ImageBlock {
  return block.type === 'image'
}

export function isHeadingBlock(block: ArticleBlock): block is HeadingBlock {
  return block.type === 'heading'
}

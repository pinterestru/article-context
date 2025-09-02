import 'server-only'
import { JSDOM } from 'jsdom'
import type {
  ArticleBlock,
  ParsedArticle,
  BlockParserOptions,
  ContentBlock,
  WidgetBlock,
  ImageBlock,
  HeadingBlock,
} from './types/blocks'
import type { WidgetConfig } from '@/features/widgets/lib/config-parser'
import { createSanitizedHTML } from './types/sanitized'

const DEFAULT_OPTIONS: BlockParserOptions = {
  extractImages: true,
  extractHeadings: true,
  preserveEmptyBlocks: false,
  maxBlockSize: 10000,
}

/**
 * Generate a deterministic ID for blocks to avoid hydration mismatches
 */
function generateBlockId(type: string, order: number, content?: string): string {
  // Create a simple hash from content for uniqueness
  const contentHash = content
    ? content
        .slice(0, 30)
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase()
    : ''
  return `${type}-${order}-${contentHash}`.slice(0, 50) // Limit length
}

/**
 * Parse HTML content into structured blocks
 */
export function parseContentIntoBlocks(
  html: string,
  options: BlockParserOptions = {}
): ParsedArticle {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const blocks: ArticleBlock[] = []
  let blockOrder = 0

  // Parse HTML
  const dom = new JSDOM(html)
  const document = dom.window.document
  const body = document.body

  // Track metadata
  let widgetCount = 0
  let imageCount = 0
  let headingCount = 0

  // Current content accumulator
  let currentContent: string[] = []

  // Helper to flush accumulated content
  const flushContent = () => {
    if (currentContent.length === 0 && !opts.preserveEmptyBlocks) {
      return
    }

    const html = currentContent.join('')
    if (html.trim() || opts.preserveEmptyBlocks) {
      const id = generateBlockId('content', blockOrder, html)
      blocks.push({
        id,
        type: 'content',
        order: blockOrder++,
        html: createSanitizedHTML(html),
      } satisfies ContentBlock)
    }
    currentContent = []
  }

  // Process nodes recursively
  const processNode = (node: Node) => {
    // Handle text nodes
    if (node.nodeType === node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text.trim()) {
        currentContent.push(text)
      }
      return
    }

    // Handle element nodes
    if (node.nodeType === node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()

      // Check for widget anchor (hash-based only)
      if (tagName === 'a') {
        const href = element.getAttribute('href')
        const isHashWidget = href && href.startsWith('#')

        if (isHashWidget) {
          // Flush any accumulated content
          flushContent()

          // Create widget block from hash
          const widgetConfig = extractWidgetConfigFromHash(href)

          if (widgetConfig) {
            const widgetId = generateBlockId('widget', blockOrder, widgetConfig.type)
            blocks.push({
              id: widgetId,
              type: 'widget',
              order: blockOrder++,
              config: widgetConfig,
              element: {
                attributes: getElementAttributes(element),
                innerHTML: element.innerHTML,
              },
            } satisfies WidgetBlock)
            widgetCount++
          }
          return
        }
      }

      // Check for headings
      if (opts.extractHeadings && /^h[1-6]$/.test(tagName)) {
        flushContent()

        const level = parseInt(tagName.substring(1)) as 1 | 2 | 3 | 4 | 5 | 6
        const headingId = element.id || undefined
        const blockId = generateBlockId('heading', blockOrder, element.textContent || '')
        blocks.push({
          id: blockId,
          type: 'heading',
          order: blockOrder++,
          level,
          text: element.textContent || '',
          ...(headingId && { anchorId: headingId }),
        } satisfies HeadingBlock)
        headingCount++
        return
      }

      // Check for images
      if (opts.extractImages && tagName === 'img') {
        flushContent()

        const img = element as HTMLImageElement
        const imgId = generateBlockId('image', blockOrder, img.src)
        blocks.push({
          id: imgId,
          type: 'image',
          order: blockOrder++,
          src: img.src,
          alt: img.alt || '',
          width: img.width || undefined,
          height: img.height || undefined,
          loading: (img.loading as 'lazy' | 'eager') || 'lazy',
        } satisfies ImageBlock)
        imageCount++
        return
      }

      // For other elements, add to content
      const openTag = `<${tagName}${getAttributesString(element)}>`
      const closeTag = `</${tagName}>`

      // Handle self-closing tags
      if (['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tagName)) {
        currentContent.push(openTag.replace('>', ' />'))
        return
      }

      currentContent.push(openTag)

      // Process children
      element.childNodes.forEach((child) => processNode(child))

      currentContent.push(closeTag)
    }
  }

  // Process all body children
  body.childNodes.forEach((node) => processNode(node))

  // Flush any remaining content
  flushContent()

  return {
    blocks,
    metadata: {
      totalBlocks: blocks.length,
      widgetCount,
      imageCount,
      headingCount,
    },
  }
}

/**
 * Get all attributes of an element as an object
 */
function getElementAttributes(element: Element): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const attr of Array.from(element.attributes)) {
    attrs[attr.name] = attr.value
  }
  return attrs
}

/**
 * Convert element attributes to HTML string
 */
function getAttributesString(element: Element): string {
  const attrs = Array.from(element.attributes)
    .map((attr) => `${attr.name}="${attr.value}"`)
    .join(' ')
  return attrs ? ` ${attrs}` : ''
}

// Known widget types that can be used in hash format
const KNOWN_WIDGET_TYPES = [
  'promocode_list',
  'promocode',
  'countdown',
  // Add more widget types as needed
]

/**
 * Extract widget configuration from hash-based href
 * Format: #widget_type?param1=value1&param2=value2
 */
function extractWidgetConfigFromHash(href: string): WidgetConfig | null {
  try {
    if (!href.startsWith('#')) {
      return null
    }

    // Remove the # and split by ?
    const hashContent = href.substring(1)
    const [widgetType, queryString] = hashContent.split('?')

    if (!widgetType || !KNOWN_WIDGET_TYPES.includes(widgetType)) {
      return null
    }

    // Parse query parameters
    const params: Record<string, string> = {}
    if (queryString) {
      const searchParams = new URLSearchParams(queryString)
      searchParams.forEach((value, key) => {
        params[key] = value
      })
    }

    // Build configuration object
    const config: WidgetConfig = {
      type: widgetType,
      ...params,
    } as WidgetConfig

    return config
  } catch (error) {
    console.error('Failed to parse widget config from hash:', error)
    return null
  }
}

/**
 * Merge adjacent content blocks to optimize rendering
 */
export function mergeAdjacentContentBlocks(blocks: ArticleBlock[]): ArticleBlock[] {
  const merged: ArticleBlock[] = []
  let currentContent: string[] = []
  let currentId: string | null = null
  let currentOrder: number | null = null

  for (const block of blocks) {
    if (block.type === 'content') {
      if (currentId === null) {
        currentId = block.id
        currentOrder = block.order
      }
      currentContent.push(block.html)
    } else {
      // Flush any accumulated content
      if (currentContent.length > 0 && currentId && currentOrder !== null) {
        merged.push({
          id: currentId,
          type: 'content',
          order: currentOrder,
          html: createSanitizedHTML(currentContent.join('')),
        })
        currentContent = []
        currentId = null
        currentOrder = null
      }
      merged.push(block)
    }
  }

  // Flush any remaining content
  if (currentContent.length > 0 && currentId && currentOrder !== null) {
    merged.push({
      id: currentId,
      type: 'content',
      order: currentOrder,
      html: createSanitizedHTML(currentContent.join('')),
    })
  }

  return merged
}

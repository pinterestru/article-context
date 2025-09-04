import 'server-only';
import { JSDOM } from 'jsdom';
import DOMPurify from 'isomorphic-dompurify';
import type { SanitizedHTML } from './types/sanitized';
import { getWebsiteUrl } from '@/lib/utils/domain';

// Cache for sanitized content
const sanitizedCache = new Map<string, SanitizedHTML>();
const CACHE_SIZE = 100; // Limit cache size to prevent memory issues

/**
 * Server-side HTML sanitization configuration
 */
const SANITIZE_CONFIG = {
  // Allow basic HTML tags
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
    'a',
    'ul', 'ol', 'li',
    'blockquote', 'q', 'cite',
    'pre', 'code', 'kbd', 'samp', 'var',
    'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'div', 'span', 'section', 'article', 'nav', 'aside', 'header', 'footer', 'main',
  ],
  // Allow safe attributes
  ALLOWED_ATTR: [
    'href', 'title', 'target', 'rel',
    'src', 'alt', 'width', 'height', 'loading',
    'class', 'id',
    'data-*', 'aria-*', 'role',
  ],
  // Allow data URIs for images (useful for base64 images)
  ALLOW_DATA_ATTR: true,
  // Keep classes for styling
  KEEP_CONTENT: true,
  // Ensure links open safely
  ADD_ATTR: ['target', 'rel'],
};

/**
 * Sanitizes HTML content on the server side
 * This eliminates the need for client-side sanitization and loading states
 * Returns a branded SanitizedHTML type to prevent injection of unsanitized content
 */
export function sanitizeHtmlServer(html: string): SanitizedHTML {
  // Check cache first
  if (sanitizedCache.has(html)) {
    return sanitizedCache.get(html)!;
  }

  // Create a window object for DOMPurify
  const window = new JSDOM('').window;
  const purify = DOMPurify(window);

  // Sanitize the HTML
  const clean = purify.sanitize(html, SANITIZE_CONFIG);

  // Additional processing: ensure external links have proper attributes
  const dom = new JSDOM(clean);
  const document = dom.window.document;
  
  // Add target="_blank" and rel="noopener noreferrer" to external links
  const links = document.querySelectorAll('a[href^="http"]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && !href.includes(getWebsiteUrl())) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Get the final HTML without additional image processing
  // Images will be handled by the block parser and renderer
  const result = dom.serialize() as SanitizedHTML;

  // Cache the result
  if (sanitizedCache.size >= CACHE_SIZE) {
    // Remove oldest entry when cache is full
    const firstKey = sanitizedCache.keys().next().value;
    if (firstKey !== undefined) {
      sanitizedCache.delete(firstKey);
    }
  }
  sanitizedCache.set(html, result);

  return result;
}

/**
 * Sanitizes HTML and extracts text for preview/excerpt purposes
 */
export function htmlToTextServer(html: string, maxLength?: number): string {
  // Create a window object
  const dom = new JSDOM(html);
  const text = dom.window.document.body.textContent || '';
  
  // Clean up whitespace
  const cleanText = text
    .replace(/\s+/g, ' ')
    .trim();

  if (maxLength && cleanText.length > maxLength) {
    return cleanText.substring(0, maxLength).trim() + '...';
  }

  return cleanText;
}
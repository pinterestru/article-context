/**
 * Media path utility for handling image URLs from the API
 * Converts relative paths to absolute URLs and handles various formats
 */

import { getWebsiteDomain } from "./domain";

interface MediaPathOptions {
  /**
   * Custom media path prefix (optional)
   */
  mediaPath?: string;
  /**
   * Fallback value if no valid path is found
   */
  fallback?: string;
  /**
   * Whether to return absolute URL (for server-side rendering)
   */
  absolute?: boolean;
}



/**
 * Convert a media path from API to a full URL
 * Handles various formats including comma-separated lists, relative paths, etc.
 * 
 * @param contentPath - The path from the API (can be string or string array)
 * @param options - Configuration options
 * @returns Full URL to the media resource or fallback
 */
export function getMediaPath(
  contentPath: string | string[] | null | undefined,
  options: MediaPathOptions = {}
): string {
  const { mediaPath, fallback = '', absolute } = options;
  
  // Handle array of images - take the first one
  if (Array.isArray(contentPath)) {
    return getMediaPath(contentPath[0], options);
  }
  
  // Convert to string and handle empty/null cases
  const pathString = String(contentPath || '').trim();
  
  // Split by comma and take the first path
  const path = pathString.split(',')[0]?.trim();
  
  if (!path) {
    return fallback;
  }
  
  // If already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If path already starts with /api/media/, return as-is (relative URL)
  if (path.startsWith('/api/media/')) {
    // Only prepend domain if absolute is explicitly true
    return absolute ? getWebsiteDomain(absolute) + path : path;
  }
  
  // If custom media path is provided, use it
  if (mediaPath) {
    return mediaPath + path;
  }
  
  // Default: create relative URL with /api/media/
  const mediaUrl = '/api/media/' + path;
  
  // Only prepend domain if absolute is explicitly true
  return absolute ? getWebsiteDomain(absolute) + mediaUrl : mediaUrl;
}

/**
 * Validate if a URL is valid and accessible
 * @param url - URL to validate
 * @returns boolean indicating if URL is valid
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    // Check if it's a valid URL
    new URL(url.startsWith('http') ? url : `https://${url}`);
    
    // Check if it has an image extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );
    
    // For /api/media/ paths, assume they're valid
    if (url.includes('/api/media/')) {
      return true;
    }
    
    return hasImageExtension;
  } catch {
    return false;
  }
}

/**
 * Get a placeholder image URL based on the type
 */
export function getPlaceholderImage(type: 'store' | 'product' | 'article' | 'user' = 'store'): string {
  const placeholders = {
    store: '/images/placeholder-store.svg',
    product: '/images/placeholder-product.svg',
    article: '/images/placeholder-article.svg',
    user: '/images/placeholder-user.svg',
  };
  
  return placeholders[type] || placeholders.store;
}

/**
 * Extract dimensions from image filename or path
 * e.g., "image__size300x200y.jpg" returns { width: 300, height: 200 }
 */
export function extractImageDimensions(path: string): { width?: number; height?: number } {
  // First try the __size format
  if (path.includes('__size')) {
    const sizeMatch = path.match(/__size(\d+)x(\d+)y/);
    if (sizeMatch) {
      return {
        width: parseInt(sizeMatch[1], 10),
        height: parseInt(sizeMatch[2], 10),
      };
    }
  }
  
  // Fallback to simple format
  const match = path.match(/(\d+)x(\d+)/);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }
  return {};
}

/**
 * Get image size with constraints
 * Extracts dimensions from path and applies max width/height constraints
 */
export function getImageSize(
  path: string,
  options: { maxWidth?: number; maxHeight?: number } = {}
): {
  width: number;
  height: number;
  isHorizontal: boolean;
  isVertical: boolean;
  aspectRatio?: number;
} {
  const { maxWidth, maxHeight } = options;
  let { width = 0, height = 0 } = extractImageDimensions(path);
  
  // Calculate aspect ratio if we have dimensions
  const aspectRatio = width > 0 && height > 0 ? width / height : undefined;
  
  // Apply max height constraint
  if (maxHeight && height > maxHeight && height > 0) {
    const ratio = maxHeight / height;
    height = maxHeight;
    width = Math.round(width * ratio);
  }
  
  // Apply max width constraint
  if (maxWidth && width > maxWidth && width > 0) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * ratio);
  }
  
  const isHorizontal = width > height;
  const isVertical = width <= height;
  
  return { width, height, isHorizontal, isVertical, aspectRatio };
}
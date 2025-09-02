import 'server-only';
import { JSDOM } from 'jsdom';

/**
 * Process images in HTML content on the server side to prevent layout shifts
 * Wraps images with proper styling and structure
 */
export function processImagesServer(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const images = document.querySelectorAll('img');
  
  images.forEach((img) => {
    const width = img.getAttribute('width');
    const height = img.getAttribute('height');
    
    // Skip if already wrapped
    const parent = img.parentElement;
    if (parent?.classList.contains('article-image-wrapper')) {
      return;
    }
    
    // Create wrapper structure
    const wrapper = document.createElement('div');
    wrapper.className = 'article-image-wrapper my-6';
    
    const innerWrapper = document.createElement('div');
    innerWrapper.className = 'relative w-full';
    
    // Clone the image with enhanced attributes
    const enhancedImg = img.cloneNode(true) as HTMLImageElement;
    enhancedImg.className = 'w-full h-auto rounded-lg shadow-lg';
    enhancedImg.setAttribute('loading', 'lazy');
    
    // If dimensions are provided, add aspect ratio container to prevent layout shift
    if (width && height) {
      const aspectRatio = (parseInt(height) / parseInt(width)) * 100;
      innerWrapper.style.paddingBottom = `${aspectRatio}%`;
      innerWrapper.className = 'relative w-full overflow-hidden rounded-lg';
      enhancedImg.className = 'absolute inset-0 w-full h-full object-cover';
    }
    
    // Build the structure
    innerWrapper.appendChild(enhancedImg);
    wrapper.appendChild(innerWrapper);
    
    // Replace the original image
    img.parentNode?.replaceChild(wrapper, img);
  });
  
  return dom.serialize();
}

/**
 * Extract image metadata for preloading or optimization
 */
export function extractImageMetadata(html: string): Array<{
  src: string;
  alt: string;
  width?: string;
  height?: string;
}> {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const images = document.querySelectorAll('img');
  
  return Array.from(images).map(img => ({
    src: img.getAttribute('src') || '',
    alt: img.getAttribute('alt') || '',
    width: img.getAttribute('width') || undefined,
    height: img.getAttribute('height') || undefined,
  })).filter(meta => meta.src);
}
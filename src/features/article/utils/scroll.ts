/**
 * Utility functions for smooth scrolling functionality
 */

export const HEADER_OFFSET = 80; // Adjust based on your header height

/**
 * Handle smooth scrolling for anchor links
 */
export const handleAnchorClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  
  // Check if the clicked element is an anchor link
  if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
    e.preventDefault();
    const id = target.getAttribute('href')?.substring(1);
    if (id) {
      scrollToElement(id);
    }
  }
};

/**
 * Scroll to an element by ID with smooth animation
 */
export const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - HEADER_OFFSET;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};

/**
 * Setup anchor link handling for a container
 */
export const setupAnchorLinks = (container: HTMLElement) => {
  container.addEventListener('click', handleAnchorClick);
  
  return () => {
    container.removeEventListener('click', handleAnchorClick);
  };
};
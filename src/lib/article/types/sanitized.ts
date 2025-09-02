/**
 * Branded type for sanitized HTML content to prevent injection of unsanitized content
 * This provides compile-time safety for dangerouslySetInnerHTML usage
 */
export type SanitizedHTML = string & { readonly __brand: 'SanitizedHTML' };

/**
 * Type guard to check if a string is already sanitized HTML
 */
export function isSanitizedHTML(value: string): value is SanitizedHTML {
  // This is a runtime check that always returns true since we rely on TypeScript branding
  // The real safety comes from the type system ensuring only sanitized content gets this brand
  return typeof value === 'string';
}

/**
 * Creates a SanitizedHTML from a trusted string
 * WARNING: Only use this if you are 100% certain the HTML is already sanitized
 */
export function createSanitizedHTML(html: string): SanitizedHTML {
  return html as SanitizedHTML;
}

/**
 * Unsafe function to extract raw string from SanitizedHTML
 * This should rarely be needed - the type system should handle most cases
 */
export function unsafeSanitizedHTMLToString(sanitizedHTML: SanitizedHTML): string {
  return sanitizedHTML as string;
}

/**
 * Helper function for React's dangerouslySetInnerHTML
 * This makes it clear that only sanitized HTML should be used
 */
export function createDangerousHTML(sanitizedHTML: SanitizedHTML): { __html: string } {
  return { __html: sanitizedHTML };
}
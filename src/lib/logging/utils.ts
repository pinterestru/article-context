/**
 * Shared logging utilities that can be used on both client and server
 */

/**
 * Helper to redact click IDs (show first 4 chars only)
 * This is a pure utility function that doesn't depend on any server-only code
 */
export function redactClickId(clickId?: string): string | undefined {
  if (!clickId || clickId.length <= 4) return clickId;
  return `${clickId.substring(0, 4)}...`;
}
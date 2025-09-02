/**
 * Static site configuration loader
 * This file imports the generated config and provides a clean API
 * without any runtime dependencies on environment variables
 */

import { activeSiteConfig, activeConfigName } from './active-config.generated'
import type { SiteConfig } from './types'

// Export the active site configuration
export const siteConfig: SiteConfig = activeSiteConfig

// Export getter function for use in components
export const getSiteConfig = (): SiteConfig => siteConfig

// Export the active config name
export const getActiveConfigName = (): string => activeConfigName

// Re-export types for convenience
export * from './types'
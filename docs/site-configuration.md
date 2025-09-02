# Site Configuration System

This document explains how to configure different sites/brands using the site configuration system.

## Overview

The site configuration system allows you to deploy the same codebase for multiple websites with different branding, themes, and layouts. Each site is configured through a static configuration file loaded at build time.

## Quick Start

1. Set the `SITE_CONFIG` environment variable to your site configuration name:
   ```bash
   SITE_CONFIG=brand-a npm run build
   ```

2. If not specified, it defaults to `'default'`.

## Creating a New Site Configuration

1. Create a new configuration file in `src/config/sites/configs/`:
   ```typescript
   // src/config/sites/configs/brand-a.ts
   import type { SiteConfig } from '../types'

   export const brandAConfig: SiteConfig = {
     id: 'brand-a',
     brand: {
       name: 'Brand A',
       logoUrl: '/images/brand-a/logo.png',
       faviconUrl: '/images/brand-a/favicon.ico',
       metaDescription: 'Welcome to Brand A'
     },
     theme: {
       base: 'dark', // or 'default', 'corporate', 'modern'
       colors: {
         primary: '#ff6b6b',
         secondary: '#4ecdc4'
       }
     },
     layouts: {
       header: 'default', // or 'minimal', 'full' (coming soon)
       footer: 'default', // or 'minimal', 'extended', 'compact' (coming soon)
       promocodeList: 'grid' // or 'list', 'inline', 'featured'
     }
   }
   ```

2. Register your configuration in `src/config/sites/index.ts`:
   ```typescript
   import { brandAConfig } from './configs/brand-a'

   const siteConfigs: Record<string, SiteConfig> = {
     default: defaultConfig,
     'brand-a': brandAConfig, // Add your config here
   }
   ```

3. Deploy with your configuration:
   ```bash
   SITE_CONFIG=brand-a npm run build
   ```

## Configuration Options

### Brand Settings
- `name`: Brand name displayed throughout the site
- `logoUrl`: Path to your logo image
- `faviconUrl`: Path to your favicon
- `metaDescription`: Default meta description for SEO

### Theme Settings
- `base`: Base theme ('default', 'dark', 'corporate', 'modern')
- `colors`: Override theme colors (optional)
  - `primary`: Primary brand color
  - `secondary`: Secondary brand color
  - `accent`: Accent color
- `fonts`: Override fonts (optional)
  - `heading`: Font for headings
  - `body`: Font for body text

### Layout Variants

#### Header Variants
- `default`: Standard header with logo
- `minimal`: Just logo, no navigation (coming soon)
- `full`: Logo + navigation + CTA (coming soon)

#### Footer Variants
- `default`: Three-column footer with company info, links, and contact
- `minimal`: Just copyright (coming soon)
- `extended`: Four columns with social links (coming soon)
- `compact`: Two-column simplified layout (coming soon)

#### Promocode List Variants
- `list`: Vertical list of cards (default)
- `grid`: Responsive grid layout
- `inline`: Compact inline layout
- `featured`: Featured items displayed larger

### Navigation
Configure custom navigation links:
```typescript
navigation: {
  header: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' }
  ],
  footer: {
    showQuickLinks: true,
    showContact: true,
    additionalSections: [{
      title: 'Resources',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'FAQ', href: '/faq' }
      ]
    }]
  }
}
```

## Adding New Layout Variants

Currently, only the 'default' variant is implemented for headers and footers. To add new variants:

1. Update the component to handle the new variant in the switch statement
2. Implement the variant-specific rendering logic
3. Update the type definitions if needed

Example locations:
- Header: `src/components/shell/header/Header.tsx`
- Footer: `src/components/shell/footer/Footer.tsx`

## Environment Variables

The site configuration system works alongside existing environment variables:
- `SITE_CONFIG`: Selects which site configuration to use
- `API_BASE_URL`, `ARTICLE_ECOMMERCE_STORE_ID`, etc.: Continue to work as before

## Build Process

The `prepare-site.mjs` script:
1. Loads the site configuration based on `SITE_CONFIG`
2. Copies the appropriate theme CSS
3. In the future, will generate CSS overrides and metadata

## Example Deployment

```bash
# Development
SITE_CONFIG=brand-a npm run dev

# Production build
SITE_CONFIG=brand-a \
API_BASE_URL=https://api.example.com \
ARTICLE_ECOMMERCE_STORE_ID=store-123 \
npm run build

# Using different themes
SITE_CONFIG=default THEME_NAME=dark npm run build
```
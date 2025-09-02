# Epic 4: Analytics & Monitoring Integration

**Goal**: Implement comprehensive tracking and monitoring to measure success, optimize conversions, and maintain system health. This epic sets up Google Tag Manager as the central hub for analytics, integrates both Google Analytics 4 and Yandex Metrica for market-specific insights, and adds error tracking via Sentry and product analytics through PostHog.

## Story 4.1: Google Tag Manager Implementation

As a marketing analyst,
I want GTM installed as our tag management system,
so that we can manage all tracking pixels without code changes.

### Acceptance Criteria
1: Add GTM container snippet to app layout (head and body)
2: Configure GTM container ID via environment variable
3: Implement dataLayer initialization with page metadata
4: Create custom GTM events for promocode interactions
5: Set up Preview mode for testing GTM changes
6: Document all custom dataLayer variables
7: Ensure GTM loads asynchronously without blocking
8: Verify GTM works with Content Security Policy

## Story 4.2: Google Analytics 4 Configuration

As a business analyst,
I want GA4 tracking implemented,
so that we can analyze traffic sources and user behavior.

### Acceptance Criteria
1: Configure GA4 tag in GTM with measurement ID
2: Set up Enhanced Ecommerce events for conversions
3: Track custom dimensions for cloak state and user type
4: Implement scroll tracking for content engagement
5: Set up conversion goals for promocode copies and clicks
6: Configure audience definitions for remarketing
7: Test cross-domain tracking for partner redirects
8: Verify GDPR compliance mode configuration

## Story 4.3: Yandex Metrica Integration

As a regional marketing manager,
I want Yandex Metrica installed,
so that we can optimize for Russian market traffic.

### Acceptance Criteria
1: Add Yandex Metrica tag via GTM
2: Configure goal tracking for Russian user conversions
3: Set up heatmap tracking for mobile interactions
4: Implement webvisor session recording (white mode only)
5: Track Yandex-specific UTM parameters
6: Configure counter settings for accurate bounce rate
7: Set up e-commerce tracking for affiliate conversions
8: Test Yandex.Direct auto-goals integration

## Story 4.4: PostHog Product Analytics

As a product manager,
I want detailed interaction analytics,
so that we can optimize the user experience.

### Acceptance Criteria
1: Initialize PostHog with project API key
2: Identify users with persistent anonymous IDs
3: Track feature flags for A/B testing widgets
4: Implement funnel tracking from land to conversion
5: Set up cohort analysis for user segments
6: Track custom events for all widget interactions
7: Configure session recording (white mode only)
8: Implement feature flag SDK for experimentation

## Story 4.5: Sentry Error Monitoring

As a developer,
I want comprehensive error tracking,
so that we can maintain system reliability.

### Acceptance Criteria
1: Install and configure Sentry for Next.js
2: Set up source maps for meaningful stack traces
3: Configure error boundaries with Sentry reporting
4: Implement performance monitoring for Core Web Vitals
5: Set up alerts for error rate spikes
6: Add custom context (cloak state, user type)
7: Configure sampling rates for cost control
8: Test error reporting in production environment

## Story 4.6: Custom Event Architecture

As a data analyst,
I want consistent event tracking across all platforms,
so that we can build unified dashboards.

### Acceptance Criteria
1: Define standard event naming convention
2: Create TypeScript types for all custom events
3: Implement event abstraction layer for all analytics
4: Document event schema with required properties
5: Create debug mode for event validation
6: Set up real-time event monitoring dashboard
7: Implement event batching for performance
8: Test events fire correctly across all analytics platforms

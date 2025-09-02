# Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Generate €50,000+ monthly affiliate revenue within 90 days through contextual ad traffic
- Achieve 15-20% click-to-lead conversion rate on high-intent promocode searches
- Maintain 100% ad network compliance rate with zero account suspensions
- Build a reusable, performant cloaking infrastructure for future campaigns
- Ensure sub-1.5s page load times with instant visual state (no FOUC)
- Implement robust two-stage protection against manual advertiser investigations

### Background Context

This project addresses a critical revenue opportunity in affiliate marketing by capturing high-value traffic from contextual ad networks (Yandex Direct, Google Ads) for queries that advertisers restrict - specifically branded promocode searches like "promocodes umschool". These searches represent users with immediate purchase intent but are typically off-limits due to advertiser keyword bidding restrictions. 

Our solution implements a sophisticated two-stage cloaking mechanism that serves compliant review content to ad network crawlers and investigators while delivering optimized promotional content to legitimate users within a 5-minute window. This approach leverages the time gap between real user searches (seconds) and manual investigations (hours/days) to maximize conversions while maintaining compliance.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-06 | 1.0 | Initial PRD creation | John (PM) |

## Requirements

### Functional

- FR1: The system must implement a two-stage cloaking mechanism with server-side initial decision (<50ms) and client-side verification (<300ms total)
- FR2: The system must serve a single-page Next.js application at `domain/article/{slug}` with dynamic routing
- FR3: The system must detect and validate click ID parameters (yclid, gclid) from contextual ad networks
- FR4: The system must respect cloaking decisions from the TDS API (which handles 5-minute window logic)
- FR5: The system must generate and store persistent user IDs in localStorage for blacklist tracking
- FR6: The system must collect safe browser fingerprints using only parameters common to legitimate analytics tools
- FR7: The system must render all content server-side with CSS-based visibility control (no DOM manipulation)
- FR8: The system must send all affiliate link clicks to TDS for tracking and redirection
- FR9: The system must expose a Next.js API endpoint for client-side fingerprint verification (keeping requests on same domain)
- FR10: The system must support data-action attributes for hydrating interactive widgets client-side
- FR11: The system must integrate with external Tracker (TDS) API for cloaking decisions
- FR12: The system must support internationalization (i18n) with next-intl
- FR13: The system must fetch and render dynamic promocode lists from API (#promocode_list widget)
- FR14: The system must monitor and respond to investigation behaviors (dev tools, multiple clicks, hovering)
- FR15: The system must implement a global kill switch for emergency white mode activation

### Non Functional

- NFR1: Page load time must be under 1.5 seconds on 3G mobile connections
- NFR2: Time to first visual must be under 100ms (no flash of uncloaked content)
- NFR3: The system must handle 10,000+ concurrent users without performance degradation
- NFR4: Server-side cloaking decision must complete within 50ms without fingerprinting
- NFR5: Client-side verification must complete within 300ms including fingerprint collection
- NFR6: The system must maintain 99.9% uptime with automated failover
- NFR7: All API timeouts must be configured to fail safely (default to white mode)
- NFR8: The system must use TypeScript with strict type checking enabled
- NFR9: The system must achieve 100% compliance pass rate during manual ad network reviews
- NFR10: The system must track all user interactions via PostHog analytics
- NFR11: The system must report errors and performance metrics to Sentry
- NFR12: Browser fingerprinting must work across all major browsers (Chrome, Safari, Firefox, Edge)
- NFR13: The system must implement comprehensive logging for audit and debugging purposes
- NFR14: All sensitive configuration must be stored in environment variables
- NFR15: The codebase must maintain 80%+ test coverage for critical paths

## User Interface Design Goals

### Overall UX Vision
The interface must deliver an immediate, frictionless experience for high-intent promocode seekers while maintaining the appearance of a legitimate review article. The design should prioritize mobile-first interactions with prominent promocode widgets that feel native to the content, not intrusive overlays. Visual hierarchy must guide users to conversion actions within 15-30 seconds.

### Key Interaction Paradigms
- **One-click code reveal**: Single tap to reveal and auto-copy promocodes with smooth animations
- **Instant visual feedback**: Clear confirmation when codes are copied with animated success states
- **Progressive disclosure**: Show discount amount first, then reveal code on interaction with slide/fade effects
- **Contextual placement**: Promocode widgets integrated naturally within article flow
- **Mobile gesture optimization**: Large touch targets, swipe-friendly navigation
- **Animated transitions**: Smooth reveal animations for code display and copy confirmation

### Core Screens and Views
- Article Landing Page (primary view with review content + promocode widgets)
- Promocode Modal/Dialog (expanded view with code details and CTA)
- Loading State (skeleton screen while fetching article/promocodes)
- Error State (fallback for API failures, maintains compliant appearance)

### Accessibility: WCAG AA
Full WCAG AA compliance to ensure broad accessibility and reduce detection patterns. Includes proper ARIA labels, keyboard navigation, and screen reader support.

### Branding
Clean, modern design that adapts to partner brand colors via CSS variables. Neutral base theme with accent colors pulled from partner logos. Typography should feel editorial/review-like rather than promotional.

### Target Device and Platforms: Web Responsive
- Primary: Mobile web (70% of traffic) - optimized for iOS Safari and Chrome Android
- Secondary: Desktop browsers - full responsive design from 320px to 4K
- Progressive enhancement approach - core functionality works without JavaScript

## Technical Assumptions

### Repository Structure: Monorepo
Single repository containing the Next.js application with all components, utilities, and configurations. This simplifies deployment and maintains consistency across the codebase.

### Service Architecture
**Next.js Frontend with External Cloaking Service**. The application runs as a Next.js frontend that consumes cloaking decisions from an external API service. Server Components make initial API calls to get cloaking state, while API routes proxy client-side fingerprint verification requests. All cloaking logic resides in the external service.

### Testing Requirements
**Unit + Integration Testing Focus**. Unit tests for utility functions and React components. Integration tests for API routes and TDS communication. E2E tests for critical user flows (cloaking behavior, promocode interactions). Manual testing convenience methods for verifying cloaking states.

### Additional Technical Assumptions and Requests
- **Framework**: Next.js 14+ with App Router (Server Components by default)
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for server state, React Context for client state
- **API Communication**: Native fetch with proper timeout handling
- **Build Tools**: Turbo for fast builds, SWC for compilation
- **Deployment Target**: Platform-agnostic Next.js application
- **CDN Strategy**: Static assets served from edge locations
- **Monitoring**: Sentry for errors, PostHog for product analytics
- **Analytics Integration**: Google Tag Manager (GTM) container with:
  - Google Analytics 4 for traffic analysis
  - Yandex Metrica for Russian market insights
  - Custom events for promocode interactions
- **Browser Support**: Modern browsers only (last 2 versions)
- **Package Manager**: pnpm for efficient dependency management
- **Code Quality**: ESLint, Prettier, Husky for pre-commit hooks
- **Environment Management**: .env files with validation via zod

## Epic List

- **Epic 1: Foundation & Core Article System**: Establish Next.js project setup, routing, and basic article rendering with TDS integration
- **Epic 2: Cloaking Implementation & Verification**: Implement two-stage cloaking with CSS control and client-side fingerprint verification
- **Epic 3: Interactive Promocode Widgets**: Build data-action widget system with animated promocode reveals and click tracking
- **Epic 4: Analytics & Monitoring Integration**: Set up GTM, GA4, Yandex Metrica, Sentry, and PostHog with custom event tracking

## Epic 1: Foundation & Core Article System

**Goal**: Establish the foundational Next.js application with proper routing, TypeScript configuration, and basic article rendering capabilities. This epic delivers a working website that can fetch and display article content from the API, setting up all the infrastructure needed for subsequent features while providing immediate value as a simple article platform.

### Story 1.1: Project Setup and Configuration

As a developer,
I want a properly configured Next.js project with TypeScript and essential tooling,
so that the team can build features with type safety and code quality standards.

#### Acceptance Criteria
1: Initialize Next.js 14+ project with App Router and TypeScript in strict mode
2: Configure path aliases (@/components, @/lib, etc.) in tsconfig.json
3: Set up ESLint, Prettier with team-standard configurations
4: Configure Husky with pre-commit hooks for linting and type checking
5: Create .env.example with all required environment variables documented
6: Set up folder structure matching the defined project architecture
7: Configure pnpm as package manager with lockfile
8: Verify build and dev server run without errors

### Story 1.2: Core Layout and Routing Implementation

As a user,
I want to access articles via clean URLs,
so that I can navigate directly to specific content.

#### Acceptance Criteria
1: Implement root layout.tsx with HTML structure and global providers
2: Create dynamic [slug] route under app/article/ directory
3: Implement loading.tsx with skeleton UI for article loading state
4: Create not-found.tsx and error.tsx pages with proper styling
5: Set up global CSS with Tailwind configuration
6: Implement responsive container component for consistent spacing
7: Verify routing works for /article/test-slug pattern
8: Ensure proper meta tags and viewport configuration

### Story 1.3: Article API Integration

As a product owner,
I want the system to fetch article content from our API,
so that content can be managed externally.

#### Acceptance Criteria
1: Create API service layer with proper TypeScript interfaces
2: Implement server-side data fetching in page.tsx Server Component
3: Handle API errors gracefully with fallback content
4: Create Article interface matching API response structure
5: Implement proper error boundaries for failed requests
6: Add request timeout handling (max 3 seconds)
7: Cache article responses appropriately
8: Log API failures to console (Sentry integration comes later)

### Story 1.4: Basic Article Rendering

As a reader,
I want to see well-formatted article content,
so that I can read reviews comfortably on any device.

#### Acceptance Criteria
1: Create Article component that renders HTML content safely
2: Implement responsive typography scale for readability
3: Style standard HTML elements (h1-h6, p, ul, ol, blockquote)
4: Ensure images within articles are responsive
5: Add reading-optimized max-width for text content
6: Implement smooth scrolling for anchor links
7: Verify mobile and desktop rendering
8: Test with sample article containing various HTML elements

## Epic 2: Cloaking Implementation & Verification

**Goal**: Implement the sophisticated two-stage cloaking mechanism that determines when to show promotional content versus review content. This epic integrates with the external cloaking service API, implements CSS-based visibility control, and adds client-side fingerprint verification to protect against manual investigations while maintaining fast page loads.

### Story 2.1: TDS API Integration for Server-Side Decisions

As a system administrator,
I want the application to communicate with our cloaking service API,
so that we can make intelligent decisions about content visibility.

#### Acceptance Criteria
1: Create TDS API client with TypeScript interfaces for requests/responses
2: Implement server-side API call in page.tsx with click ID extraction
3: Pass user-agent, IP (via headers), and timestamp to TDS API
4: Handle TDS API response containing initial mode and verification token
5: Implement proper error handling with white mode as fallback
6: Add configurable API timeout (default 50ms) with environment variable
7: Create mock TDS responses for local development
8: Log all TDS decisions for debugging (without sensitive data)

### Story 2.2: CSS-Based Content Control Implementation

As a compliance officer,
I want promotional content to be controlled via CSS classes only,
so that the HTML structure remains identical for all users.

#### Acceptance Criteria
1: Create CSS module with .is-black-mode class definitions
2: Implement visibility rules that hide promotional elements by default
3: Add .is-black-mode class to body tag based on TDS decision
4: Ensure promotional content exists in DOM but is hidden via display:none
5: Create data-cloak="promotional" attribute for marking promotional sections
6: Verify no layout shift occurs when toggling visibility
7: Test CSS works without JavaScript enabled
8: Implement print styles that always show white mode

### Story 2.3: Client-Side Fingerprinting System

As a security analyst,
I want to collect browser fingerprints safely,
so that we can verify users without triggering privacy concerns.

#### Acceptance Criteria
1: Create fingerprint collection module using only safe parameters
2: Implement screen resolution, viewport, timezone, language detection
3: Generate persistent user ID and store in localStorage
4: Create fingerprint hash function for consistency
5: Ensure fingerprinting works across all major browsers
6: Handle missing APIs gracefully with fallback values
7: Complete fingerprint collection within 150ms
8: Match fingerprint parameters with mainstream analytics tools

### Story 2.4: Client Verification API Route

As a developer,
I want a Next.js API endpoint for client verification,
so that fingerprint data stays on the same domain.

#### Acceptance Criteria
1: Create /api/verify-cloak POST endpoint
2: Accept verification token, fingerprint, and user ID in request
3: Forward data to TDS API for verification
4: Return valid/invalid/blacklisted status
5: Implement proper error handling and timeouts
6: Add rate limiting to prevent abuse
7: Include CORS headers for same-origin only
8: Log verification attempts for monitoring

### Story 2.5: Client-Side Verification Flow

As a user,
I want the page to load instantly,
so that I can access content without delays.

#### Acceptance Criteria
1: Implement verification script that runs after page load
2: Only trigger verification if initial mode is black
3: Remove .is-black-mode class if verification fails
4: Add blacklisted users to local storage blocklist
5: Ensure verification doesn't block page interactivity
6: Show no visual changes during verification process
7: Complete entire verification within 300ms total
8: Handle network failures gracefully (maintain current state)

### Story 2.6: Investigation Behavior Detection

As a security analyst,
I want to detect suspicious investigation patterns,
so that we can revoke access dynamically.

#### Acceptance Criteria
1: Monitor for developer tools opening (with multiple detection methods)
2: Track rapid multiple clicks on promotional elements
3: Detect right-click attempts on promotional content
4: Monitor extended hovering over links (>3 seconds)
5: Immediately remove .is-black-mode class when detected
6: Add detected users to permanent blacklist
7: Send investigation event to TDS API
8: Test detection works across different browsers

## Epic 3: Interactive Promocode Widgets

**Goal**: Build the revenue-generating interactive components that display promotional codes and drive conversions. This epic implements the data-action widget system that hydrates static HTML into interactive React components, creates engaging promocode reveals with animations, and ensures all user interactions are tracked for optimization.

### Story 3.1: Data-Action Widget Framework

As a developer,
I want a flexible system for defining interactive widgets in HTML,
so that content editors can place promotional elements anywhere.

#### Acceptance Criteria
1: Create widget hydration system that finds all [data-action] elements
2: Implement widget registry for mapping action types to React components
3: Support data-param-* attributes for widget configuration
4: Only hydrate widgets when .is-black-mode class is present
5: Ensure widgets render as static HTML for white mode users
6: Create TypeScript interfaces for widget props and configuration
7: Implement error boundaries around each widget
8: Test hydration with multiple widgets on same page

### Story 3.2: Promocode Display Widget

As a user,
I want to see available promocodes clearly,
so that I can quickly find and use discount codes.

#### Acceptance Criteria
1: Create PromoCodeWidget component with discount percentage display
2: Implement "Click to Reveal" initial state showing discount amount
3: Add smooth slide/fade animation on code reveal
4: Display promocode in easy-to-read monospace font
5: Include expiration date if provided by API
6: Support multiple visual variants (inline, card, banner)
7: Ensure widget is mobile-touch optimized
8: Match design to feel native within article content

### Story 3.3: One-Click Copy Functionality

As a user,
I want to copy promocodes with a single click,
so that I can easily use them on the partner site.

#### Acceptance Criteria
1: Implement clipboard copy on promocode click/tap
2: Show animated success state after copy (checkmark, "Copied!")
3: Provide haptic feedback on mobile devices if available
4: Fall back to manual selection if clipboard API fails
5: Change button text from "Copy Code" to "Copied!" temporarily
6: Reset copy state after 3 seconds
7: Track successful copy events for analytics
8: Test across all major browsers and mobile devices

### Story 3.4: Promocode API Integration

As a product owner,
I want promocodes to be dynamically loaded,
so that we can update offers without code changes.

#### Acceptance Criteria
1: Create API service for fetching promocodes by partner/article
2: Implement #promocode_list widget that fetches from API
3: Cache promocode data appropriately (5 minute TTL)
4: Handle API failures gracefully with fallback content
5: Support A/B testing different promocode offers
6: Include offer metadata (discount %, expiration, terms)
7: Implement loading skeleton while fetching
8: Pass click IDs to API for personalized offers

### Story 3.5: Click Tracking and Redirection

As a marketing analyst,
I want all promocode interactions tracked,
so that we can optimize conversion rates.

#### Acceptance Criteria
1: Track widget impressions when scrolled into view
2: Track "Click to Reveal" interactions
3: Track successful code copies with timestamp
4: Track "Go to Site" CTA clicks
5: Send all events to TDS API for attribution
6: Include session and user IDs in tracking
7: Implement redirect through TDS for final attribution
8: Ensure tracking doesn't slow down user interactions

### Story 3.6: Animated Promocode Modal

As a user,
I want an expanded view of promocode details,
so that I can see all offer information clearly.

#### Acceptance Criteria
1: Create modal component using Radix UI Dialog
2: Trigger modal on "View Details" link click
3: Display large promocode with copy button
4: Show offer terms and conditions
5: Include prominent "Use Code" CTA button
6: Implement smooth open/close animations
7: Ensure modal is fully accessible (keyboard nav, focus trap)
8: Track modal open/close events for analytics

## Epic 4: Analytics & Monitoring Integration

**Goal**: Implement comprehensive tracking and monitoring to measure success, optimize conversions, and maintain system health. This epic sets up Google Tag Manager as the central hub for analytics, integrates both Google Analytics 4 and Yandex Metrica for market-specific insights, and adds error tracking via Sentry and product analytics through PostHog.

### Story 4.1: Google Tag Manager Implementation

As a marketing analyst,
I want GTM installed as our tag management system,
so that we can manage all tracking pixels without code changes.

#### Acceptance Criteria
1: Add GTM container snippet to app layout (head and body)
2: Configure GTM container ID via environment variable
3: Implement dataLayer initialization with page metadata
4: Create custom GTM events for promocode interactions
5: Set up Preview mode for testing GTM changes
6: Document all custom dataLayer variables
7: Ensure GTM loads asynchronously without blocking
8: Verify GTM works with Content Security Policy

### Story 4.2: Google Analytics 4 Configuration

As a business analyst,
I want GA4 tracking implemented,
so that we can analyze traffic sources and user behavior.

#### Acceptance Criteria
1: Configure GA4 tag in GTM with measurement ID
2: Set up Enhanced Ecommerce events for conversions
3: Track custom dimensions for cloak state and user type
4: Implement scroll tracking for content engagement
5: Set up conversion goals for promocode copies and clicks
6: Configure audience definitions for remarketing
7: Test cross-domain tracking for partner redirects
8: Verify GDPR compliance mode configuration

### Story 4.3: Yandex Metrica Integration

As a regional marketing manager,
I want Yandex Metrica installed,
so that we can optimize for Russian market traffic.

#### Acceptance Criteria
1: Add Yandex Metrica tag via GTM
2: Configure goal tracking for Russian user conversions
3: Set up heatmap tracking for mobile interactions
4: Implement webvisor session recording (white mode only)
5: Track Yandex-specific UTM parameters
6: Configure counter settings for accurate bounce rate
7: Set up e-commerce tracking for affiliate conversions
8: Test Yandex.Direct auto-goals integration

### Story 4.4: PostHog Product Analytics

As a product manager,
I want detailed interaction analytics,
so that we can optimize the user experience.

#### Acceptance Criteria
1: Initialize PostHog with project API key
2: Identify users with persistent anonymous IDs
3: Track feature flags for A/B testing widgets
4: Implement funnel tracking from land to conversion
5: Set up cohort analysis for user segments
6: Track custom events for all widget interactions
7: Configure session recording (white mode only)
8: Implement feature flag SDK for experimentation

### Story 4.5: Sentry Error Monitoring

As a developer,
I want comprehensive error tracking,
so that we can maintain system reliability.

#### Acceptance Criteria
1: Install and configure Sentry for Next.js
2: Set up source maps for meaningful stack traces
3: Configure error boundaries with Sentry reporting
4: Implement performance monitoring for Core Web Vitals
5: Set up alerts for error rate spikes
6: Add custom context (cloak state, user type)
7: Configure sampling rates for cost control
8: Test error reporting in production environment

### Story 4.6: Custom Event Architecture

As a data analyst,
I want consistent event tracking across all platforms,
so that we can build unified dashboards.

#### Acceptance Criteria
1: Define standard event naming convention
2: Create TypeScript types for all custom events
3: Implement event abstraction layer for all analytics
4: Document event schema with required properties
5: Create debug mode for event validation
6: Set up real-time event monitoring dashboard
7: Implement event batching for performance
8: Test events fire correctly across all analytics platforms

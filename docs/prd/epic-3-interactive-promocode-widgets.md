# Epic 3: Interactive Promocode Widgets

**Goal**: Build the revenue-generating interactive components that display promotional codes and drive conversions. This epic implements the data-action widget system that hydrates static HTML into interactive React components, creates engaging promocode reveals with animations, and ensures all user interactions are tracked for optimization.

## Story 3.1: Data-Action Widget Framework

As a developer,
I want a flexible system for defining interactive widgets in HTML,
so that content editors can place promotional elements anywhere.

### Acceptance Criteria
1: Create widget hydration system that finds all [data-action] elements
2: Implement widget registry for mapping action types to React components
3: Support data-param-* attributes for widget configuration
4: Only hydrate widgets when .is-black-mode class is present
5: Ensure widgets render as static HTML for white mode users
6: Create TypeScript interfaces for widget props and configuration
7: Implement error boundaries around each widget
8: Test hydration with multiple widgets on same page

## Story 3.2: Promocode Display Widget

As a user,
I want to see available promocodes clearly,
so that I can quickly find and use discount codes.

### Acceptance Criteria
1: Create PromoCodeWidget component with discount percentage display
2: Implement "Click to Reveal" initial state showing discount amount
3: Add smooth slide/fade animation on code reveal
4: Display promocode in easy-to-read monospace font
5: Include expiration date if provided by API
6: Support multiple visual variants (inline, card, banner)
7: Ensure widget is mobile-touch optimized
8: Match design to feel native within article content

## Story 3.3: One-Click Copy Functionality

As a user,
I want to copy promocodes with a single click,
so that I can easily use them on the partner site.

### Acceptance Criteria
1: Implement clipboard copy on promocode click/tap
2: Show animated success state after copy (checkmark, "Copied!")
3: Provide haptic feedback on mobile devices if available
4: Fall back to manual selection if clipboard API fails
5: Change button text from "Copy Code" to "Copied!" temporarily
6: Reset copy state after 3 seconds
7: Track successful copy events for analytics
8: Test across all major browsers and mobile devices

## Story 3.4: Promocode API Integration

As a product owner,
I want promocodes to be dynamically loaded,
so that we can update offers without code changes.

### Acceptance Criteria
1: Create API service for fetching promocodes by partner/article
2: Implement #promocode_list widget that fetches from API
3: Cache promocode data appropriately (5 minute TTL)
4: Handle API failures gracefully with fallback content
5: Support A/B testing different promocode offers
6: Include offer metadata (discount %, expiration, terms)
7: Implement loading skeleton while fetching
8: Pass click IDs to API for personalized offers

## Story 3.5: Click Tracking and Redirection

As a marketing analyst,
I want all promocode interactions tracked,
so that we can optimize conversion rates.

### Acceptance Criteria
1: Track widget impressions when scrolled into view
2: Track "Click to Reveal" interactions
3: Track successful code copies with timestamp
4: Track "Go to Site" CTA clicks
5: Send all events to TDS API for attribution
6: Include session and user IDs in tracking
7: Implement redirect through TDS for final attribution
8: Ensure tracking doesn't slow down user interactions

## Story 3.6: Animated Promocode Modal

As a user,
I want an expanded view of promocode details,
so that I can see all offer information clearly.

### Acceptance Criteria
1: Create modal component using Radix UI Dialog
2: Trigger modal on "View Details" link click
3: Display large promocode with copy button
4: Show offer terms and conditions
5: Include prominent "Use Code" CTA button
6: Implement smooth open/close animations
7: Ensure modal is fully accessible (keyboard nav, focus trap)
8: Track modal open/close events for analytics

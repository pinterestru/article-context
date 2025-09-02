# Requirements

## Functional

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

## Non Functional

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

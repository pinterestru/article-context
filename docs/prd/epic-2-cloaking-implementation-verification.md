# Epic 2: Cloaking Implementation & Verification

**Goal**: Implement the sophisticated two-stage cloaking mechanism that determines when to show promotional content versus review content. This epic integrates with the external cloaking service API, implements CSS-based visibility control, and adds client-side fingerprint verification to protect against manual investigations while maintaining fast page loads.

## Story 2.1: TDS API Integration for Server-Side Decisions

As a system administrator,
I want the application to communicate with our cloaking service API,
so that we can make intelligent decisions about content visibility.

### Acceptance Criteria
1: Create TDS API client with TypeScript interfaces for requests/responses
2: Implement server-side API call in page.tsx with click ID extraction
3: Pass user-agent, IP (via headers), and timestamp to TDS API
4: Handle TDS API response containing initial mode and verification token
5: Implement proper error handling with white mode as fallback
6: Add configurable API timeout (default 50ms) with environment variable
7: Create mock TDS responses for local development
8: Log all TDS decisions for debugging (without sensitive data)

## Story 2.2: CSS-Based Content Control Implementation

As a compliance officer,
I want promotional content to be controlled via CSS classes only,
so that the HTML structure remains identical for all users.

### Acceptance Criteria
1: Create CSS module with .is-black-mode class definitions
2: Implement visibility rules that hide promotional elements by default
3: Add .is-black-mode class to body tag based on TDS decision
4: Ensure promotional content exists in DOM but is hidden via display:none
5: Create data-cloak="promotional" attribute for marking promotional sections
6: Verify no layout shift occurs when toggling visibility
7: Test CSS works without JavaScript enabled
8: Implement print styles that always show white mode

## Story 2.3: Client-Side Fingerprinting System

As a security analyst,
I want to collect browser fingerprints safely,
so that we can verify users without triggering privacy concerns.

### Acceptance Criteria
1: Create fingerprint collection module using only safe parameters
2: Implement screen resolution, viewport, timezone, language detection
3: Generate persistent user ID and store in localStorage
4: Create fingerprint hash function for consistency
5: Ensure fingerprinting works across all major browsers
6: Handle missing APIs gracefully with fallback values
7: Complete fingerprint collection within 150ms
8: Match fingerprint parameters with mainstream analytics tools

## Story 2.4: Client Verification API Route

As a developer,
I want a Next.js API endpoint for client verification,
so that fingerprint data stays on the same domain.

### Acceptance Criteria
1: Create /api/verify-cloak POST endpoint
2: Accept verification token, fingerprint, and user ID in request
3: Forward data to TDS API for verification
4: Return valid/invalid/blacklisted status
5: Implement proper error handling and timeouts
6: Add rate limiting to prevent abuse
7: Include CORS headers for same-origin only
8: Log verification attempts for monitoring

## Story 2.5: Client-Side Verification Flow

As a user,
I want the page to load instantly,
so that I can access content without delays.

### Acceptance Criteria
1: Implement verification script that runs after page load
2: Only trigger verification if initial mode is black
3: Remove .is-black-mode class if verification fails
4: Add blacklisted users to local storage blocklist
5: Ensure verification doesn't block page interactivity
6: Show no visual changes during verification process
7: Complete entire verification within 300ms total
8: Handle network failures gracefully (maintain current state)

## Story 2.6: Investigation Behavior Detection

As a security analyst,
I want to detect suspicious investigation patterns,
so that we can revoke access dynamically.

### Acceptance Criteria
1: Monitor for developer tools opening (with multiple detection methods)
2: Track rapid multiple clicks on promotional elements
3: Detect right-click attempts on promotional content
4: Monitor extended hovering over links (>3 seconds)
5: Immediately remove .is-black-mode class when detected
6: Add detected users to permanent blacklist
7: Send investigation event to TDS API
8: Test detection works across different browsers

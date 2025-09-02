# **Project Brief: Next.js Cloaked Article Landing Page**

## **Business Purpose & Strategic Goals**

Our core business objective is to maximize affiliate marketing revenue by capturing high-value, lead-generating traffic from contextual ad networks, specifically Yandex Direct and Google Ads context ads.

We have identified a significant opportunity in targeting "hot," high-intent user queries. These often include an advertiser's brand name, such as **"promocodes umschool,"** for partners like **umschool.net**. This traffic has a proven, high conversion rate for generating leads.

The primary challenge we face is that many advertisers, including this partner, **explicitly restrict contextual advertising on their own branded keywords.** This policy prevents us from directly bidding on and capturing this valuable traffic through standard advertising methods, creating a major roadblock to revenue.

To navigate this landscape, our strategy is to deploy a specialized landing page system with a sophisticated cloaking mechanism. This system is designed to achieve two distinct but parallel goals:

1.  **Ensure Ad Network Compliance:** For Yandex Direct's crawlers, moderators, and any other inspection traffic, our server will present the page in its "White Mode" state. This ensures they see a compliant review article as the visible content. The promotional ("Black") content will still be present in the HTML DOM but hidden via CSS, guaranteeing full transparency of the page's capabilities while maintaining a compliant-first appearance.

2.  **Maximize Conversion of Target Traffic:** For the actual end-user who clicks our ad, the system will deliver the promotional "Black Page." This version is engineered for maximum conversion, featuring interactive promo code widgets and direct calls-to-action designed to convert the user's high intent into a lead for our partner.

In essence, this project is a precision tool that allows us to operate within the constraints of our partners while capitalizing on high-performance marketing opportunities on Yandex Direct that would otherwise be inaccessible.

## **1. Project Overview**

The objective is to develop a single-page web application using Next.js (`domain/article/{slug}`) that implements a sophisticated, **two-stage cloaking mechanism**. The system is designed to protect affiliate links from manual investigation by advertiser employees who are alerted through monitoring services like admon.ai. It selectively shows promotional content to legitimate users while hiding it from investigators and bots based on advanced behavioral and timing criteria.

## **2. Core Cloaking Strategy: Two-Stage Server-Client Approach with CSS State**

The cloaking system employs a sophisticated two-stage approach that combines immediate server-side decisions with enhanced client-side verification, all while maintaining the safety of CSS-based content control.

### **2.1. Two-Stage Cloaking Architecture**

**Stage 1: Server-Side Initial Decision (0-50ms)**
*   When a request hits the Next.js server, it makes an immediate cloaking decision based on:
    - Presence and validity of click ID parameters (`yclid`, `gclid`)
    - Basic HTTP headers (User-Agent, Accept-Language)
    - Time window validation (within 5 minutes of first visit)
    - IP-based signals (datacenter detection, geography)
*   This decision happens WITHOUT waiting for browser fingerprinting, ensuring the fastest possible initial page load.
*   The server renders the complete HTML with the initial cloaking state applied via CSS classes.

**Stage 2: Client-Side Fingerprint Verification (50-300ms after load)**
*   After the page loads, JavaScript collects a safe browser fingerprint using only parameters that legitimate analytics tools collect.
*   This fingerprint is sent to the server for verification against the initial decision.
*   If suspicious patterns are detected (investigation behavior, fingerprint reuse), the client can immediately revoke black mode access.
*   This provides a second layer of protection against sophisticated manual investigators.

### **2.2. Critical 5-Minute Window Protection**

The system implements a strict 5-minute time window as the primary defense mechanism:

**Why 5 Minutes?**
- Real users searching for promocodes act quickly - typically clicking within 60 seconds
- Advertiser investigators arrive hours or days later after receiving admon.ai alerts
- This time gap is our primary protection layer

**Implementation:**
- First visit with valid click ID: Show BLACK mode (affiliate content visible)
- After 5 minutes from first visit: Always show WHITE mode
- Any repeat visit: Always show WHITE mode (single-use fingerprints)
- No click ID parameter: Always show WHITE mode

This simple but effective strategy catches 99% of manual investigations while allowing legitimate users full access.

### **2.3. Enhanced Server-Side Logic**

When a request hits the Next.js server, it will:
1.  Read the user's request, including query parameters (like `yaclid`) and headers (like `User-Agent`).
2.  Make a FAST server-to-server API call to our Tracker (TDS) with LIMITED data (no fingerprint yet).
3.  Receive an initial "show_white" or "show_black" decision based on server-side signals.
4.  Generate a verification token for the client-side validation phase.
5.  Fetch all necessary content for the page, including any API-driven promocode lists (`#promocode_list` widget).
6.  Render the **full HTML document**, containing all promotional sections and all action elements with default hidden state.
7.  **Crucially:** Based on the Tracker's initial decision, it will inject a class into the `<body>` tag AND include the verification token.
    *   If "show_white", the output will be a standard `<body>` (no class needed - safe default).
    *   If "show_black", the output will be `<body class="is-black-mode" data-verify-token="...">`.

### **2.3. Client-Side Verification Layer**

After the initial page load:
*   JavaScript collects a browser fingerprint using safe parameters (screen size, timezone, language, etc.).
*   A persistent user ID is generated and stored in localStorage for blacklist tracking.
*   This fingerprint and user ID are sent with the verification token to validate the initial decision.
*   The verification can:
    - Confirm the black mode decision (no change needed)
    - Revoke black mode if suspicious patterns detected (removes `is-black-mode` class)
    - Track investigation behaviors (dev tools, rapid clicks, hovering patterns)
    - Add suspicious users to permanent blacklist

### **2.4. Affiliate Link Protection Strategy**

**Critical Goal**: Hide network IDs from investigators who manually check promocode destinations.

**Server-Side Proxy Implementation:**
- All affiliate links route through our server (`/go/{token}`)
- Actual affiliate URLs with network IDs are NEVER exposed in HTML
- Each link token is single-use and expires after 5 minutes
- After use, tokens redirect to generic partner homepage

**Dynamic Link Generation:**
```javascript
// Instead of: <a href="https://partner.com/aff?id=NETWORK123">
// We use: <a href="/go/abc123xyz">
```

**Benefits:**
- Investigators cannot trace our affiliate network relationships
- Click tracking remains accurate
- Links appear as internal navigation to inspectors
- Automatic expiration prevents link harvesting

### **2.5. Resulting Behavior**

*   **For Yandex Bots:** They receive a complete HTML document where promotional content is hidden by default CSS. No special class is present, making it less detectable. The verification JavaScript appears as standard analytics code.
*   **For Legitimate Users (First 5 minutes):** They receive the HTML with the `is-black-mode` class immediately, see promocodes, and can quickly complete their purchase intent.
*   **For Late Visitors (After 5 minutes):** They receive white mode regardless of other factors - this catches nearly all investigators.
*   **For Investigators:** Even if they somehow arrive within 5 minutes, their investigation patterns (dev tools, multiple clicks, fingerprint reuse) trigger immediate revocation.

### **2.6. Persistent Blacklisting System**

**Purpose**: Permanently block investigators who attempt suspicious access

**Implementation**:
- Each user gets a persistent ID stored in localStorage
- This ID survives browser sessions and incognito mode changes
- Blacklisted IDs are blocked at both client and server level

**Automatic Blacklist Triggers**:
1. **Invalid Access Attempts**: Valid yclid but outside 5-minute window
2. **Fingerprint Mismatches**: Different fingerprint using same yclid
3. **Investigation Behaviors**: Dev tools, rapid clicks, source viewing
4. **Repeat Visits**: Any attempt to view black content twice

**Benefits**:
- Investigators are permanently blocked after first detection
- Blocks persist across different campaigns and landing pages
- Reduces risk of repeated investigation attempts
- Creates a growing database of known investigator IDs

### **2.7. Primary Threat Model**

**Main Threat**: Human advertiser employees conducting manual investigations
- Triggered by admon.ai monitoring alerts for restricted keyword bidding
- Arrive hours/days after the initial ad detection
- Systematically click promocodes to find affiliate network IDs
- Use developer tools to inspect page structure
- May visit multiple times to verify findings

**Why This Strategy Works**:
- Investigators cannot arrive within the 5-minute window
- Single-use fingerprints prevent repeat inspections
- Server-proxy hides all affiliate network relationships
- Behavioral detection catches any sophisticated attempts
- Permanent blacklisting prevents future investigations

### **2.8. Major Advantages of Two-Stage Approach**

This enhanced approach maintains all original advantages while adding:
*   **Faster Initial Page Load:** No waiting for fingerprint collection before rendering (50ms vs 300ms+).
*   **Progressive Enhancement:** Works perfectly without JavaScript (server decision stands).
*   **Double-Layer Protection:** Server catches obvious threats; client catches sophisticated investigators.
*   **Behavioral Detection:** Can identify and respond to investigation patterns in real-time.
*   **No Flash of Uncloaked Content (FOUC):** The user never sees content transitions.
*   **Maximum Safety:** We are not serving different HTML structures. The DOM tree is identical.
*   **Performance:** Initial visual state achieved faster than single-stage approach.
*   **Fail-Safe by Design:** By defaulting to hidden promotional content, any failure results in a compliant page.

## **3. Action Elements & Interactivity**

We will still use the stealthy `data-action` attribute system to define interactive widgets.

*   **Convention:** Use `<span data-action="...">` or `<div data-action="...">`.
*   **Parameters:** Use `data-param-*` attributes for configuration.
*   **Server's Role:** The server renders these as plain HTML tags.
*   **Client's Role:** After the page loads, a client-side script finds these `[data-action]` elements and "hydrates" them into interactive React components (e.g., adding `onClick` listeners for buttons). This only happens if the page is in "Black Mode."

## **4. Application Flow (Two-Stage Implementation)**

### **Stage 1: Server-Side Initial Decision (0-50ms)**

1.  A user request for `domain/article/{slug}?yaclid=...` hits the Next.js server.
2.  **On the Server (Fast Path):**
    a. The `page.tsx` Server Component receives the request.
    b. It makes a FAST API call to the Tracker (TDS) with only server-available data:
       - Click ID (`yclid`/`gclid`)
       - User-Agent header
       - IP address
       - Timestamp
    c. Receives initial decision (`'white'` or `'black'`) and a verification token.
    d. Fetches the article's base HTML.
    e. If any `#promocode_list` widgets are present, fetches promocode data server-side.
    f. Renders the final page with initial cloaking state.
3.  **In `layout.tsx` (Server Component):**
    ```jsx
    export default function RootLayout({ children, params, cloakData }) {
      const { initialMode, verifyToken } = cloakData;
      return (
        <html lang={params.locale}>
          <body 
            className={initialMode === 'black' ? 'is-black-mode' : ''}
            data-verify-token={initialMode === 'black' ? verifyToken : undefined}
          >
            {children}
            <Script id="cloak-verify" strategy="afterInteractive">
              {`window.__CLOAK_VERIFY__ = ${JSON.stringify({ initialMode, verifyToken })};`}
            </Script>
          </body>
        </html>
      );
    }
    ```
4.  The complete HTML is sent to the browser with the initial cloaking decision already applied.

### **Stage 2: Client-Side Verification (50-300ms after load)**

5.  **After Page Load (Async):**
    a. Client-side script detects if verification is needed (black mode + token present).
    b. Generates or retrieves persistent user ID:
       ```javascript
       const getUserId = () => {
         let userId = localStorage.getItem('uid');
         if (!userId) {
           userId = Date.now().toString(36) + Math.random().toString(36).substr(2);
           localStorage.setItem('uid', userId);
         }
         return userId;
       };
       ```
    c. Collects safe browser fingerprint:
       ```javascript
       const fingerprint = {
         screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
         viewport: `${window.innerWidth}x${window.innerHeight}`,
         timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
         language: navigator.language,
         platform: navigator.platform,
         // ... other safe parameters
       };
       ```
    d. Sends verification request to `/api/verify-cloak`:
       ```javascript
       const response = await fetch('/api/verify-cloak', {
         method: 'POST',
         headers: {
           'X-User-ID': getUserId()
         },
         body: JSON.stringify({
           token: window.__CLOAK_VERIFY__.verifyToken,
           fingerprint: await generateFingerprint(),
           timestamp: Date.now()
         })
       });
       ```
    e. Processes verification response:
       - If `valid`: Maintains black mode, hydrates interactive elements
       - If `invalid`: Removes `is-black-mode` class immediately
       - If `blacklisted`: Removes class and marks locally as blacklisted
       - If `error`: Fails safely (maintains current state)

6.  **Behavioral Monitoring (Continuous):**
    - Monitors for investigation patterns:
      - Developer tools opening
      - Multiple promocode clicks
      - Right-click attempts
      - Extended hovering on links
    - Can revoke black mode at any time if suspicious behavior detected

### **Performance Timeline**

```
0ms     → Request received
10ms    → Server-side cloak decision made
30ms    → HTML generation complete
50ms    → First byte sent to client
100ms   → Page fully loaded (visual complete)
150ms   → Fingerprint collected
200ms   → Verification request sent
250ms   → Verification response received
300ms   → Final state confirmed
```

This two-stage approach ensures the fastest possible initial page load while maintaining robust protection against sophisticated investigation attempts.

## **5. Technical Specification**

This section outlines the definitive technical stack and project structure.

### **5.1. Libraries & Dependencies**

The project will use the following libraries. Libraries from the reference project that are related to authentication (`@ory/*`), complex forms (`react-hook-form`), or data tables (`@tanstack/react-table`) have been excluded to keep the application minimal and focused.

**Core Dependencies (`dependencies`)**

| Library | Reason for Use |
| :--- | :--- |
| `next` | Core framework for the application. |
| `react`, `react-dom` | Required libraries for building with Next.js. |
| `next-intl` | **Required:** For handling internationalization (i18n). |
| `@sentry/nextjs` | For production error tracking and performance monitoring. |
| `@tanstack/react-query` | For fetching and caching data from the Tracker (TDS) API. |
| `posthog-js` | For product analytics to track user interactions (e.g., promo code button clicks). |
| `@radix-ui/react-dialog` | For creating the promo code dialog window. |
| `@radix-ui/react-slot` | Core dependency for shadcn/ui components. |
| `lucide-react` | For the icon set (e.g., "copy" icon). |
| `class-variance-authority` | Core utility for UI component variants. |
| `clsx`, `tailwind-merge` | Utilities for managing and merging Tailwind CSS classes. |

**Development Dependencies (`devDependencies`)**

| Library | Reason for Use |
| :--- | :--- |
| `typescript`, `@types/*` | For full type safety. |
| `tailwindcss`, `postcss`, `autoprefixer` | For styling with Tailwind CSS. |
| `eslint`, `prettier` | For code quality and consistent formatting. |
| `husky`, `lint-staged` | For automating pre-commit quality checks. |
| `vitest`, `@testing-library/*` | For unit and component testing. |
| `msw` | To mock API calls to the Tracker during testing. |

### **5.2. Project Structure**

The following structure is adapted from the provided specification to fit this project's requirements. It is significantly simplified, removing all components related to user accounts, dashboards, and multi-feature modules.

```
cloaked-article-app/
├── .github/                      # CI/CD workflows.
├── .vscode/                      # Shared VS Code settings.
├── .husky/                       # Git hooks for pre-commit checks.
├── .env.example                  # Template for environment variables (e.g., Tracker API URL).
├── .nvmrc                        # Specifies the project's Node.js version.
├── next.config.mjs               # Next.js core configuration.
├── package.json                  # Project dependencies and scripts.
├── playwright.config.ts          # E2E test configuration (for testing the cloaking flow).
├── postcss.config.mjs            # PostCSS configuration.
├── prettier.config.js            # Code formatting rules.
├── tailwind.config.ts            # Tailwind CSS theme and plugin configuration.
├── tsconfig.json                 # TypeScript configuration with path aliases.
├── vitest.config.ts              # Unit & component test configuration.
├── instrumentation.ts            # Initializes Sentry and PostHog.
│
├── public/                       # Static assets (fonts, images, favicons).
│
└── src/                          # Main application source code.
    ├── app/                      # ROUTING LAYER (Next.js App Router).
    │   ├── layout.tsx            # Root layout: Wraps the app, injects global providers.
    │   ├── global-error.tsx      # Handles uncaught server errors.
    │   ├── not-found.tsx         # Custom 404 page.
    │   └── article/              # Route group for articles.
    │       └── [slug]/           # Dynamic route for each article.
    │           ├── page.tsx      # **CORE LOGIC**: Fetches data from TDS, renders the article.
    │           └── loading.tsx   # Loading UI (skeleton) while fetching data.
    │
    ├── components/               # SHARED, REUSABLE UI components.
    │   ├── layout/               # Reusable layout patterns (e.g., Section, Container).
    │   ├── ui/                   # Unmodified shadcn/ui primitives.
    │   └── shared/               # Custom, generic design system components (e.g., a styled PromoCodeDialog).
    │
    ├── config/                   # Global, non-secret app configuration.
    │   └── index.ts              # App-wide constants (e.g., APP_NAME).
    │
    ├── providers/                # Client-side React Context providers.
    │   ├── query-provider.tsx    # TanStack Query client setup.
    │   └── next-intl-provider.tsx # Provider for i18n context.
    │
    ├── lib/                      # Core application logic, utilities, and helpers.
    │   ├── analytics/            # PostHog/Sentry configuration and tracking helpers.
    │   └── utils/                # Generic helpers (e.g., `cn` utility, formatters).
    │
    ├── messages/                 # i18n translation files (`en.json`, `ru.json`, etc.).
    │
    ├── styles/                   # Global CSS files or variables.
    │   └── globals.css           # Global application styles.
    │
    ├── types/                    # Global TypeScript types (if any).
    │
    └── middleware.ts             # Handles i18n/locale detection for `next-intl`.
```

## **6. Target Users**

### **Primary User Segment: Promo Code Seekers (100%)**

**User Profile:**
- **Source:** Exclusively from contextual ads (Yandex Direct, Google Ads)
- **Search Intent:** "[brand] promocodes", "[brand] скидки", "[brand] промокод"
- **Mindset:** Immediate purchase intent, actively seeking discount codes
- **Device Split:** 70% mobile, 30% desktop
- **Session Behavior:** Quick decision makers, average 15-30 second evaluation

**User Journey:**
1. **Search:** User searches "promocodes umschool" on Yandex/Google
2. **Ad Click:** Clicks our contextual ad promising discount codes
3. **Landing:** Arrives at article page (e.g., "UmSchool Review 2024")
4. **Discovery:** Immediately sees promocode widget overlaid on review content
5. **Action:** Clicks "Get Code" → Code copied → Redirected to partner
6. **Conversion:** Completes registration with applied discount

**Key User Expectations:**
- Working, verified promo codes (not expired)
- Clear discount percentage/amount visible
- One-click code copy functionality
- Immediate redirect to offer page

### **Content Strategy Clarification**

**Base Layer (Always Present):**
- Comprehensive review article (education platform reviews, course comparisons, etc.)
- SEO-optimized white content that passes any manual review
- Legitimate value-add content about the partner's services

**Overlay Layer (Conditionally Shown):**
- Promocode widget positioned prominently above the fold
- Interactive elements that capture the promo-seeking intent
- Direct CTAs that fulfill the user's immediate need

## **7. Goals & Success Metrics**

### **Business Objectives**
- **Primary:** Generate €50,000+ monthly affiliate revenue within 90 days
- **Secondary:** Maintain 100% ad network compliance rate
- **Tertiary:** Build reusable cloaking infrastructure for future campaigns

### **Key Performance Indicators (KPIs)**

**Conversion Metrics:**
- Click-to-lead conversion rate: Target 15-20% (industry avg: 5-8%)
- Lead-to-sale conversion: Target 25-30%
- Average revenue per click: €2.50-3.50

**Technical Performance:**
- Page load time: <1.5s (critical for mobile users)
- Stage 1 cloaking decision: <50ms server-side (without fingerprint)
- Stage 2 verification complete: <300ms total (includes fingerprint)
- Time to first visual: <100ms (3x faster than single-stage)
- Zero flash of uncloaked content (FOUC) incidents

**Compliance Metrics:**
- Ad account suspension rate: 0%
- Manual review pass rate: 100%
- Bot detection accuracy: 99%+

### **Monitoring & Analytics**
- Real-time tracking via PostHog for user interactions
- Sentry for error tracking and performance monitoring
- Custom TDS dashboard for cloaking effectiveness

## **8. Risks & Mitigation Strategies**

### **Technical Risks**

**Risk 1: Ad Network Detection Evolution**
- **Impact:** High - Could lead to account suspension
- **Mitigation:** 
  - Regular TDS algorithm updates based on bot patterns
  - A/B testing detection accuracy weekly
  - Maintain "canary" test campaigns for early warning

**Risk 2: Page Load Performance**
- **Impact:** Medium - Affects conversion rates
- **Mitigation:**
  - Two-stage approach eliminates fingerprint delays on initial load
  - Server-side rendering for instant visual state
  - CDN deployment for global performance
  - Async verification doesn't block page interactivity
  - Optimize widget loading priority

### **Business Risks**

**Risk 3: Partner Relationship Damage**
- **Impact:** Critical - Loss of affiliate partnership
- **Mitigation:**
  - Clear documentation that we're driving additional sales
  - Compliance with all affiliate terms except keyword bidding
  - Regular performance reporting to partners

**Risk 4: Revenue Concentration**
- **Impact:** High - Over-reliance on single traffic source
- **Mitigation:**
  - Test across multiple ad networks (Yandex, Google)
  - Develop portfolio of partner campaigns
  - Build reusable infrastructure for quick pivots

### **Compliance Risks**

**Risk 5: Manual Review Failures**
- **Impact:** High - Campaign rejection
- **Mitigation:**
  - High-quality base content that provides genuine value
  - Professional article writing following platform guidelines
  - Consistent review article format across campaigns
  - Content designed to pass both automated (admon.ai) and manual reviews

**Risk 6: Sudden Detection Pattern Changes**
- **Impact:** Critical - Mass account suspensions
- **Mitigation - Compliance Insurance System:**
  - **White Mode Override**: Emergency switch to force all traffic to compliant mode
  - **Global Kill Switch**: Instantly disable all promotional elements across all campaigns via single API endpoint
  - **Client-Side Revocation**: Can instantly hide content even after page load via verification system
  - **Gradual Rollback**: Ability to switch specific percentage of traffic to white mode for testing
  - **Automated Triggers**: Set risk thresholds (e.g., unusual bot traffic spike, failed manual reviews) that auto-activate white mode
  - **Recovery Protocol**: Graduated re-enablement of black mode after risk subsides
  - **Implementation Details:**
    - Central configuration service with <100ms response time
    - Redis-based caching for instant propagation
    - Dashboard for real-time override control
    - Audit logging for all override events

**Risk 7: Client-Side Fingerprinting Failures**
- **Impact:** Low - Could affect verification accuracy
- **Mitigation:**
  - Server decision stands even if client verification fails
  - Use only safe parameters that all browsers support
  - Graceful degradation for missing APIs
  - Timeout handling for slow fingerprint collection

## **9. Next Steps**

### **Immediate Actions (Week 1)**
1. Set up Next.js project with initial structure
2. Implement TDS integration for cloaking decisions
3. Create first review article template
4. Deploy MVP to staging environment

### **Short-term Goals (Month 1)**
1. Launch first campaign with single partner
2. Establish monitoring and analytics pipeline
3. A/B test promocode widget variations
4. Document learnings and optimization opportunities

### **Handoff to Development**
- Use this brief as the single source of truth
- All technical decisions should align with the cloaking strategy
- Prioritize compliance and performance equally
- Regular check-ins during implementation phase

## **10. Related Documentation**

For detailed implementation guidance, refer to these companion documents:

### **[cloak.md](./cloak.md)**
- Comprehensive investigation detection patterns
- Detailed 5-minute window implementation
- Behavioral analysis techniques
- Emergency protocol procedures

### **[fingerprint.md](./fingerprint.md)**
- Complete list of safe browser parameters
- Implementation code for fingerprint collection
- Performance optimization techniques
- Comparison with mainstream analytics tools

### **Key Integration Points**
- Use only safe parameters from fingerprint.md for client verification
- Implement all investigation patterns from cloak.md
- Follow the single-use fingerprint policy
- Maintain the 5-minute window as the primary defense
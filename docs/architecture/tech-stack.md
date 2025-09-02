# Frontend Tech Stack

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Framework | Next.js | 15.3.4 | Full-stack React framework with App Router | SSR for SEO, fastest initial page load (<100ms), built-in API routes for cloaking logic |
| UI Library | React | 19.1 | Component-based UI development | Latest stable with improved performance, server components, and concurrent features including useActionState, useOptimistic |
| State Management | @tanstack/react-query | Latest | Server state management and caching | Handles TDS API calls, caching for performance, automatic retries |
| Routing | Next.js App Router | Built-in | File-based routing with RSC support | Native to Next.js, supports streaming, perfect for dynamic article routes |
| Build Tool | Next.js/Turbopack | Built-in | Fast bundling and HMR | Zero-config, optimized for Next.js, faster than webpack |
| Styling | Tailwind CSS | 4.1.11 | Utility-first CSS framework | Rapid development, small bundle size, perfect for dynamic class switching (is-black-mode) |
| Testing | Vitest | Latest | Unit and component testing | Fast, ESM-first, compatible with React Testing Library |
| Component Library | shadcn/ui + Radix UI | Latest | Accessible, unstyled components | Copy-paste components, full control, perfect for custom promocode widgets |
| Form Handling | Native React | Built-in | Simple form interactions | No complex forms needed, reduces bundle size vs react-hook-form |
| Animation | CSS + Radix UI | Built-in | Subtle UI transitions | Lightweight, no heavy animation library needed for simple transitions |
| Dev Tools | TypeScript + ESLint + Prettier | Latest | Type safety and code quality | Catch errors early, maintain consistent code style |

**Additional Core Dependencies:**
- **next-intl**: Internationalization for Russian/English support
- **@sentry/nextjs**: Error tracking and performance monitoring
- **posthog-js**: Analytics for tracking promocode interactions
- **clsx + tailwind-merge**: Utility for dynamic className management
- **lucide-react**: Lightweight icon set for UI elements

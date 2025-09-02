# Technical Assumptions

## Repository Structure: Monorepo
Single repository containing the Next.js application with all components, utilities, and configurations. This simplifies deployment and maintains consistency across the codebase.

## Service Architecture
**Next.js Frontend with External Cloaking Service**. The application runs as a Next.js frontend that consumes cloaking decisions from an external API service. Server Components make initial API calls to get cloaking state, while API routes proxy client-side fingerprint verification requests. All cloaking logic resides in the external service.

## Testing Requirements
**Unit + Integration Testing Focus**. Unit tests for utility functions and React components. Integration tests for API routes and TDS communication. E2E tests for critical user flows (cloaking behavior, promocode interactions). Manual testing convenience methods for verifying cloaking states.

## Additional Technical Assumptions and Requests
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

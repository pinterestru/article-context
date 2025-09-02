# Template and Framework Selection

**Current Framework Setup:**
- **Framework**: Next.js with App Router
- **Language**: TypeScript for full type safety
- **Styling**: Tailwind CSS (no Axios - using native fetch)
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: React Query (@tanstack/react-query)
- **Internationalization**: next-intl
- **Analytics**: PostHog + Sentry
- **Testing**: Vitest + Testing Library + MSW

**Existing Project Structure to Maintain:**
```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   └── article/             # Article routes
│       └── [slug]/          # Dynamic article pages
├── components/              # UI components
│   ├── layout/             # Layout patterns
│   ├── ui/                 # shadcn/ui primitives
│   └── shared/             # Custom components
├── lib/                    # Core logic
├── providers/              # React Context providers
├── messages/               # i18n translations
└── middleware.ts           # i18n locale detection
```

**Key Architectural Decisions Already Made:**
1. **No starter template** - Custom implementation from scratch
2. **Two-stage cloaking mechanism** with CSS-based content control
3. **Server-side rendering** for SEO and performance
4. **Native fetch API** instead of Axios for data fetching
5. **shadcn/ui** for component library (not a traditional UI kit)

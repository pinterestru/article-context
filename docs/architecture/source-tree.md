# Project Structure

```plaintext
affiliate-article-ui/
├── .github/                      # GitHub Actions CI/CD workflows
│   └── workflows/
│       ├── ci.yml               # Test, lint, type-check on PR
│       └── deploy.yml           # Deploy to production
├── .husky/                      # Git hooks
│   ├── pre-commit              # Run lint-staged
│   └── pre-push                # Run tests
├── .vscode/                     # VS Code settings
│   ├── settings.json           # Project-specific settings
│   └── extensions.json         # Recommended extensions
├── public/                      # Static assets
│   ├── fonts/                  # Web fonts
│   ├── images/                 # Static images
│   └── favicon.ico            # Favicon
├── src/
│   ├── app/                    # App Router (pages + API)
│   │   ├── (marketing)/        # Route group for public pages
│   │   │   ├── layout.tsx      # Marketing layout
│   │   │   └── article/
│   │   │       └── [slug]/
│   │   │           ├── page.tsx        # Article page (Server Component)
│   │   │           ├── loading.tsx     # Loading skeleton
│   │   │           └── error.tsx       # Error boundary
│   │   ├── api/                # API routes
│   │   │   ├── cloak/
│   │   │   │   └── route.ts    # Initial cloak decision endpoint
│   │   │   ├── verify-cloak/
│   │   │   │   └── route.ts    # Fingerprint verification endpoint
│   │   │   └── go/
│   │   │       └── [token]/
│   │   │           └── route.ts # Affiliate link proxy
│   │   ├── layout.tsx          # Root layout
│   │   ├── global-error.tsx    # Global error boundary
│   │   └── not-found.tsx       # 404 page
│   ├── components/
│   │   ├── article/            # Article-specific components
│   │   │   ├── ArticleContent.tsx      # Main article renderer
│   │   │   ├── PromocodeWidget.tsx     # Promocode overlay widget
│   │   │   └── ActionHydrator.tsx      # Hydrates [data-action] elements
│   │   ├── layout/             # Layout components
│   │   │   ├── Container.tsx   # Max-width container
│   │   │   └── Section.tsx     # Section wrapper
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx      # Button component
│   │   │   ├── dialog.tsx      # Dialog component
│   │   │   ├── card.tsx        # Card component
│   │   │   └── toast.tsx       # Toast notifications
│   │   └── shared/             # Shared components
│   │       ├── CopyButton.tsx  # Copy to clipboard button
│   │       └── Countdown.tsx   # Offer countdown timer
│   ├── lib/
│   │   ├── api/               # API client functions
│   │   │   ├── tracker.ts     # TDS API client
│   │   │   └── content.ts     # Content fetching
│   │   ├── cloak/             # Cloaking logic
│   │   │   ├── fingerprint.ts # Browser fingerprinting
│   │   │   ├── detector.ts    # Investigation detection
│   │   │   └── constants.ts   # Cloaking constants
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── use-cloak.ts   # Cloak state hook
│   │   │   └── use-promocode.ts # Promocode interactions
│   │   ├── analytics/         # Analytics setup
│   │   │   ├── posthog.ts     # PostHog client
│   │   │   └── sentry.ts      # Sentry config
│   │   └── utils/             # Utility functions
│   │       ├── cn.ts          # className helper
│   │       └── formatters.ts  # Date/number formatters
│   ├── providers/
│   │   ├── cloak-provider.tsx # Cloaking context
│   │   ├── query-provider.tsx # React Query setup
│   │   └── intl-provider.tsx  # Internationalization
│   ├── types/
│   │   ├── article.ts         # Article types
│   │   ├── cloak.ts           # Cloaking types
│   │   └── api.ts             # API response types
│   ├── messages/              # i18n translations
│   │   ├── en.json            # English
│   │   └── ru.json            # Russian
│   ├── styles/
│   │   └── globals.css        # Global styles + Tailwind
│   └── middleware.ts          # Next.js middleware
├── .env.example               # Environment variables template
├── .eslintrc.json            # ESLint config
├── .gitignore                # Git ignore rules
├── .nvmrc                    # Node version
├── CLAUDE.md                 # AI assistant guidelines
├── components.json           # shadcn/ui config
├── instrumentation.ts        # Sentry/PostHog setup
├── next.config.mjs           # Next.js configuration
├── package.json              # Dependencies
├── postcss.config.mjs        # PostCSS config
├── prettier.config.js        # Code formatting
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript config
└── vitest.config.ts          # Test configuration
```

**Naming Convention Summary:**
- **Components**: PascalCase (e.g., `CopyButton.tsx`, `ArticleContent.tsx`)
- **shadcn/ui components**: lowercase (e.g., `button.tsx`, `dialog.tsx`) - following shadcn convention
- **Pages/layouts**: lowercase (e.g., `page.tsx`, `layout.tsx`) - Next.js convention
- **Non-component files**: kebab-case (e.g., `use-cloak.ts`, `tracker.ts`)
- **Directories**: kebab-case (e.g., `verify-cloak/`)

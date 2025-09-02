import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function ArticleNotFound() {
  const t = await getTranslations('errors.404')
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <div className="mb-8">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <svg
                className="text-muted-foreground h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-foreground mb-4 text-3xl font-bold">{t('articleTitle')}</h1>
          </div>

          <p className="text-muted-foreground mx-auto mb-8 max-w-md">
            {t('articleDescription')}
          </p>

          <div className="mb-12">
            <Link
              href="/"
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {t('returnHome')}
            </Link>
          </div>

          <div className="border-border border-t pt-8">
            <h2 className="mb-4 text-lg font-semibold">{t('lookingForSomethingElse')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('browseLatestArticles')}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

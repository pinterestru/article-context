import { Suspense } from 'react'
import { Container } from '@/components/layout/Container'
import { ArticlesList } from '@/features/article'
import { Skeleton } from '@/components/ui/skeleton'
import { getFeaturedArticles } from '@/lib/services/article/article.api'
import { getTranslations } from 'next-intl/server'

async function FeaturedArticles() {
  const result = await getFeaturedArticles(10)
  
  if (!result.success) {
    return <ArticlesList articles={[]} error={result.error} />
  }
  
  return <ArticlesList articles={result.data} gridCols={3} />
}

function FeaturedArticlesSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48 mx-auto" />
      <ArticlesList articles={[]} loading={true} gridCols={3} />
    </div>
  )
}

export async function DefaultHomePage() {
  const t = await getTranslations('home');
  return (
    <main className="min-h-screen py-12">
      <Container>
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Featured Articles Section */}
          <section className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">{t('features.title')}</h2>
              <p className="text-muted-foreground mt-2">
                {t('features.subtitle')}
              </p>
            </div>
            
            <Suspense fallback={<FeaturedArticlesSkeleton />}>
              <FeaturedArticles />
            </Suspense>
          </section>
        </div>
      </Container>
    </main>
  )
}
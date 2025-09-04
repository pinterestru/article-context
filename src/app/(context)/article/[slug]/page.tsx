import { Suspense } from 'react'
import { getArticleBySlug } from '@/lib/services/article/article.api'
import { ArticleContentServer, ArticleLoadingSkeleton } from '@/features/article/components'
import { Container } from '@/components/layout/Container'
import { getWebsiteUrl } from '@/lib/utils/domain'
import type { Metadata } from 'next'


interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params

  return (
    <main className="min-h-screen">
      <Container>
        <article className="mx-auto max-w-4xl py-4">
          <Suspense fallback={<ArticleLoadingSkeleton />}>
            <ArticleContentServer 
              slug={slug}
              articleSlug={slug}
              className="mx-auto max-w-3xl" 
            />
          </Suspense>
        </article>
      </Container>
    </main>
  )
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getArticleBySlug(slug)

  if (!result.success) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const article = result.data

  const baseUrl = getWebsiteUrl()
  const canonicalUrl = `${baseUrl}/article/${article.slug}`

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  }
}

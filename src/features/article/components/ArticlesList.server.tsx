import { ArticlePreviewCard } from './ArticlePreviewCard.server';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArticlesListProps } from '../types';
import { getTranslations } from 'next-intl/server';

export async function ArticlesList({ 
  articles, 
  loading = false, 
  error = null,
  className,
  gridCols = 3 
}: ArticlesListProps) {
  const t = await getTranslations('article.list');
  
  if (loading) {
    return <ArticlesListSkeleton gridCols={gridCols} className={className} />
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('errorLoading')}</AlertTitle>
        <AlertDescription>
          {error.message || t('errorLoading')}
        </AlertDescription>
      </Alert>
    )
  }

  if (articles.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-muted-foreground">{t('noArticles')}</p>
      </div>
    )
  }

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[gridCols]

  return (
    <div className={cn(`grid gap-6 ${gridColsClass}`, className)}>
      {articles.map((article) => (
        <ArticlePreviewCard key={article.id} article={article} />
      ))}
    </div>
  )
}

function ArticlesListSkeleton({ gridCols = 3, className }: { gridCols?: 1 | 2 | 3 | 4; className?: string }) {
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }[gridCols]

  const skeletonCount = gridCols === 1 ? 3 : gridCols * 2

  return (
    <div className={cn(`grid gap-6 ${gridColsClass}`, className)}>
      {Array.from({ length: skeletonCount }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
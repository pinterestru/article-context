import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArticlePreviewCardProps } from '../types';
import { formatDate } from '@/lib/i18n/utils';
import { getTranslations } from 'next-intl/server';

export async function ArticlePreviewCard({ article, className }: ArticlePreviewCardProps) {
  const t = await getTranslations('article');
  const formattedDate = formatDate(article.publishedAt, 'PP')

  return (
    <Card className={cn('group h-full transition-all hover:shadow-lg', className)}>
      <Link href={`/article/${article.slug}`} className="block h-full">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
              {article.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <time dateTime={article.publishedAt}>{formattedDate}</time>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="line-clamp-3">
            {article.excerpt}
          </CardDescription>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {article.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{article.tags.length - 3} {t('more')}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
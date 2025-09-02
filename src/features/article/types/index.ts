import type { HTMLAttributes } from 'react';
import type { Article } from '@/types/article';

// ArticleContentServer types
export interface ArticleContentServerProps extends HTMLAttributes<HTMLDivElement> {
  content?: string;
  slug?: string;
  ecommerceStoreId?: string;
  articleSlug?: string;
  articleId?: string;
}

// ArticlePreviewCard types
export interface ArticlePreviewCardProps {
  article: Article;
  className?: string;
}

// ArticlesList types
export interface ArticlesListProps {
  articles: Article[];
  loading?: boolean;
  error?: Error | null;
  className?: string;
  gridCols?: 1 | 2 | 3 | 4;
}
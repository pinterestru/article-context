'use client';

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { logReactError } from '@/lib/logging/logger-client';
import { analytics } from '@/lib/analytics';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ArticleErrorBoundaryProps {
  children: ReactNode;
  articleId?: string;
  fallback?: (props: { error: Error; retry: () => void; translations: ArticleErrorTranslations }) => ReactNode;
}

interface ArticleErrorTranslations {
  title: string;
  description: string;
  tryAgain: string;
  goHome: string;
}

interface ArticleErrorBoundaryInnerProps extends ArticleErrorBoundaryProps {
  translations: ArticleErrorTranslations;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

function ArticleErrorFallback({ error, retry, translations }: { error: Error; retry: () => void; translations: ArticleErrorTranslations }) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <div className="min-h-[400px] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="inline-flex p-3 bg-red-50 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            {translations.title}
          </h2>
          <p className="text-gray-600">
            {translations.description}
          </p>
          {isDevelopment && (
            <p className="text-sm text-red-600 mt-4 font-mono break-all">
              {error.message}
            </p>
          )}
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button onClick={retry} variant="default">
            {translations.tryAgain}
          </Button>
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline"
          >
            {translations.goHome}
          </Button>
        </div>
      </div>
    </div>
  );
}

class ArticleErrorBoundaryInner extends Component<ArticleErrorBoundaryInnerProps, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ArticleErrorBoundaryInnerProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { articleId } = this.props;
    const { retryCount } = this.state;
    
    // Use React 19 error logging with OpenTelemetry
    logReactError(error, errorInfo, {
      article: {
        id: articleId,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      },
      retryCount,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });
    
    // Track error in analytics
    if (typeof window !== 'undefined') {
      analytics.error(error, 'javascript', {
        article_id: articleId,
        retry_count: retryCount,
        page_url: window.location.href,
      });
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState(prevState => ({ 
      hasError: false, 
      error: null,
      retryCount: prevState.retryCount + 1
    }));
    
    // Log the reset action with OpenTelemetry context
    // The logger will automatically include trace context

    // Auto-reset after 30 seconds to prevent infinite error states
    this.resetTimeoutId = setTimeout(() => {
      if (this.state.hasError && this.state.retryCount < 3) {
        this.resetErrorBoundary();
      }
    }, 30000);
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const fallback = this.props.fallback || ArticleErrorFallback;
      return fallback({ 
        error: this.state.error, 
        retry: this.resetErrorBoundary,
        translations: this.props.translations
      });
    }

    return this.props.children;
  }
}

// Wrapper component that provides translations
export function ArticleErrorBoundary({ children, articleId, fallback }: ArticleErrorBoundaryProps) {
  const t = useTranslations('errors.article');
  
  const translations: ArticleErrorTranslations = {
    title: t('title'),
    description: t('description'),
    tryAgain: t('buttons.tryAgain'),
    goHome: t('buttons.goHome'),
  };
  
  return (
    <ArticleErrorBoundaryInner 
      translations={translations}
      articleId={articleId}
      fallback={fallback}
    >
      {children}
    </ArticleErrorBoundaryInner>
  );
}
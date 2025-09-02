'use client';

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { logReactError } from '@/lib/logging/logger-client';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface PromocodeErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface PromocodeErrorBoundaryInnerProps extends PromocodeErrorBoundaryProps {
  translations: {
    title: string;
    description: string;
    tryAgain: string;
    refreshPage: string;
  };
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

class PromocodeErrorBoundaryInner extends Component<PromocodeErrorBoundaryInnerProps, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: PromocodeErrorBoundaryInnerProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Use React 19 error logging with OpenTelemetry
    logReactError(error, errorInfo, {
      promocode: true,
      retryCount: this.state.retryCount,
    });
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

    // Auto-reset after 10 seconds to prevent infinite error states
    this.resetTimeoutId = setTimeout(() => {
      if (this.state.hasError) {
        this.resetErrorBoundary();
      }
    }, 10000);
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="text-center py-8 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {this.props.translations.title}
            </h3>
            <p className="text-sm text-gray-500">
              {this.props.translations.description}
            </p>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button onClick={this.resetErrorBoundary} variant="outline" size="sm">
              {this.props.translations.tryAgain}
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="ghost" 
              size="sm"
            >
              {this.props.translations.refreshPage}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that provides translations
export function PromocodeErrorBoundary({ children, fallback }: PromocodeErrorBoundaryProps) {
  const t = useTranslations('promocode.errorBoundary');
  
  const translations = {
    title: t('title'),
    description: t('description'),
    tryAgain: t('tryAgain'),
    refreshPage: t('refreshPage'),
  };
  
  return (
    <PromocodeErrorBoundaryInner 
      translations={translations}
      fallback={fallback}
    >
      {children}
    </PromocodeErrorBoundaryInner>
  );
}
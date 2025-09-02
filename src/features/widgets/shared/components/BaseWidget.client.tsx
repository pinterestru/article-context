'use client';

import type { HTMLAttributes, ReactNode, ErrorInfo } from 'react';
import { forwardRef, Component } from 'react';
import { useTranslations } from 'next-intl';
import type { BaseWidgetConfig } from '../types/widget.types';

// Widget props interface
export interface BaseWidgetProps extends HTMLAttributes<HTMLDivElement> {
  type: string;
  config: BaseWidgetConfig;
  element?: HTMLElement;
}

// Widget error fallback component
export function WidgetErrorFallback({ error }: { error: Error }) {
  const t = useTranslations('widgets');
  
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="widget-error" style={{ 
        padding: '1rem', 
        border: '1px solid #ff0000', 
        borderRadius: '4px',
        background: '#ffebee',
        color: '#c62828',
        fontSize: '0.875rem'
      }}>
        <strong>{t('error.title')}</strong>
        <pre style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
          {error.message}
        </pre>
      </div>
    );
  }

  // In production, render nothing to avoid breaking the page
  return null;
}

// Widget loading state component
export function WidgetLoadingState() {
  const t = useTranslations('widgets');
  
  return (
    <div className="widget-loading" aria-busy="true">
      <span className="sr-only">{t('loading')}</span>
    </div>
  );
}

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Widget error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback || <WidgetErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Base widget component with forwardRef
export const BaseWidget = forwardRef<HTMLDivElement, BaseWidgetProps>(
  ({ type, config: _config, element: _element, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`widget widget--${type} ${className || ''}`}
        data-widget-type={type}
        {...props}
      >
        <WidgetErrorBoundary>
          {children}
        </WidgetErrorBoundary>
      </div>
    );
  }
);

BaseWidget.displayName = 'BaseWidget';

// Higher-order component to wrap widgets with error boundary
export function withWidgetErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName: string
) {
  const WithErrorBoundary = (props: P) => {
    return (
      <WidgetErrorBoundary>
        <WrappedComponent {...props} />
      </WidgetErrorBoundary>
    );
  };

  WithErrorBoundary.displayName = `WithWidgetErrorBoundary(${displayName})`;
  
  return WithErrorBoundary;
}
'use client'

import type { ReactNode } from 'react'
import { Component } from 'react'
import { useTranslations } from 'next-intl'

interface WidgetErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  widgetType?: string
}

interface WidgetErrorBoundaryInnerProps extends WidgetErrorBoundaryProps {
  t: (key: string, values?: Record<string, string | number>) => string
}

interface WidgetErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class WidgetErrorBoundaryInner extends Component<
  WidgetErrorBoundaryInnerProps,
  WidgetErrorBoundaryState
> {
  constructor(props: WidgetErrorBoundaryInnerProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Widget Error Boundary caught error${
        this.props.widgetType ? ` in ${this.props.widgetType} widget` : ''
      }:`,
      error,
      errorInfo
    )
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <p className="font-medium">{this.props.t('failedToLoad')}</p>
          {this.props.widgetType && (
            <p className="mt-1 text-xs opacity-75">
              {this.props.t('widgetType', { type: this.props.widgetType })}
            </p>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper component that provides translations
export function WidgetErrorBoundary({ children, fallback, widgetType }: WidgetErrorBoundaryProps) {
  const t = useTranslations('article.widget.errorBoundary')

  return (
    <WidgetErrorBoundaryInner t={t} fallback={fallback} widgetType={widgetType}>
      {children}
    </WidgetErrorBoundaryInner>
  )
}

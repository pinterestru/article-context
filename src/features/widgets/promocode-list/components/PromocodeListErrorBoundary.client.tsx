'use client'

import { Component } from 'react'
import type { ReactNode } from 'react'
import { logReactError, clientLogger } from '@/lib/logging/logger-client'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface PromocodeListErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  widgetConfig?: Record<string, unknown>
}

interface PromocodeListErrorBoundaryInnerProps extends PromocodeListErrorBoundaryProps {
  translations: {
    title: string
    description: string
    tryAgain: string
    refreshPage: string
  }
}

interface State {
  hasError: boolean
  error: Error | null
  retryCount: number
}

class PromocodeListErrorBoundaryInner extends Component<
  PromocodeListErrorBoundaryInnerProps,
  State
> {
  private resetTimeoutId: NodeJS.Timeout | null = null

  constructor(props: PromocodeListErrorBoundaryInnerProps) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Enhanced error logging with widget context
    logReactError(error, errorInfo, {
      widgetType: 'promocode-list',
      widgetConfig: this.props.widgetConfig,
      retryCount: this.state.retryCount,
    })
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
    }))

    clientLogger.info(
      {
        widgetType: 'promocode-list',
        retryCount: this.state.retryCount + 1,
      },
      'Promocode list error boundary reset'
    )

    // Auto-reset after 30 seconds to prevent infinite error states
    // More conservative than the 10 seconds in the original
    this.resetTimeoutId = setTimeout(() => {
      if (this.state.hasError) {
        this.resetErrorBoundary()
      }
    }, 30000)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI with theme-aware styling
      return (
        <div className="space-y-4 py-8 text-center">
          <div className="space-y-2">
            <h3 className="text-foreground text-lg font-semibold">
              {this.props.translations.title}
            </h3>
            <p className="text-muted-foreground text-sm">{this.props.translations.description}</p>
          </div>

          <div className="flex justify-center gap-2">
            <Button onClick={this.resetErrorBoundary} variant="outline" size="sm">
              {this.props.translations.tryAgain}
            </Button>
            <Button onClick={() => window.location.reload()} variant="ghost" size="sm">
              {this.props.translations.refreshPage}
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper component that provides translations
export function PromocodeListErrorBoundary({
  children,
  fallback,
  widgetConfig,
}: PromocodeListErrorBoundaryProps) {
  const t = useTranslations('promocode.list.errorBoundary')

  const translations = {
    title: t('title'),
    description: t('description'),
    tryAgain: t('tryAgain'),
    refreshPage: t('refreshPage'),
  }

  return (
    <PromocodeListErrorBoundaryInner
      translations={translations}
      fallback={fallback}
      widgetConfig={widgetConfig}
    >
      {children}
    </PromocodeListErrorBoundaryInner>
  )
}

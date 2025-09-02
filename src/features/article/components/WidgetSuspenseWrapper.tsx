import { Suspense, type ComponentType } from 'react'
import { WidgetSkeleton } from './WidgetSkeleton'
import type { WidgetConfig } from '@/features/widgets/lib/config-parser'
import type { WidgetData } from '@/lib/article/widget-data-fetcher'

interface WidgetComponentProps {
  config: WidgetConfig
  data: WidgetData
  className?: string
}

interface WidgetSuspenseWrapperProps {
  widgetId: string
  widgetType: string
  component: ComponentType<WidgetComponentProps>
  skeleton?: ComponentType<{ className?: string }>
  config: WidgetConfig
  data?: WidgetData
  className?: string
}

/**
 * Wrapper component that provides Suspense boundaries for widgets
 * Uses widget-specific skeletons when available, falls back to generic skeleton
 */
export function WidgetSuspenseWrapper({
  widgetId,
  widgetType,
  component: Component,
  skeleton: SkeletonComponent,
  config,
  data,
  className,
}: WidgetSuspenseWrapperProps) {
  // Use widget-specific skeleton if available, otherwise use generic
  const fallback = SkeletonComponent ? (
    <SkeletonComponent className={className} />
  ) : (
    <WidgetSkeleton />
  )

  return (
    <Suspense fallback={fallback}>
      <Component
        config={config}
        data={data || { widgetId, type: widgetType, data: null }}
        className={className}
      />
    </Suspense>
  )
}

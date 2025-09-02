# Component Standards

## Component Template

```typescript
'use client'

import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface PromocodeWidgetProps extends HTMLAttributes<HTMLDivElement> {
  code: string
  discount: string
  description?: string
  expiresAt?: Date
  onCopy?: (code: string) => void
}

export const PromocodeWidget = forwardRef<HTMLDivElement, PromocodeWidgetProps>(
  ({ code, discount, description, expiresAt, onCopy, className, ...props }, ref) => {
    const handleCopy = async () => {
      await navigator.clipboard.writeText(code)
      onCopy?.(code)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-lg border bg-card p-6 shadow-lg',
          'transition-all duration-200 hover:shadow-xl',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Exclusive Discount</p>
            <p className="text-2xl font-bold">{discount}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-2 rounded-md bg-primary px-4 py-2',
              'text-primary-foreground transition-colors hover:bg-primary/90'
            )}
          >
            <span className="font-mono text-sm">{code}</span>
            <CopyIcon className="h-4 w-4" />
          </button>
        </div>
        {expiresAt && (
          <p className="mt-4 text-xs text-muted-foreground">
            Expires: {new Intl.DateTimeFormat('en-US').format(expiresAt)}
          </p>
        )}
      </div>
    )
  }
)

PromocodeWidget.displayName = 'PromocodeWidget'
```

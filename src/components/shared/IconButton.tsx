import * as React from 'react';
import type { ButtonProps } from '@/components/shared/Button';
import { Button } from '@/components/shared/Button';
import { cn } from '@/lib/utils';

// This is the base IconButton. It has no client-side dependencies.
// It can be safely used in Server Components.
const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size="icon"
        className={cn(
          // Add shrink-0 as a sensible default in flex layouts.
          'shrink-0',
          
          // THE FIX:
          // These classes are added here to override the base styles.
          // `tailwind-merge` (inside `cn`) ensures these take precedence.
          // This removes the blue ring on focus for a cleaner look.
          'focus-visible:ring-0 focus-visible:ring-offset-0',
          
          // We can optionally add a subtle background for focus,
          // which is good for accessibility on ghost variants.
          'focus-visible:bg-accent',

          // The original className prop is passed last for any final overrides.
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton };
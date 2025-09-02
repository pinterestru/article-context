import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { Button as UIButton, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  // Define the new 'color' prop for semantic clarity.
  color?: 'primary' | 'secondary';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, color, size, asChild = false, ...props }, ref) => {
    // Logic to map the semantic 'color' prop to the underlying 'variant' prop.
    // The 'variant' prop takes precedence if both are provided.
    const finalVariant =
      variant ?? (color === 'secondary' ? 'secondary' : 'default');

    return (
      <UIButton
        className={cn('cursor-pointer outline-none', className)}
        // Use the resolved variant.
        variant={finalVariant}
        size={size}
        asChild={asChild}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
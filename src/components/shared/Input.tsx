import * as React from 'react';
import { Input as UIInput } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <UIInput className={cn(className)} ref={ref} {...props} />;
  }
);
Input.displayName = 'Input';

export { Input };
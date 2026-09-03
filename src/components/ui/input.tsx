import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-3 py-2 bg-bg-panel text-text-primary placeholder:text-text-tertiary',
        'border border-border-default rounded-radius-md',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
        'transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

export { Input };

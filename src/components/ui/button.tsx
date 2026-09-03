import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-[510] transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-accent text-bg-primary hover:bg-accent-hover active:bg-accent disabled:bg-accent',
      secondary:
        'bg-bg-surface text-text-primary hover:bg-bg-surface-2 border border-border-default',
      ghost:
        'text-text-secondary hover:bg-bg-hover active:bg-bg-active hover:text-text-primary',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-radius-md',
      md: 'px-4 py-2 text-base rounded-radius-md',
      lg: 'px-6 py-3 text-lg rounded-radius-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block animate-spin mr-2">⏳</span>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };

import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default:
        'bg-bg-surface text-text-secondary border border-border-default',
      success: 'bg-success/10 text-success border border-success/30',
      warning: 'bg-warning/10 text-warning border border-warning/30',
      error: 'bg-error/10 text-error border border-error/30',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center px-2 py-1 rounded-radius-full text-xs font-[510]',
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = 'Badge';

export { Badge };

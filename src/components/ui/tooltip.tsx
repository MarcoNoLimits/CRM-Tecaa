import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';

// ─── Provider ────────────────────────────────────────────────────────────────

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={300} skipDelayDuration={0}>
      {children}
    </RadixTooltip.Provider>
  );
}

// ─── Root & Trigger ──────────────────────────────────────────────────────────

export const TooltipRoot = RadixTooltip.Root;
export const TooltipTrigger = RadixTooltip.Trigger;

// ─── Content ─────────────────────────────────────────────────────────────────

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

export function TooltipContent({
  children,
  className,
  side = 'top',
  sideOffset = 4,
}: TooltipContentProps) {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        side={side}
        sideOffset={sideOffset}
        className={cn(
          'z-[200] max-w-xs px-2.5 py-1.5',
          'bg-bg-surface-2 border border-border-default rounded-radius-md shadow-md',
          'text-xs text-text-primary',
          'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
          'data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1',
          className,
        )}
      >
        {children}
        <RadixTooltip.Arrow className="fill-bg-surface-2" />
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  );
}

// ─── Convenience Tooltip ─────────────────────────────────────────────────────

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <TooltipRoot>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>{content}</TooltipContent>
    </TooltipRoot>
  );
}

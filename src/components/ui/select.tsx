import * as RadixSelect from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Root & Value ─────────────────────────────────────────────────────────────

export const SelectRoot = RadixSelect.Root;
export const SelectValue = RadixSelect.Value;
export const SelectGroup = RadixSelect.Group;
export const SelectLabel = RadixSelect.Label;

// ─── Trigger ─────────────────────────────────────────────────────────────────

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
}

export function SelectTrigger({ children, className, placeholder: _placeholder }: SelectTriggerProps) {
  return (
    <RadixSelect.Trigger
      className={cn(
        'flex h-9 w-full items-center justify-between gap-2 px-3',
        'bg-bg-primary border border-border-default rounded-radius-md',
        'text-sm text-text-primary',
        'hover:border-border-hover transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
        'data-[placeholder]:text-text-quaternary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
    >
      {children}
      <RadixSelect.Icon>
        <ChevronDown size={14} className="text-text-tertiary shrink-0" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

// ─── Content ─────────────────────────────────────────────────────────────────

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  position?: 'item-aligned' | 'popper';
}

export function SelectContent({ children, className, position = 'popper' }: SelectContentProps) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        position={position}
        sideOffset={4}
        className={cn(
          'z-[100] min-w-[8rem] overflow-hidden',
          'bg-bg-surface border border-border-default rounded-radius-md shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
      >
        <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

// ─── Item ─────────────────────────────────────────────────────────────────────

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  return (
    <RadixSelect.Item
      value={value}
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 px-2 py-1.5 pl-7',
        'text-sm text-text-secondary rounded-radius-sm',
        'hover:bg-bg-hover hover:text-text-primary',
        'focus:bg-bg-hover focus:text-text-primary focus:outline-none',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <RadixSelect.ItemIndicator>
          <Check size={12} className="text-accent" />
        </RadixSelect.ItemIndicator>
      </span>
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}

// ─── Separator ───────────────────────────────────────────────────────────────

export function SelectSeparator({ className }: { className?: string }) {
  return (
    <RadixSelect.Separator className={cn('my-1 h-px bg-border-default mx-1', className)} />
  );
}

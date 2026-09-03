import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';

// ─── Root & Trigger ──────────────────────────────────────────────────────────

export const DropdownMenuRoot = RadixDropdown.Root;
export const DropdownMenuTrigger = RadixDropdown.Trigger;
export const DropdownMenuGroup = RadixDropdown.Group;
export const DropdownMenuSub = RadixDropdown.Sub;
export const DropdownMenuSubTrigger = RadixDropdown.SubTrigger;
export const DropdownMenuSubContent = RadixDropdown.SubContent;
export const DropdownMenuRadioGroup = RadixDropdown.RadioGroup;

// ─── Content ─────────────────────────────────────────────────────────────────

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}

export function DropdownMenuContent({
  children,
  className,
  sideOffset = 4,
  align = 'start',
}: DropdownMenuContentProps) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-[100] min-w-[10rem] overflow-hidden',
          'bg-bg-surface border border-border-default rounded-radius-md shadow-lg',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          'p-1',
          className,
        )}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  );
}

// ─── Item ─────────────────────────────────────────────────────────────────────

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onSelect?: (event: Event) => void;
  destructive?: boolean;
  disabled?: boolean;
  inset?: boolean;
}

export function DropdownMenuItem({
  children,
  className,
  onSelect,
  destructive = false,
  disabled = false,
  inset = false,
}: DropdownMenuItemProps) {
  return (
    <RadixDropdown.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        'flex cursor-default select-none items-center gap-2 px-2 py-1.5 rounded-radius-sm',
        'text-sm transition-colors',
        'focus:outline-none',
        destructive
          ? 'text-error hover:bg-error/10 focus:bg-error/10'
          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary focus:bg-bg-hover focus:text-text-primary',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className,
      )}
    >
      {children}
    </RadixDropdown.Item>
  );
}

// ─── Separator ───────────────────────────────────────────────────────────────

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return (
    <RadixDropdown.Separator className={cn('my-1 h-px bg-border-default mx-1', className)} />
  );
}

// ─── Label ───────────────────────────────────────────────────────────────────

export function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <RadixDropdown.Label
      className={cn('px-2 py-1 text-xs font-[510] text-text-quaternary uppercase tracking-wide', className)}
    >
      {children}
    </RadixDropdown.Label>
  );
}

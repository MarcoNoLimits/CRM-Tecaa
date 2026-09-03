import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

// ─── Root ─────────────────────────────────────────────────────────────────────

export const DialogRoot = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogPortal = RadixDialog.Portal;
export const DialogClose = RadixDialog.Close;

// ─── Overlay ─────────────────────────────────────────────────────────────────

export function DialogOverlay({ className }: { className?: string }) {
  return (
    <RadixDialog.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
    />
  );
}

// ─── Content ─────────────────────────────────────────────────────────────────

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <DialogOverlay />
      <RadixDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md',
          'bg-bg-surface border border-border-default rounded-radius-xl shadow-2xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          className,
        )}
      >
        {children}
        <RadixDialog.Close
          className={cn(
            'absolute right-4 top-4 rounded-radius-sm p-1',
            'text-text-tertiary hover:text-text-primary hover:bg-bg-hover',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-accent',
          )}
          aria-label="Close"
        >
          <X size={16} />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pt-6 pb-4', className)}>{children}</div>;
}

// ─── Title ───────────────────────────────────────────────────────────────────

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <RadixDialog.Title className={cn('text-base font-[590] text-text-primary', className)}>
      {children}
    </RadixDialog.Title>
  );
}

// ─── Description ─────────────────────────────────────────────────────────────

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <RadixDialog.Description className={cn('mt-1 text-sm text-text-tertiary', className)}>
      {children}
    </RadixDialog.Description>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-end gap-2 px-6 pb-6 pt-2', className)}>
      {children}
    </div>
  );
}

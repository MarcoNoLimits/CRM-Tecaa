import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CheckboxProps {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  'aria-label'?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  id,
  className,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  return (
    <RadixCheckbox.Root
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-radius-sm',
        'border border-border-default transition-colors',
        'hover:border-border-hover',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 focus:ring-offset-bg-primary',
        'data-[state=checked]:bg-accent data-[state=checked]:border-accent',
        'data-[state=indeterminate]:bg-accent/50 data-[state=indeterminate]:border-accent/50',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
    >
      <RadixCheckbox.Indicator>
        <Check size={10} className="text-bg-primary stroke-[3]" />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}

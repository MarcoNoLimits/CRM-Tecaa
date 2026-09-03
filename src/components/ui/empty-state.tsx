import type { LucideIcon } from 'lucide-react';
import { Button } from './button';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-radius-lg bg-bg-surface flex items-center justify-center mb-4">
        <Icon size={24} className="text-text-tertiary" />
      </div>
      <h3 className="text-text-primary font-[510] mb-1">{title}</h3>
      <p className="text-text-tertiary text-sm mb-4 max-w-xs">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

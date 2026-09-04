import { useLocation } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/use-auth';
import { useUIStore } from '../../stores/ui-store';

export function Topbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const { setCommandPaletteOpen } = useUIStore();

  const getBreadcrumb = () => {
    const path = location.pathname.split('/').filter(Boolean);
    if (path.length === 0) return 'Dashboard';
    return path[0].charAt(0).toUpperCase() + path[0].slice(1);
  };

  const userInitial = (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <header className="h-16 bg-bg-panel border-b border-border-default flex items-center justify-between px-6">
      <div className="flex items-center gap-6 flex-1">
        <div className="text-text-secondary text-sm font-[510]">
          {getBreadcrumb()}
        </div>

        <div className="hidden md:flex flex-1 max-w-xs">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className={cn(
              'w-full flex items-center justify-between pl-3 pr-2 py-1.5 bg-bg-primary text-text-quaternary',
              'border border-border-default rounded-radius-md hover:border-border-hover transition-colors',
              'text-sm text-left cursor-pointer',
            )}
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-text-tertiary" />
              <span>Search CRM…</span>
            </div>
            <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-border-subtle bg-bg-surface text-[10px] font-mono text-text-quaternary">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="w-8 h-8 rounded-radius-full bg-accent flex items-center justify-center title-text"
          title={user?.email ?? undefined}
        >
          <span className="text-xs font-[590] text-bg-primary">{userInitial}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => signOut()} title="Sign out">
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
}

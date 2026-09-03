import { useLocation } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/use-auth';

export function Topbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

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
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
            <input
              type="text"
              placeholder="Search (Cmd+K)"
              className={cn(
                'w-full pl-9 pr-3 py-2 bg-bg-primary text-text-secondary placeholder:text-text-quaternary',
                'border border-border-default rounded-radius-md',
                'focus:outline-none focus:ring-2 focus:ring-accent',
                'text-sm',
              )}
            />
          </div>
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

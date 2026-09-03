import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  Activity,
  CheckSquare,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Contacts', path: '/contacts' },
  { icon: Building2, label: 'Companies', path: '/companies' },
  { icon: TrendingUp, label: 'Pipeline', path: '/pipeline' },
  { icon: Activity, label: 'Activities', path: '/activities' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 hover:bg-bg-hover rounded-radius-md"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-bg-panel border-r border-border-default',
          'flex flex-col transition-transform duration-300 z-40',
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="p-6 border-b border-border-default">
          <h1 className="text-xl font-[590] text-text-primary">CRM Tecaa</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-radius-md',
                  'font-[510] text-sm transition-colors',
                  isActive
                    ? 'bg-accent text-bg-primary'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                )
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border-default">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-radius-md',
                'font-[510] text-sm transition-colors',
                isActive
                  ? 'bg-accent text-bg-primary'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
              )
            }
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Building2, BarChart3, CheckSquare, Phone, Settings, Home, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useContacts } from '../../hooks/use-contacts';
import { useCompanies } from '../../hooks/use-companies';
import { useDeals } from '../../hooks/use-deals';
import { useUIStore } from '../../stores/ui-store';
import { cn } from '../../lib/utils';

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
}

export function CommandPalette() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { commandPaletteOpen, setCommandPaletteOpen, openDrawer } = useUIStore();
  const { data: contacts } = useContacts(query.length >= 2 ? query : undefined);
  const { data: companies } = useCompanies(query.length >= 2 ? query : undefined);
  const { data: deals } = useDeals();

  const close = useCallback(() => {
    setCommandPaletteOpen(false);
    setQuery('');
  }, [setCommandPaletteOpen]);

  const run = useCallback(
    (action: () => void) => {
      action();
      close();
    },
    [close],
  );

  // Static nav + action items
  const staticItems: CommandItem[] = [
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      icon: <Home size={14} />,
      action: () => navigate('/dashboard'),
      group: 'Navigation',
    },
    {
      id: 'nav-contacts',
      label: 'Go to Contacts',
      icon: <User size={14} />,
      action: () => navigate('/contacts'),
      group: 'Navigation',
    },
    {
      id: 'nav-companies',
      label: 'Go to Companies',
      icon: <Building2 size={14} />,
      action: () => navigate('/companies'),
      group: 'Navigation',
    },
    {
      id: 'nav-pipeline',
      label: 'Go to Pipeline',
      icon: <BarChart3 size={14} />,
      action: () => navigate('/pipeline'),
      group: 'Navigation',
    },
    {
      id: 'nav-activities',
      label: 'Go to Activities',
      icon: <Phone size={14} />,
      action: () => navigate('/activities'),
      group: 'Navigation',
    },
    {
      id: 'nav-tasks',
      label: 'Go to Tasks',
      icon: <CheckSquare size={14} />,
      action: () => navigate('/tasks'),
      group: 'Navigation',
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      icon: <Settings size={14} />,
      action: () => navigate('/settings'),
      group: 'Navigation',
    },
    {
      id: 'new-contact',
      label: 'New Contact',
      sublabel: 'Create a new contact',
      icon: <User size={14} className="text-accent" />,
      action: () => openDrawer('contact'),
      group: 'Actions',
    },
    {
      id: 'new-company',
      label: 'New Company',
      sublabel: 'Add a company account',
      icon: <Building2 size={14} className="text-accent" />,
      action: () => openDrawer('company'),
      group: 'Actions',
    },
    {
      id: 'new-deal',
      label: 'New Deal',
      sublabel: 'Add a deal to your pipeline',
      icon: <BarChart3 size={14} className="text-accent" />,
      action: () => openDrawer('deal'),
      group: 'Actions',
    },
    {
      id: 'new-task',
      label: 'New Task',
      sublabel: 'Create a new task',
      icon: <CheckSquare size={14} className="text-accent" />,
      action: () => openDrawer('task'),
      group: 'Actions',
    },
    {
      id: 'log-activity',
      label: 'Log Activity',
      sublabel: 'Record a call, email, or meeting',
      icon: <Phone size={14} className="text-accent" />,
      action: () => openDrawer('activity'),
      group: 'Actions',
    },
  ];

  // Dynamic results from search
  const searchResults: CommandItem[] = query.length >= 2
    ? [
        ...(contacts ?? []).slice(0, 5).map((c) => ({
          id: `contact-${c.id}`,
          label: `${c.first_name} ${c.last_name}`,
          sublabel: c.companies?.name ?? c.email ?? undefined,
          icon: <User size={14} className="text-text-tertiary" />,
          action: () => navigate(`/contacts/${c.id}`),
          group: 'Contacts',
        })),
        ...(companies ?? []).slice(0, 5).map((c) => ({
          id: `company-${c.id}`,
          label: c.name,
          sublabel: c.industry ?? c.domain ?? undefined,
          icon: <Building2 size={14} className="text-text-tertiary" />,
          action: () => navigate(`/companies/${c.id}`),
          group: 'Companies',
        })),
        ...(deals ?? [])
          .filter(
            (d) =>
              !query ||
              d.title.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 5)
          .map((d) => ({
            id: `deal-${d.id}`,
            label: d.title,
            sublabel: d.pipeline_stages?.name ?? undefined,
            icon: <BarChart3 size={14} className="text-text-tertiary" />,
            action: () => navigate('/pipeline'),
            group: 'Deals',
          })),
      ]
    : [];

  // Filter static items by query
  const filteredStatic = query
    ? staticItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          (item.sublabel?.toLowerCase().includes(query.toLowerCase())),
      )
    : staticItems;

  // Combine: search results first, then static
  const allItems: CommandItem[] = query.length >= 2
    ? [...searchResults, ...filteredStatic]
    : filteredStatic;

  // Group items
  const groups = Array.from(new Set(allItems.map((i) => i.group)));

  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIdx]) {
        run(allItems[selectedIdx].action);
      }
    }
  };

  let itemCounter = 0;

  return (
    <Dialog.Root open={commandPaletteOpen} onOpenChange={(v) => !v && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            'fixed top-[15vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl',
            'bg-bg-panel border border-border-default rounded-radius-xl shadow-2xl overflow-hidden',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          )}
          onKeyDown={handleKeyDown}
        >
          <Dialog.Title className="sr-only">Command Palette</Dialog.Title>

          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
            <Search size={16} className="text-text-tertiary shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contacts, companies, deals, or type a command…"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-quaternary outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-text-quaternary hover:text-text-tertiary">
                <X size={14} />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-border-default text-[10px] text-text-quaternary font-mono">
              esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto py-1">
            {allItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-quaternary">
                No results for "{query}"
              </div>
            ) : (
              groups.map((group) => {
                const groupItems = allItems.filter((i) => i.group === group);
                return (
                  <div key={group}>
                    <div className="px-4 py-1.5 text-[10px] font-[510] text-text-quaternary uppercase tracking-wider">
                      {group}
                    </div>
                    {groupItems.map((item) => {
                      const idx = itemCounter++;
                      return (
                        <button
                          key={item.id}
                          onClick={() => run(item.action)}
                          onMouseEnter={() => setSelectedIdx(idx)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                            selectedIdx === idx
                              ? 'bg-bg-surface-2'
                              : 'hover:bg-bg-hover',
                          )}
                        >
                          <span className="text-text-tertiary shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-[510] text-text-primary truncate">
                              {item.label}
                            </p>
                            {item.sublabel && (
                              <p className="text-xs text-text-quaternary truncate">
                                {item.sublabel}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer hints */}
          <div className="px-4 py-2 border-t border-border-subtle flex items-center gap-4">
            <span className="text-[10px] text-text-quaternary flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-border-default font-mono text-[10px]">↑↓</kbd>
              Navigate
            </span>
            <span className="text-[10px] text-text-quaternary flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-border-default font-mono text-[10px]">↵</kbd>
              Select
            </span>
            <span className="text-[10px] text-text-quaternary flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-border-default font-mono text-[10px]">esc</kbd>
              Close
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus } from 'lucide-react';
import { useContacts } from '../../hooks/use-contacts';
import { useDebounce } from '../../hooks/use-debounce';
import { Button, Skeleton } from '../../components/ui';
import { format } from 'date-fns';
import type { ContactWithCompany } from '../../types/schema';

const STATUS_STYLES: Record<string, { badge: string; label: string }> = {
  active:   { badge: 'bg-success/10 text-success border border-success/20', label: 'Active' },
  lead:     { badge: 'bg-accent/10 text-accent border border-accent/20', label: 'Lead' },
  inactive: { badge: 'bg-bg-surface text-text-tertiary border border-border-default', label: 'Inactive' },
  archived: { badge: 'text-text-quaternary border border-border-subtle bg-transparent', label: 'Archived' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.inactive;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-radius-full text-xs font-[510] ${s.badge}`}>
      {s.label}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-border-subtle">
          <td className="px-4 py-3"><Skeleton className="h-4 w-4 rounded" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
          <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-radius-full" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
        </tr>
      ))}
    </>
  );
}

export default function ContactsIndex() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: contacts, isLoading, isError, error } = useContacts(debouncedSearch || undefined);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[590] text-text-primary">Contacts</h1>
          <p className="text-sm text-text-tertiary mt-0.5">
            {contacts ? `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}` : 'Loading…'}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => console.log('New Contact — drawer coming in Phase 8')}
        >
          <Plus size={16} className="mr-1.5" />
          New Contact
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
        <input
          type="text"
          placeholder="Search contacts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-bg-surface border border-border-default rounded-radius-md pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:outline-none focus:border-border-hover transition-colors"
        />
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-radius-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          Failed to load contacts: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* Table */}
      <div className="bg-bg-panel border border-border-default rounded-radius-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default">
              <th className="px-4 py-3 text-left w-10">
                <input type="checkbox" className="accent-accent" />
              </th>
              <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Name</th>
              <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Email</th>
              <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Company</th>
              <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Status</th>
              <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : contacts && contacts.length > 0 ? (
              contacts.map((contact: ContactWithCompany) => (
                <tr
                  key={contact.id}
                  onClick={() => navigate(`/contacts/${contact.id}`)}
                  className="border-b border-border-subtle hover:bg-bg-hover cursor-pointer transition-colors last:border-0"
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="accent-accent" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-[510] text-text-primary">
                      {contact.first_name} {contact.last_name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {contact.email ?? <span className="text-text-quaternary">—</span>}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {contact.companies?.name ?? <span className="text-text-quaternary">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={contact.status} />
                  </td>
                  <td className="px-4 py-3 text-text-tertiary">
                    {format(new Date(contact.created_at), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-radius-full bg-bg-surface-2 flex items-center justify-center">
                      <Users size={22} className="text-text-quaternary" />
                    </div>
                    <p className="font-[510] text-text-secondary">No contacts yet</p>
                    <p className="text-sm text-text-tertiary">Get started by adding your first contact.</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => console.log('New Contact — drawer coming in Phase 8')}
                    >
                      <Plus size={14} className="mr-1.5" />
                      Add your first contact
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

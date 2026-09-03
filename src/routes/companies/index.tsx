import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Plus } from 'lucide-react';
import { useCompanies } from '../../hooks/use-companies';
import { useDebounce } from '../../hooks/use-debounce';
import { Button, Skeleton } from '../../components/ui';
import { format } from 'date-fns';
import type { Company } from '../../types/schema';

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-border-subtle">
          <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
          <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
        </tr>
      ))}
    </>
  );
}

export default function CompaniesIndex() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: companies, isLoading, isError, error } = useCompanies(debouncedSearch || undefined);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[590] text-text-primary">Companies</h1>
          <p className="text-sm text-text-tertiary mt-0.5">
            {companies ? `${companies.length} compan${companies.length !== 1 ? 'ies' : 'y'}` : 'Loading…'}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => console.log('New Company — drawer coming in Phase 8')}
        >
          <Plus size={16} className="mr-1.5" />
          New Company
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
        <input
          type="text"
          placeholder="Search companies…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-bg-surface border border-border-default rounded-radius-md pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-quaternary focus:outline-none focus:border-border-hover transition-colors"
        />
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-radius-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          Failed to load companies: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* Table */}
      <div className="bg-bg-panel border border-border-default rounded-radius-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default">
              <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Name</th>
              <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Domain</th>
              <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Industry</th>
              <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Size</th>
              <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : companies && companies.length > 0 ? (
              companies.map((company: Company) => (
                <tr
                  key={company.id}
                  onClick={() => navigate(`/companies/${company.id}`)}
                  className="border-b border-border-subtle hover:bg-bg-hover cursor-pointer transition-colors last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-radius-md bg-bg-surface-2 flex items-center justify-center flex-shrink-0">
                        <Building2 size={13} className="text-text-tertiary" />
                      </div>
                      <span className="font-[510] text-text-primary">{company.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {company.domain ?? <span className="text-text-quaternary">—</span>}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {company.industry ?? <span className="text-text-quaternary">—</span>}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {company.size ?? <span className="text-text-quaternary">—</span>}
                  </td>
                  <td className="px-4 py-3 text-text-tertiary">
                    {format(new Date(company.created_at), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-radius-full bg-bg-surface-2 flex items-center justify-center">
                      <Building2 size={22} className="text-text-quaternary" />
                    </div>
                    <p className="font-[510] text-text-secondary">No companies yet</p>
                    <p className="text-sm text-text-tertiary">Get started by adding your first company.</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => console.log('New Company — drawer coming in Phase 8')}
                    >
                      <Plus size={14} className="mr-1.5" />
                      Add your first company
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

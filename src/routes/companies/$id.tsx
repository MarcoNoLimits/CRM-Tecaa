import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { ChevronLeft, Globe, Building2, Users, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../../components/ui';
import { format } from 'date-fns';
import type { Company, Contact, DealWithRelations } from '../../types/schema';

export default function CompanyDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: company, isLoading } = useQuery({
    queryKey: ['companies', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as unknown as Company;
    },
    enabled: Boolean(id),
  });

  const { data: contacts } = useQuery({
    queryKey: ['company-contacts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('company_id', id!);
      if (error) throw error;
      return (data ?? []) as unknown as Contact[];
    },
    enabled: Boolean(id),
  });

  const { data: deals } = useQuery({
    queryKey: ['company-deals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, contacts(id, first_name, last_name), companies(id, name), pipeline_stages(id, name, color, position)')
        .eq('company_id', id!);
      if (error) throw error;
      return (data ?? []) as unknown as DealWithRelations[];
    },
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-5">
          <Skeleton className="h-40 rounded-radius-lg" />
          <Skeleton className="h-40 rounded-radius-lg" />
        </div>
      </div>
    );
  }

  if (!company) {
    return <div className="p-6 text-text-tertiary">Company not found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-1 text-text-tertiary hover:text-text-primary transition-colors text-sm"
        >
          <ChevronLeft size={16} />
          Companies
        </button>
        <span className="text-text-quaternary">/</span>
        <span className="text-sm text-text-primary font-[510]">{company.name}</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-[590] text-text-primary">{company.name}</h1>
          {company.industry && (
            <p className="text-sm text-text-tertiary mt-1">{company.industry}</p>
          )}
        </div>
        <button className="px-3 py-1.5 text-sm font-[510] text-text-secondary border border-border-default rounded-radius-md hover:bg-bg-hover transition-colors">
          Edit
        </button>
      </div>

      {/* Info + Contacts + Deals */}
      <div className="grid grid-cols-5 gap-5">
        {/* Company info */}
        <div className="col-span-2 space-y-5">
          <div className="bg-bg-panel border border-border-default rounded-radius-lg p-5 space-y-4">
            <h2 className="text-sm font-[590] text-text-primary">Company Details</h2>
            <div className="space-y-3">
              {company.domain && (
                <div className="flex items-center gap-3">
                  <Globe size={15} className="text-text-quaternary shrink-0" />
                  <span className="text-sm text-text-secondary">{company.domain}</span>
                </div>
              )}
              {company.industry && (
                <div className="flex items-center gap-3">
                  <Building2 size={15} className="text-text-quaternary shrink-0" />
                  <span className="text-sm text-text-secondary">{company.industry}</span>
                </div>
              )}
              {company.size && (
                <div className="flex items-center gap-3">
                  <Users size={15} className="text-text-quaternary shrink-0" />
                  <span className="text-sm text-text-secondary">{company.size} employees</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar size={15} className="text-text-quaternary shrink-0" />
                <span className="text-sm text-text-tertiary">
                  Added {format(new Date(company.created_at), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 space-y-5">
          {/* Contacts */}
          <div className="bg-bg-panel border border-border-default rounded-radius-lg p-5">
            <h2 className="text-sm font-[590] text-text-primary mb-4">
              Contacts ({contacts?.length ?? 0})
            </h2>
            {contacts && contacts.length > 0 ? (
              <div className="divide-y divide-border-subtle">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between py-2.5 cursor-pointer hover:text-text-primary transition-colors"
                    onClick={() => navigate(`/contacts/${contact.id}`)}
                  >
                    <div>
                      <p className="text-sm font-[510] text-text-primary">
                        {contact.first_name} {contact.last_name}
                      </p>
                      {contact.email && (
                        <p className="text-xs text-text-tertiary">{contact.email}</p>
                      )}
                    </div>
                    <span className="text-xs text-text-quaternary capitalize">{contact.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-quaternary">No contacts linked.</p>
            )}
          </div>

          {/* Deals */}
          <div className="bg-bg-panel border border-border-default rounded-radius-lg p-5">
            <h2 className="text-sm font-[590] text-text-primary mb-4">
              Deals ({deals?.length ?? 0})
            </h2>
            {deals && deals.length > 0 ? (
              <div className="space-y-2">
                {deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between py-1.5">
                    <div>
                      <p className="text-sm font-[510] text-text-primary">{deal.title}</p>
                      {deal.pipeline_stages?.name && (
                        <p className="text-xs text-text-tertiary">{deal.pipeline_stages.name}</p>
                      )}
                    </div>
                    {deal.value != null && (
                      <span className="text-sm font-[510] text-text-primary ml-2 shrink-0">
                        ${deal.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-quaternary">No deals linked.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

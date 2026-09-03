import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, Building2, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../../components/ui';
import { format } from 'date-fns';
import type { ContactWithCompany, ActivityWithRelations, DealWithRelations, TaskWithAssignee } from '../../types/schema';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-success/10 text-success',
  lead: 'bg-accent/10 text-accent',
  inactive: 'bg-bg-surface-2 text-text-tertiary',
  archived: 'text-text-quaternary bg-transparent',
};

const ACTIVITY_ICON_COLOR: Record<string, string> = {
  call: 'bg-accent/10 text-accent',
  email: 'bg-success/10 text-success',
  meeting: 'bg-warning/10 text-warning',
  note: 'bg-bg-surface-2 text-text-tertiary',
};

export default function ContactDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: contact, isLoading } = useQuery({
    queryKey: ['contacts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*, companies(id, name)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as unknown as ContactWithCompany;
    },
    enabled: Boolean(id),
  });

  const { data: activities } = useQuery({
    queryKey: ['contact-activities', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*, contacts(id, first_name, last_name), companies(id, name), deals(id, title)')
        .eq('contact_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ActivityWithRelations[];
    },
    enabled: Boolean(id),
  });

  const { data: deals } = useQuery({
    queryKey: ['contact-deals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, contacts(id, first_name, last_name), companies(id, name), pipeline_stages(id, name, color, position)')
        .eq('contact_id', id!);
      if (error) throw error;
      return (data ?? []) as unknown as DealWithRelations[];
    },
    enabled: Boolean(id),
  });

  const { data: tasks } = useQuery({
    queryKey: ['contact-tasks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles(id, full_name)')
        .eq('contact_id', id!);
      if (error) throw error;
      return (data ?? []) as unknown as TaskWithAssignee[];
    },
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-40 rounded-radius-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-radius-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="p-6 text-text-tertiary">Contact not found.</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/contacts')}
          className="flex items-center gap-1 text-text-tertiary hover:text-text-primary transition-colors text-sm"
        >
          <ChevronLeft size={16} />
          Contacts
        </button>
        <span className="text-text-quaternary">/</span>
        <span className="text-sm text-text-primary font-[510]">
          {contact.first_name} {contact.last_name}
        </span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-[590] text-text-primary">
            {contact.first_name} {contact.last_name}
          </h1>
          {contact.companies?.name && (
            <p className="text-sm text-text-tertiary mt-1">{contact.companies.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-radius-full text-xs font-[510] ${STATUS_STYLES[contact.status]}`}>
            {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
          </span>
          <button className="px-3 py-1.5 text-sm font-[510] text-text-secondary border border-border-default rounded-radius-md hover:bg-bg-hover transition-colors">
            Edit
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-5 gap-5">
        {/* Left: Info */}
        <div className="col-span-3 space-y-5">
          {/* Contact card */}
          <div className="bg-bg-panel border border-border-default rounded-radius-lg p-5 space-y-4">
            <h2 className="text-sm font-[590] text-text-primary">Contact Information</h2>
            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail size={15} className="text-text-quaternary shrink-0" />
                  <span className="text-sm text-text-secondary">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={15} className="text-text-quaternary shrink-0" />
                  <span className="text-sm text-text-secondary">{contact.phone}</span>
                </div>
              )}
              {contact.companies?.name && (
                <div className="flex items-center gap-3">
                  <Building2 size={15} className="text-text-quaternary shrink-0" />
                  <span className="text-sm text-text-secondary">{contact.companies.name}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar size={15} className="text-text-quaternary shrink-0" />
                <span className="text-sm text-text-tertiary">
                  Added {format(new Date(contact.created_at), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Activity timeline */}
          <div className="bg-bg-panel border border-border-default rounded-radius-lg p-5">
            <h2 className="text-sm font-[590] text-text-primary mb-4">Activity Timeline</h2>
            {activities && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-radius-full flex items-center justify-center shrink-0 ${ACTIVITY_ICON_COLOR[activity.type]}`}>
                      <span className="text-xs font-[590]">{activity.type[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-[510] text-text-primary truncate">{activity.subject}</p>
                      <p className="text-xs text-text-quaternary">
                        {format(new Date(activity.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="text-xs text-text-quaternary capitalize shrink-0">{activity.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-quaternary">No activities logged yet.</p>
            )}
          </div>
        </div>

        {/* Right: Related panels */}
        <div className="col-span-2 space-y-5">
          {/* Deals */}
          <div className="bg-bg-panel border border-border-default rounded-radius-lg p-5">
            <h2 className="text-sm font-[590] text-text-primary mb-3">
              Deals ({deals?.length ?? 0})
            </h2>
            {deals && deals.length > 0 ? (
              <div className="space-y-2">
                {deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-text-secondary truncate">{deal.title}</span>
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

          {/* Tasks */}
          <div className="bg-bg-panel border border-border-default rounded-radius-lg p-5">
            <h2 className="text-sm font-[590] text-text-primary mb-3">
              Tasks ({tasks?.length ?? 0})
            </h2>
            {tasks && tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 py-1">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      task.status === 'done' ? 'bg-success' :
                      task.status === 'in_progress' ? 'bg-accent' : 'bg-text-quaternary'
                    }`} />
                    <span className={`text-sm truncate ${task.status === 'done' ? 'line-through text-text-quaternary' : 'text-text-secondary'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-quaternary">No tasks linked.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

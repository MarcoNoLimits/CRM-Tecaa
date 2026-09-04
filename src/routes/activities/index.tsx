import { useState } from 'react';
import { Phone, Mail, Users, FileText, Plus, type LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../../components/ui';
import { useUIStore } from '../../stores/ui-store';
import { format, isToday } from 'date-fns';
import type { ActivityWithRelations } from '../../types/schema';

type ActivityType = 'all' | 'call' | 'email' | 'meeting' | 'note';

const TYPE_TABS: { value: ActivityType; label: string; Icon: LucideIcon }[] = [
  { value: 'all', label: 'All', Icon: Users },
  { value: 'call', label: 'Calls', Icon: Phone },
  { value: 'email', label: 'Emails', Icon: Mail },
  { value: 'meeting', label: 'Meetings', Icon: Users },
  { value: 'note', label: 'Notes', Icon: FileText },
];

const ICON_COLORS: Record<string, string> = {
  call: 'bg-accent/10 text-accent',
  email: 'bg-success/10 text-success',
  meeting: 'bg-warning/10 text-warning',
  note: 'bg-bg-surface-2 text-text-tertiary',
};

const TYPE_ICONS: Record<string, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: FileText,
};

export default function ActivitiesIndex() {
  const [activeType, setActiveType] = useState<ActivityType>('all');
  const { openDrawer } = useUIStore();

  const { data: activities, isLoading, isError } = useQuery({
    queryKey: ['activities', activeType === 'all' ? undefined : activeType],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select('*, contacts(id, first_name, last_name), companies(id, name), deals(id, title)')
        .order('created_at', { ascending: false });
      if (activeType !== 'all') {
        query = query.eq('type', activeType);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as ActivityWithRelations[];
    },
  });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[590] text-text-primary">Activities</h1>
          <p className="text-sm text-text-tertiary mt-0.5">
            {activities ? `${activities.length} activit${activities.length !== 1 ? 'ies' : 'y'}` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={() => openDrawer('activity')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-[510] rounded-radius-md transition-colors"
        >
          <Plus size={15} />
          Log Activity
        </button>
      </div>

      {/* Type tabs */}
      <div className="flex items-center gap-1 bg-bg-surface border border-border-default rounded-radius-md p-1 w-fit">
        {TYPE_TABS.map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => setActiveType(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-[510] transition-colors ${
              activeType === value
                ? 'bg-bg-surface-2 text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-bg-panel border border-border-default rounded-radius-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-radius-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="px-4 py-8 text-center text-sm text-error">
            Failed to load activities.
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {activities.map((activity) => {
              const Icon = TYPE_ICONS[activity.type] ?? FileText;
              const linked = activity.contacts
                ? `${activity.contacts.first_name} ${activity.contacts.last_name}`
                : activity.companies?.name ?? activity.deals?.title ?? null;

              return (
                <div key={activity.id} className="flex items-center gap-4 px-4 py-3 hover:bg-bg-hover transition-colors">
                  <div className={`w-8 h-8 rounded-radius-full flex items-center justify-center shrink-0 ${ICON_COLORS[activity.type]}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-[510] text-text-primary truncate">{activity.subject}</p>
                    {linked && (
                      <p className="text-xs text-text-tertiary mt-0.5">{linked}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-radius-full bg-bg-surface border border-border-subtle text-text-tertiary capitalize">
                      {activity.type}
                    </span>
                    <span className="text-xs text-text-quaternary">
                      {activity.due_date
                        ? isToday(new Date(activity.due_date))
                          ? 'Today'
                          : format(new Date(activity.due_date), 'MMM d')
                        : format(new Date(activity.created_at), 'MMM d')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-radius-full bg-bg-surface-2 flex items-center justify-center">
                <FileText size={22} className="text-text-quaternary" />
              </div>
              <p className="font-[510] text-text-secondary">No activities yet</p>
              <p className="text-sm text-text-tertiary">Log a call, email, meeting, or note.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

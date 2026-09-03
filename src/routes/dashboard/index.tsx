import { BarChart3, Users, DollarSign, CheckSquare, Phone, Mail, Users2, FileText, type LucideIcon } from 'lucide-react';
import { useDashboardStats } from '../../hooks/use-dashboard';
import { Skeleton } from '../../components/ui';
import { format, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: Users2,
  note: FileText,
};

const ACTIVITY_ICON_COLORS: Record<string, string> = {
  call: 'text-accent',
  email: 'text-success',
  meeting: 'text-warning',
  note: 'text-text-quaternary',
};

function KpiCard({
  icon: Icon,
  label,
  value,
  subtitle,
  isLoading,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-bg-surface border border-border-default rounded-radius-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className="text-text-tertiary" />
        <span className="text-sm font-[510] text-text-tertiary">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <div className="text-3xl font-[590] text-text-primary">{value}</div>
      )}
      {subtitle && (
        <p className="text-xs text-text-quaternary mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export default function DashboardIndex() {
  const navigate = useNavigate();
  const stats = useDashboardStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-[590] text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-tertiary mt-0.5">
          Welcome back — here's what's happening today.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Total Contacts"
          value={stats.totalContacts}
          subtitle="In your CRM"
          isLoading={stats.isLoading}
        />
        <KpiCard
          icon={BarChart3}
          label="Active Deals"
          value={stats.activeDeals}
          subtitle="Open in pipeline"
          isLoading={stats.isLoading}
        />
        <KpiCard
          icon={DollarSign}
          label="Pipeline Value"
          value={stats.isLoading ? '…' : `$${stats.pipelineValue.toLocaleString()}`}
          subtitle="Sum of open deals"
          isLoading={stats.isLoading}
        />
        <KpiCard
          icon={CheckSquare}
          label="Overdue Tasks"
          value={stats.tasksOverdue}
          subtitle="Need attention"
          isLoading={stats.isLoading}
        />
      </div>

      {/* Two-column: Recent Deals + Upcoming Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Deals */}
        <div className="bg-bg-panel border border-border-default rounded-radius-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
            <h2 className="text-sm font-[590] text-text-primary">Recent Deals</h2>
            <button
              onClick={() => navigate('/pipeline')}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-border-subtle">
            {stats.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-5 w-16 rounded-radius-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : stats.recentDeals.length > 0 ? (
              stats.recentDeals.map((deal) => (
                <div key={deal.id} className="px-5 py-3 flex items-center gap-3 hover:bg-bg-hover transition-colors cursor-pointer" onClick={() => navigate('/pipeline')}>
                  <span className="text-sm font-[510] text-text-primary flex-1 truncate">{deal.title}</span>
                  {deal.pipeline_stages && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-radius-full border font-[510] shrink-0"
                      style={{
                        color: deal.pipeline_stages.color ?? '#5e6ad2',
                        borderColor: `${deal.pipeline_stages.color ?? '#5e6ad2'}33`,
                        backgroundColor: `${deal.pipeline_stages.color ?? '#5e6ad2'}11`,
                      }}
                    >
                      {deal.pipeline_stages.name}
                    </span>
                  )}
                  {deal.value != null && (
                    <span className="text-sm font-[510] text-text-secondary shrink-0">
                      ${deal.value.toLocaleString()}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-text-quaternary">
                No deals yet. <button className="text-accent hover:underline" onClick={() => navigate('/pipeline')}>Go to Pipeline →</button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="bg-bg-panel border border-border-default rounded-radius-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
            <h2 className="text-sm font-[590] text-text-primary">Upcoming Activities</h2>
            <button
              onClick={() => navigate('/activities')}
              className="text-xs text-accent hover:text-accent-hover transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-border-subtle">
            {stats.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <Skeleton className="w-7 h-7 rounded-radius-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : stats.upcomingActivities.length > 0 ? (
              stats.upcomingActivities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type] ?? FileText;
                return (
                  <div key={activity.id} className="px-5 py-3 flex items-center gap-3 hover:bg-bg-hover transition-colors cursor-pointer" onClick={() => navigate('/activities')}>
                    <div className="w-7 h-7 rounded-radius-full bg-bg-surface-2 flex items-center justify-center shrink-0">
                      <Icon size={13} className={ACTIVITY_ICON_COLORS[activity.type]} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-[510] text-text-primary truncate">{activity.subject}</p>
                      <p className="text-xs text-text-quaternary capitalize">{activity.type}</p>
                    </div>
                    {activity.due_date && (
                      <span className={`text-xs shrink-0 font-[510] ${isToday(new Date(activity.due_date)) ? 'text-warning' : 'text-text-quaternary'}`}>
                        {isToday(new Date(activity.due_date)) ? 'Today' : format(new Date(activity.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-5 py-8 text-center text-sm text-text-quaternary">
                No upcoming activities. <button className="text-accent hover:underline" onClick={() => navigate('/activities')}>Log one →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

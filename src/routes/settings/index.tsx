import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Plus, Trash2, Settings, Users } from 'lucide-react';
import { usePipelineStages, useCreateStage, useDeleteStage } from '../../hooks/use-pipeline-stages';
import { Skeleton, Button, Input } from '../../components/ui';

const PRESET_COLORS = [
  '#5e6ad2', '#27a644', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1',
];

export default function SettingsIndex() {
  const { data: stages, isLoading } = usePipelineStages();
  const createStage = useCreateStage();
  const deleteStage = useDeleteStage();

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createStage.mutate({
      name: newName.trim(),
      color: newColor,
      position: (stages?.length ?? 0) + 1,
    });
    setNewName('');
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteStage.mutate(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-[590] text-text-primary">Settings</h1>
        <p className="text-sm text-text-tertiary mt-0.5">Manage your CRM configuration</p>
      </div>

      <Tabs.Root defaultValue="pipeline">
        <Tabs.List className="flex items-center gap-1 bg-bg-surface border border-border-default rounded-radius-md p-1 w-fit mb-5">
          <Tabs.Trigger
            value="pipeline"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-[510] rounded text-text-tertiary hover:text-text-secondary transition-colors data-[state=active]:bg-bg-surface-2 data-[state=active]:text-text-primary"
          >
            <Settings size={14} />
            Pipeline
          </Tabs.Trigger>
          <Tabs.Trigger
            value="team"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-[510] rounded text-text-tertiary hover:text-text-secondary transition-colors data-[state=active]:bg-bg-surface-2 data-[state=active]:text-text-primary"
          >
            <Users size={14} />
            Team
          </Tabs.Trigger>
        </Tabs.List>

        {/* Pipeline Stages */}
        <Tabs.Content value="pipeline" className="space-y-5">
          <div className="bg-bg-panel border border-border-default rounded-radius-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border-default">
              <h2 className="text-sm font-[590] text-text-primary">Pipeline Stages</h2>
              <p className="text-xs text-text-tertiary mt-0.5">
                Customize the stages in your deal pipeline. Drag to reorder (coming soon).
              </p>
            </div>

            {/* Stages list */}
            <div className="divide-y divide-border-subtle">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))
              ) : (
                (stages ?? []).map((stage) => (
                  <div key={stage.id} className="px-5 py-3 flex items-center gap-3 hover:bg-bg-hover transition-colors">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color ?? '#5e6ad2' }}
                    />
                    <span className="text-sm font-[510] text-text-primary flex-1">{stage.name}</span>
                    <span className="text-xs text-text-quaternary">Position {stage.position}</span>
                    <button
                      onClick={() => handleDelete(stage.id)}
                      className={`p-1.5 rounded transition-colors ${
                        confirmDelete === stage.id
                          ? 'text-error bg-error/10'
                          : 'text-text-quaternary hover:text-error hover:bg-error/10'
                      }`}
                      title={confirmDelete === stage.id ? 'Click again to confirm' : 'Delete stage'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add stage form */}
            <div className="px-5 py-4 border-t border-border-default bg-bg-surface/50 space-y-3">
              <p className="text-xs font-[510] text-text-tertiary uppercase tracking-wider">Add Stage</p>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Stage name…"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newName.trim() || createStage.isPending}
                >
                  <Plus size={14} className="mr-1" />
                  Add
                </Button>
              </div>
              {/* Color picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-quaternary">Color:</span>
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-5 h-5 rounded-full transition-transform ${newColor === color ? 'ring-2 ring-offset-1 ring-offset-bg-surface scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* Team */}
        <Tabs.Content value="team">
          <div className="bg-bg-panel border border-border-default rounded-radius-lg p-8 text-center">
            <div className="w-12 h-12 rounded-radius-full bg-bg-surface-2 flex items-center justify-center mx-auto mb-3">
              <Users size={22} className="text-text-quaternary" />
            </div>
            <p className="font-[510] text-text-secondary">Team management coming soon</p>
            <p className="text-sm text-text-tertiary mt-1">
              Invite team members, manage roles, and set permissions.
            </p>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}

import { useState } from 'react';
import { CheckSquare, Plus, List, Columns } from 'lucide-react';
import { useTasks, useToggleTask } from '../../hooks/use-tasks';
import { Skeleton } from '../../components/ui';
import { format, isPast, isToday } from 'date-fns';
import type { TaskWithAssignee } from '../../types/schema';

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'bg-error/10 text-error border-error/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  medium: 'bg-accent/10 text-accent border-accent/20',
  low: 'bg-bg-surface-2 text-text-quaternary border-border-subtle',
};

const STATUS_STYLES: Record<string, string> = {
  todo: 'text-text-tertiary',
  in_progress: 'text-accent',
  done: 'text-success',
  cancelled: 'text-text-quaternary line-through',
};

function getDueDateStyle(task: TaskWithAssignee): string {
  if (!task.due_date || task.status === 'done' || task.status === 'cancelled') return 'text-text-quaternary';
  if (isToday(new Date(task.due_date))) return 'text-warning';
  if (isPast(new Date(task.due_date))) return 'text-error';
  return 'text-text-tertiary';
}

const BOARD_COLUMNS: Array<{ status: TaskWithAssignee['status']; label: string }> = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
];

type ViewMode = 'list' | 'board';

function TaskRow({ task }: { task: TaskWithAssignee }) {
  const toggle = useToggleTask();

  return (
    <tr className="border-b border-border-subtle hover:bg-bg-hover transition-colors last:border-0">
      <td className="px-4 py-3">
        <button
          onClick={() => toggle.mutate(task.id)}
          className="w-4 h-4 rounded border border-border-default flex items-center justify-center hover:border-accent transition-colors"
        >
          {task.status === 'done' && (
            <div className="w-2 h-2 rounded-sm bg-success" />
          )}
        </button>
      </td>
      <td className="px-4 py-3">
        <span className={`text-sm font-[510] ${task.status === 'done' ? 'line-through text-text-quaternary' : 'text-text-primary'}`}>
          {task.title}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-radius-full text-xs font-[510] border ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-[510] ${STATUS_STYLES[task.status]}`}>
          {task.status.replace('_', ' ')}
        </span>
      </td>
      <td className={`px-4 py-3 text-xs font-[510] ${getDueDateStyle(task)}`}>
        {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '—'}
      </td>
    </tr>
  );
}

function BoardCard({ task }: { task: TaskWithAssignee }) {
  const toggle = useToggleTask();

  return (
    <div className="bg-bg-surface hover:bg-bg-surface-2 border border-border-default rounded-radius-lg p-3 transition-colors">
      <div className="flex items-start gap-2">
        <button
          onClick={() => toggle.mutate(task.id)}
          className="w-4 h-4 mt-0.5 rounded border border-border-default flex items-center justify-center hover:border-accent transition-colors shrink-0"
        >
          {task.status === 'done' && <div className="w-2 h-2 rounded-sm bg-success" />}
        </button>
        <p className={`text-sm font-[510] flex-1 ${task.status === 'done' ? 'line-through text-text-quaternary' : 'text-text-primary'}`}>
          {task.title}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-2 ml-6">
        <span className={`text-xs px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        {task.due_date && (
          <span className={`text-xs ${getDueDateStyle(task)}`}>
            {format(new Date(task.due_date), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TasksIndex() {
  const [view, setView] = useState<ViewMode>('list');
  const { data: tasks, isLoading } = useTasks();

  const tasksByStatus = (status: TaskWithAssignee['status']) =>
    (tasks ?? []).filter((t) => t.status === status);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[590] text-text-primary">Tasks</h1>
          <p className="text-sm text-text-tertiary mt-0.5">
            {tasks ? `${tasks.length} task${tasks.length !== 1 ? 's' : ''}` : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-bg-surface border border-border-default rounded-radius-md p-0.5">
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-bg-surface-2 text-text-primary' : 'text-text-quaternary hover:text-text-tertiary'}`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setView('board')}
              className={`p-1.5 rounded transition-colors ${view === 'board' ? 'bg-bg-surface-2 text-text-primary' : 'text-text-quaternary hover:text-text-tertiary'}`}
            >
              <Columns size={15} />
            </button>
          </div>
          <button
            onClick={() => console.log('New Task — drawer coming in Phase 8')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-[510] rounded-radius-md transition-colors"
          >
            <Plus size={15} />
            New Task
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-radius-lg" />
          ))}
        </div>
      ) : view === 'list' ? (
        /* List view */
        <div className="bg-bg-panel border border-border-default rounded-radius-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default">
                <th className="px-4 py-3 text-left w-10" />
                <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Title</th>
                <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Priority</th>
                <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Status</th>
                <th className="px-4 py-3 text-left font-[510] text-text-tertiary">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => <TaskRow key={task.id} task={task} />)
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-radius-full bg-bg-surface-2 flex items-center justify-center">
                        <CheckSquare size={22} className="text-text-quaternary" />
                      </div>
                      <p className="font-[510] text-text-secondary">No tasks yet</p>
                      <p className="text-sm text-text-tertiary">Create your first task to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Board view */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {BOARD_COLUMNS.map(({ status, label }) => {
            const columnTasks = tasksByStatus(status);
            return (
              <div key={status} className="w-72 shrink-0 bg-bg-panel border border-border-default rounded-radius-lg overflow-hidden">
                <div className="flex items-center justify-between px-3 py-3 border-b border-border-subtle">
                  <span className="text-sm font-[510] text-text-primary">{label}</span>
                  <span className="text-xs text-text-quaternary bg-bg-surface px-1.5 py-0.5 rounded-radius-full">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="p-2 space-y-2 min-h-[80px]">
                  {columnTasks.map((task) => (
                    <BoardCard key={task.id} task={task} />
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="text-xs text-text-quaternary text-center py-4">Empty</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

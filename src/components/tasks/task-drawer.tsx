import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckSquare, Calendar, Flag } from 'lucide-react';
import {
  DrawerRoot,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from '../ui/drawer';
import { Button, Input } from '../ui';
import { useCreateTask } from '../../hooks/use-tasks';
import { useContacts } from '../../hooks/use-contacts';
import { useCompanies } from '../../hooks/use-companies';
import { cn } from '../../lib/utils';

const schema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low']).default('medium'),
  due_date: z.string().optional(),
  contact_id: z.string().optional(),
  company_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-error',
  high: 'text-warning',
  medium: 'text-accent',
  low: 'text-text-quaternary',
};

interface TaskDrawerProps {
  open: boolean;
  onClose: () => void;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-[510] text-text-secondary">{label}</label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

export function TaskDrawer({ open, onClose }: TaskDrawerProps) {
  const { data: contacts } = useContacts();
  const { data: companies } = useCompanies();
  const createTask = useCreateTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      contact_id: '',
      company_id: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createTask.mutateAsync({
      title: values.title,
      description: values.description || null,
      priority: values.priority,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      contact_id: values.contact_id || null,
      company_id: values.company_id || null,
      status: 'todo',
    });
    reset();
    onClose();
  };

  return (
    <DrawerRoot open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-radius-lg bg-accent/10 flex items-center justify-center">
              <CheckSquare size={16} className="text-accent" />
            </div>
            <div>
              <DrawerTitle>New Task</DrawerTitle>
              <DrawerDescription>Create a new task to track your work</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody>
          <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Title" error={errors.title?.message}>
              <Input
                placeholder="Send follow-up email to Sarah"
                {...register('title')}
              />
            </Field>

            <Field label="Description" error={errors.description?.message}>
              <textarea
                placeholder="Additional context…"
                rows={3}
                className={cn(
                  'w-full px-3 py-2 bg-bg-surface border border-border-default rounded-radius-md',
                  'text-sm text-text-primary placeholder:text-text-quaternary resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                )}
                {...register('description')}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Priority" error={errors.priority?.message}>
                <div className="relative">
                  <Flag size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${PRIORITY_COLORS['medium']}`} />
                  <select
                    {...register('priority')}
                    className={cn(
                      'w-full pl-8 pr-3 py-2 bg-bg-surface border border-border-default rounded-radius-md',
                      'text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent',
                    )}
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </Field>

              <Field label="Due Date" error={errors.due_date?.message}>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
                  <Input type="date" className="pl-8" {...register('due_date')} />
                </div>
              </Field>
            </div>

            <Field label="Contact" error={errors.contact_id?.message}>
              <select
                {...register('contact_id')}
                className={cn(
                  'w-full px-3 py-2 bg-bg-surface border border-border-default rounded-radius-md',
                  'text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent',
                )}
              >
                <option value="">No contact</option>
                {(contacts ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Company" error={errors.company_id?.message}>
              <select
                {...register('company_id')}
                className={cn(
                  'w-full px-3 py-2 bg-bg-surface border border-border-default rounded-radius-md',
                  'text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent',
                )}
              >
                <option value="">No company</option>
                {(companies ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
          </form>
        </DrawerBody>

        <DrawerFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="task-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating…' : 'Create Task'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
}

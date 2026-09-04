import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, Users, FileText, Calendar } from 'lucide-react';
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
import { useCreateActivity } from '../../hooks/use-activities';
import { useContacts } from '../../hooks/use-contacts';
import { useCompanies } from '../../hooks/use-companies';
import { cn } from '../../lib/utils';

const schema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note']).default('call'),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  contact_id: z.string().optional(),
  company_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call', Icon: Phone },
  { value: 'email', label: 'Email', Icon: Mail },
  { value: 'meeting', label: 'Meeting', Icon: Users },
  { value: 'note', label: 'Note', Icon: FileText },
] as const;

interface LogActivityDialogProps {
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

export function LogActivityDialog({ open, onClose }: LogActivityDialogProps) {
  const { data: contacts } = useContacts();
  const { data: companies } = useCompanies();
  const createActivity = useCreateActivity();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'call',
      subject: '',
      description: '',
      due_date: '',
      contact_id: '',
      company_id: '',
    },
  });

  const currentType = watch('type');

  const onSubmit = async (values: FormValues) => {
    await createActivity.mutateAsync({
      type: values.type,
      subject: values.subject,
      description: values.description || null,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
      contact_id: values.contact_id || null,
      company_id: values.company_id || null,
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
              <Phone size={16} className="text-accent" />
            </div>
            <div>
              <DrawerTitle>Log Activity</DrawerTitle>
              <DrawerDescription>Record a call, email, meeting, or note</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody>
          <form id="activity-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Type selector */}
            <Field label="Activity Type" error={errors.type?.message}>
              <div className="flex gap-2">
                {ACTIVITY_TYPES.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('type', value)}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-radius-md border text-xs font-[510] transition-colors',
                      currentType === value
                        ? 'bg-accent/10 border-accent/30 text-accent'
                        : 'bg-bg-surface border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary',
                    )}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Subject" error={errors.subject?.message}>
              <Input
                placeholder={
                  currentType === 'call'
                    ? 'Discovery call with Sarah Connor'
                    : currentType === 'email'
                    ? 'Sent pricing proposal'
                    : currentType === 'meeting'
                    ? 'Product demo — TechCorp team'
                    : 'Internal notes on deal status'
                }
                {...register('subject')}
              />
            </Field>

            <Field label="Notes" error={errors.description?.message}>
              <textarea
                placeholder="What happened? Key takeaways, action items…"
                rows={4}
                className={cn(
                  'w-full px-3 py-2 bg-bg-surface border border-border-default rounded-radius-md',
                  'text-sm text-text-primary placeholder:text-text-quaternary resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
                )}
                {...register('description')}
              />
            </Field>

            <Field label="Date / Time" error={errors.due_date?.message}>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
                <Input type="datetime-local" className="pl-8" {...register('due_date')} />
              </div>
            </Field>

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
            form="activity-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : 'Log Activity'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BarChart3, DollarSign, Calendar } from 'lucide-react';
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
import { useCreateDeal, useUpdateDeal, useDeal } from '../../hooks/use-deals';
import { usePipelineStages } from '../../hooks/use-pipeline-stages';
import { useContacts } from '../../hooks/use-contacts';
import { useCompanies } from '../../hooks/use-companies';
import { cn } from '../../lib/utils';

const schema = z.object({
  title: z.string().min(1, 'Deal title is required'),
  value: z.coerce.number().min(0, 'Value must be positive').optional(),
  stage_id: z.string().optional(),
  contact_id: z.string().optional(),
  company_id: z.string().optional(),
  status: z.enum(['open', 'won', 'lost']).default('open'),
  close_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface DealPanelProps {
  open: boolean;
  onClose: () => void;
  entityId?: string | null;
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

export function DealPanel({ open, onClose, entityId }: DealPanelProps) {
  const isEdit = Boolean(entityId);
  const { data: existing } = useDeal(entityId ?? '');
  const { data: stages } = usePipelineStages();
  const { data: contacts } = useContacts();
  const { data: companies } = useCompanies();
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      value: undefined,
      stage_id: '',
      contact_id: '',
      company_id: '',
      status: 'open',
      close_date: '',
    },
  });

  useEffect(() => {
    if (isEdit && existing) {
      reset({
        title: existing.title,
        value: existing.value ?? undefined,
        stage_id: existing.stage_id ?? '',
        contact_id: existing.contact_id ?? '',
        company_id: existing.company_id ?? '',
        status: existing.status,
        close_date: existing.close_date ? existing.close_date.slice(0, 10) : '',
      });
    } else if (!isEdit) {
      // Default to first stage
      reset({
        title: '',
        value: undefined,
        stage_id: stages?.[0]?.id ?? '',
        contact_id: '',
        company_id: '',
        status: 'open',
        close_date: '',
      });
    }
  }, [isEdit, existing, stages, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title,
      value: values.value ?? null,
      stage_id: values.stage_id || null,
      contact_id: values.contact_id || null,
      company_id: values.company_id || null,
      status: values.status,
      close_date: values.close_date ? new Date(values.close_date).toISOString() : null,
    };
    if (isEdit && entityId) {
      await updateDeal.mutateAsync({ id: entityId, ...payload });
    } else {
      await createDeal.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <DrawerRoot open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-radius-lg bg-accent/10 flex items-center justify-center">
              <BarChart3 size={16} className="text-accent" />
            </div>
            <div>
              <DrawerTitle>{isEdit ? 'Edit Deal' : 'New Deal'}</DrawerTitle>
              <DrawerDescription>
                {isEdit ? 'Update deal information' : 'Add a deal to your pipeline'}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody>
          <form id="deal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Deal Title" error={errors.title?.message}>
              <Input placeholder="Enterprise Cloud Migration" {...register('title')} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Value ($)" error={errors.value?.message}>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
                  <Input
                    type="number"
                    placeholder="10000"
                    className="pl-8"
                    {...register('value')}
                  />
                </div>
              </Field>

              <Field label="Close Date" error={errors.close_date?.message}>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
                  <Input
                    type="date"
                    className="pl-8"
                    {...register('close_date')}
                  />
                </div>
              </Field>
            </div>

            <Field label="Stage" error={errors.stage_id?.message}>
              <select
                {...register('stage_id')}
                className={cn(
                  'w-full px-3 py-2 bg-bg-surface border border-border-default rounded-radius-md',
                  'text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent',
                )}
              >
                <option value="">No stage</option>
                {(stages ?? []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Status" error={errors.status?.message}>
              <select
                {...register('status')}
                className={cn(
                  'w-full px-3 py-2 bg-bg-surface border border-border-default rounded-radius-md',
                  'text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent',
                )}
              >
                <option value="open">Open</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
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
            form="deal-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Deal'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
}

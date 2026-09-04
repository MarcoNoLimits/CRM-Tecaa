import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Globe, Users } from 'lucide-react';
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
import { useCreateCompany, useUpdateCompany, useCompany } from '../../hooks/use-companies';
import { cn } from '../../lib/utils';

const schema = z.object({
  name: z.string().min(1, 'Company name is required'),
  domain: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const INDUSTRIES = [
  'Technology', 'SaaS', 'Finance', 'Healthcare', 'Retail', 'Manufacturing',
  'Logistics', 'Education', 'Real Estate', 'Media', 'Consulting', 'Other',
];

const COMPANY_SIZES = [
  '1-10', '11-50', '51-200', '201-1000', '1001-5000', '5000+',
];

interface CompanyDrawerProps {
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

export function CompanyDrawer({ open, onClose, entityId }: CompanyDrawerProps) {
  const isEdit = Boolean(entityId);
  const { data: existing } = useCompany(entityId ?? '');
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', domain: '', website: '', industry: '', size: '' },
  });

  useEffect(() => {
    if (isEdit && existing) {
      reset({
        name: existing.name,
        domain: existing.domain ?? '',
        website: existing.website ?? '',
        industry: existing.industry ?? '',
        size: existing.size ?? '',
      });
    } else if (!isEdit) {
      reset({ name: '', domain: '', website: '', industry: '', size: '' });
    }
  }, [isEdit, existing, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      domain: values.domain || null,
      website: values.website || null,
      industry: values.industry || null,
      size: values.size || null,
    };
    if (isEdit && entityId) {
      await updateCompany.mutateAsync({ id: entityId, ...payload });
    } else {
      await createCompany.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <DrawerRoot open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-radius-lg bg-accent/10 flex items-center justify-center">
              <Building2 size={16} className="text-accent" />
            </div>
            <div>
              <DrawerTitle>{isEdit ? 'Edit Company' : 'New Company'}</DrawerTitle>
              <DrawerDescription>
                {isEdit ? 'Update company details' : 'Add a new company account'}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody>
          <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Company Name" error={errors.name?.message}>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
                <Input placeholder="Acme Corp" className="pl-8" {...register('name')} />
              </div>
            </Field>

            <Field label="Domain" error={errors.domain?.message}>
              <Input placeholder="acme.com" {...register('domain')} />
            </Field>

            <Field label="Website" error={errors.website?.message}>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
                <Input placeholder="https://acme.com" className="pl-8" {...register('website')} />
              </div>
            </Field>

            <Field label="Industry" error={errors.industry?.message}>
              <select
                {...register('industry')}
                className={cn(
                  'w-full px-3 py-2 bg-bg-surface border border-border-default rounded-radius-md',
                  'text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent',
                )}
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </Field>

            <Field label="Company Size" error={errors.size?.message}>
              <div className="relative">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
                <select
                  {...register('size')}
                  className={cn(
                    'w-full pl-8 pr-3 py-2 bg-bg-surface border border-border-default rounded-radius-md',
                    'text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent',
                  )}
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((s) => (
                    <option key={s} value={s}>{s} employees</option>
                  ))}
                </select>
              </div>
            </Field>
          </form>
        </DrawerBody>

        <DrawerFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="company-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Company'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
}

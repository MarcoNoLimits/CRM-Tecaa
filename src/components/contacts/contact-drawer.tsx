import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Building2, Mail, Phone } from 'lucide-react';
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
import { useCreateContact, useUpdateContact, useContact } from '../../hooks/use-contacts';
import { useCompanies } from '../../hooks/use-companies';
import { cn } from '../../lib/utils';

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company_id: z.string().optional(),
  status: z.enum(['active', 'inactive', 'lead', 'archived']).default('active'),
});

type FormValues = z.infer<typeof schema>;

interface ContactDrawerProps {
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

export function ContactDrawer({ open, onClose, entityId }: ContactDrawerProps) {
  const isEdit = Boolean(entityId);
  const { data: existing } = useContact(entityId ?? '');
  const { data: companies } = useCompanies();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company_id: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (isEdit && existing) {
      reset({
        first_name: existing.first_name,
        last_name: existing.last_name,
        email: existing.email ?? '',
        phone: existing.phone ?? '',
        company_id: existing.company_id ?? '',
        status: existing.status,
      });
    } else if (!isEdit) {
      reset({ first_name: '', last_name: '', email: '', phone: '', company_id: '', status: 'active' });
    }
  }, [isEdit, existing, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email || null,
      phone: values.phone || null,
      company_id: values.company_id || null,
      status: values.status,
    };
    if (isEdit && entityId) {
      await updateContact.mutateAsync({ id: entityId, ...payload });
    } else {
      await createContact.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <DrawerRoot open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-radius-lg bg-accent/10 flex items-center justify-center">
              <User size={16} className="text-accent" />
            </div>
            <div>
              <DrawerTitle>{isEdit ? 'Edit Contact' : 'New Contact'}</DrawerTitle>
              <DrawerDescription>
                {isEdit ? 'Update contact details' : 'Add a new contact to your CRM'}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody>
          <form id="contact-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name" error={errors.first_name?.message}>
                <Input placeholder="Sarah" {...register('first_name')} />
              </Field>
              <Field label="Last Name" error={errors.last_name?.message}>
                <Input placeholder="Connor" {...register('last_name')} />
              </Field>
            </div>

            <Field label="Email" error={errors.email?.message}>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
                <Input
                  placeholder="sarah@example.com"
                  className="pl-8"
                  {...register('email')}
                />
              </div>
            </Field>

            <Field label="Phone" error={errors.phone?.message}>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
                <Input
                  placeholder="+1 555 0192"
                  className="pl-8"
                  {...register('phone')}
                />
              </div>
            </Field>

            <Field label="Company" error={errors.company_id?.message}>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary pointer-events-none" />
                <select
                  {...register('company_id')}
                  className={cn(
                    'w-full pl-8 pr-3 py-2 bg-bg-surface border border-border-default rounded-radius-md',
                    'text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent',
                  )}
                >
                  <option value="">No company</option>
                  {(companies ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </Field>

            <Field label="Status" error={errors.status?.message}>
              <select
                {...register('status')}
                className={cn(
                  'w-full px-3 py-2 bg-bg-surface border border-border-default rounded-radius-md',
                  'text-sm text-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-accent',
                )}
              >
                <option value="active">Active</option>
                <option value="lead">Lead</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </form>
        </DrawerBody>

        <DrawerFooter>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="contact-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Contact'}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
}

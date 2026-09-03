import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { ContactWithCompany, ContactInsert, ContactUpdate } from '../types/schema';

export function useContacts(search?: string) {
  return useQuery({
    queryKey: ['contacts', search],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select('*, companies(id, name)')
        .order('created_at', { ascending: false });
      if (search) {
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`,
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ContactWithCompany[];
    },
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*, companies(id, name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as ContactWithCompany;
    },
    enabled: Boolean(id),
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ContactInsert) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert(payload)
        .select('*, companies(id, name)')
        .single();
      if (error) throw error;
      return data as unknown as ContactWithCompany;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['contacts'] });
      const previousList = queryClient.getQueryData<ContactWithCompany[]>(['contacts', undefined]);
      queryClient.setQueryData<ContactWithCompany[]>(['contacts', undefined], (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          first_name: newData.first_name,
          last_name: newData.last_name,
          email: newData.email ?? null,
          phone: newData.phone ?? null,
          company_id: newData.company_id ?? null,
          status: newData.status ?? 'lead',
          owner_id: newData.owner_id ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          companies: null,
        },
      ]);
      return { previousList };
    },
    onError: (_err, _data, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['contacts', undefined], context.previousList);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: ContactUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(payload)
        .eq('id', id)
        .select('*, companies(id, name)')
        .single();
      if (error) throw error;
      return data as unknown as ContactWithCompany;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['contacts'] });
      const previousList = queryClient.getQueryData<ContactWithCompany[]>(['contacts', undefined]);
      const previousItem = queryClient.getQueryData<ContactWithCompany>(['contacts', id]);
      queryClient.setQueryData<ContactWithCompany[]>(['contacts', undefined], (old) =>
        (old ?? []).map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
      queryClient.setQueryData<ContactWithCompany>(['contacts', id], (old) =>
        old ? { ...old, ...updates } : old,
      );
      return { previousList, previousItem };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['contacts', undefined], context.previousList);
      if (context?.previousItem)
        queryClient.setQueryData(['contacts', id], context.previousItem);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts', id] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['contacts'] });
      const previousList = queryClient.getQueryData<ContactWithCompany[]>(['contacts', undefined]);
      queryClient.setQueryData<ContactWithCompany[]>(['contacts', undefined], (old) =>
        (old ?? []).filter((c) => c.id !== id),
      );
      return { previousList };
    },
    onError: (_err, _id, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['contacts', undefined], context.previousList);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

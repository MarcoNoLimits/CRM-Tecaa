import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Company, CompanyInsert, CompanyUpdate } from '../types/schema';

export function useCompanies(search?: string) {
  return useQuery({
    queryKey: ['companies', search],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Company[];
    },
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as Company;
    },
    enabled: Boolean(id),
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CompanyInsert) => {
      const { data, error } = await supabase
        .from('companies')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Company;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['companies'] });
      const previousList = queryClient.getQueryData<Company[]>(['companies', undefined]);
      queryClient.setQueryData<Company[]>(['companies', undefined], (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          name: newData.name,
          domain: newData.domain ?? null,
          industry: newData.industry ?? null,
          size: newData.size ?? null,
          website: newData.website ?? null,
          owner_id: newData.owner_id ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      return { previousList };
    },
    onError: (_err, _data, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['companies', undefined], context.previousList);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: CompanyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('companies')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Company;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['companies'] });
      const previousList = queryClient.getQueryData<Company[]>(['companies', undefined]);
      const previousItem = queryClient.getQueryData<Company>(['companies', id]);
      queryClient.setQueryData<Company[]>(['companies', undefined], (old) =>
        (old ?? []).map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );
      queryClient.setQueryData<Company>(['companies', id], (old) =>
        old ? { ...old, ...updates } : old,
      );
      return { previousList, previousItem };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['companies', undefined], context.previousList);
      if (context?.previousItem)
        queryClient.setQueryData(['companies', id], context.previousItem);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companies', id] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['companies'] });
      const previousList = queryClient.getQueryData<Company[]>(['companies', undefined]);
      queryClient.setQueryData<Company[]>(['companies', undefined], (old) =>
        (old ?? []).filter((c) => c.id !== id),
      );
      return { previousList };
    },
    onError: (_err, _id, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['companies', undefined], context.previousList);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
}

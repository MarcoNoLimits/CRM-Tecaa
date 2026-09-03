import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { ActivityWithRelations, ActivityInsert, ActivityUpdate } from '../types/schema';

interface ActivityFilters {
  type?: string;
  contact_id?: string;
  company_id?: string;
  deal_id?: string;
}

export function useActivities(filters?: ActivityFilters) {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select('*, contacts(id, first_name, last_name), companies(id, name), deals(id, title)')
        .order('created_at', { ascending: false });
      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.contact_id) query = query.eq('contact_id', filters.contact_id);
      if (filters?.company_id) query = query.eq('company_id', filters.company_id);
      if (filters?.deal_id) query = query.eq('deal_id', filters.deal_id);
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ActivityWithRelations[];
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ActivityInsert) => {
      const { data, error } = await supabase
        .from('activities')
        .insert(payload)
        .select('*, contacts(id, first_name, last_name), companies(id, name), deals(id, title)')
        .single();
      if (error) throw error;
      return data as unknown as ActivityWithRelations;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      const previousList = queryClient.getQueryData<ActivityWithRelations[]>(['activities', undefined]);
      queryClient.setQueryData<ActivityWithRelations[]>(['activities', undefined], (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          type: newData.type,
          subject: newData.subject,
          description: newData.description ?? null,
          contact_id: newData.contact_id ?? null,
          company_id: newData.company_id ?? null,
          deal_id: newData.deal_id ?? null,
          owner_id: newData.owner_id ?? null,
          due_date: newData.due_date ?? null,
          completed_at: newData.completed_at ?? null,
          created_by: newData.created_by ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          contacts: null,
          companies: null,
          deals: null,
        },
      ]);
      return { previousList };
    },
    onError: (_err, _data, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['activities', undefined], context.previousList);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: ActivityUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('activities')
        .update(payload)
        .eq('id', id)
        .select('*, contacts(id, first_name, last_name), companies(id, name), deals(id, title)')
        .single();
      if (error) throw error;
      return data as unknown as ActivityWithRelations;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      const previous = queryClient.getQueryData<ActivityWithRelations[]>(['activities', undefined]);
      queryClient.setQueryData<ActivityWithRelations[]>(['activities', undefined], (old) =>
        (old ?? []).map((a) => (a.id === id ? { ...a, ...updates } : a)),
      );
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous)
        queryClient.setQueryData(['activities', undefined], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['activities'] });
      const previous = queryClient.getQueryData<ActivityWithRelations[]>(['activities', undefined]);
      queryClient.setQueryData<ActivityWithRelations[]>(['activities', undefined], (old) =>
        (old ?? []).filter((a) => a.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous)
        queryClient.setQueryData(['activities', undefined], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });
}

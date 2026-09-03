import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { TaskWithAssignee, TaskInsert, TaskUpdate } from '../types/schema';

interface TaskFilters {
  status?: string;
  assignee_id?: string;
  contact_id?: string;
  deal_id?: string;
}

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*, profiles(id, full_name)')
        .order('created_at', { ascending: false });
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.assignee_id) query = query.eq('assignee_id', filters.assignee_id);
      if (filters?.contact_id) query = query.eq('contact_id', filters.contact_id);
      if (filters?.deal_id) query = query.eq('deal_id', filters.deal_id);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as TaskWithAssignee[];
    },
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles(id, full_name)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as TaskWithAssignee;
    },
    enabled: Boolean(id),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TaskInsert) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(payload)
        .select('*, profiles(id, full_name)')
        .single();
      if (error) throw error;
      return data as unknown as TaskWithAssignee;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousList = queryClient.getQueryData<TaskWithAssignee[]>(['tasks', undefined]);
      queryClient.setQueryData<TaskWithAssignee[]>(['tasks', undefined], (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          title: newData.title,
          description: newData.description ?? null,
          status: (newData.status ?? 'todo') as TaskWithAssignee['status'],
          priority: (newData.priority ?? 'medium') as TaskWithAssignee['priority'],
          assignee_id: newData.assignee_id ?? null,
          contact_id: newData.contact_id ?? null,
          company_id: newData.company_id ?? null,
          deal_id: newData.deal_id ?? null,
          created_by: newData.created_by ?? null,
          due_date: newData.due_date ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profiles: null,
        },
      ]);
      return { previousList };
    },
    onError: (_err, _data, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['tasks', undefined], context.previousList);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: TaskUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id)
        .select('*, profiles(id, full_name)')
        .single();
      if (error) throw error;
      return data as unknown as TaskWithAssignee;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousList = queryClient.getQueryData<TaskWithAssignee[]>(['tasks', undefined]);
      const previousItem = queryClient.getQueryData<TaskWithAssignee>(['tasks', 'detail', id]);
      queryClient.setQueryData<TaskWithAssignee[]>(['tasks', undefined], (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );
      queryClient.setQueryData<TaskWithAssignee>(['tasks', 'detail', id], (old) =>
        old ? { ...old, ...updates } : old,
      );
      return { previousList, previousItem };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['tasks', undefined], context.previousList);
      if (context?.previousItem)
        queryClient.setQueryData(['tasks', 'detail', id], context.previousItem);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousList = queryClient.getQueryData<TaskWithAssignee[]>(['tasks', undefined]);
      queryClient.setQueryData<TaskWithAssignee[]>(['tasks', undefined], (old) =>
        (old ?? []).filter((t) => t.id !== id),
      );
      return { previousList };
    },
    onError: (_err, _id, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['tasks', undefined], context.previousList);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = queryClient.getQueryData<TaskWithAssignee[]>(['tasks', undefined]);
      const task = current?.find((t) => t.id === id);
      const newStatus = task?.status === 'done' ? 'todo' : 'done';
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*, profiles(id, full_name)')
        .single();
      if (error) throw error;
      return data as unknown as TaskWithAssignee;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousList = queryClient.getQueryData<TaskWithAssignee[]>(['tasks', undefined]);
      queryClient.setQueryData<TaskWithAssignee[]>(['tasks', undefined], (old) =>
        (old ?? []).map((t) =>
          t.id === id
            ? { ...t, status: (t.status === 'done' ? 'todo' : 'done') as TaskWithAssignee['status'] }
            : t,
        ),
      );
      return { previousList };
    },
    onError: (_err, _id, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['tasks', undefined], context.previousList);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { DealWithRelations, DealInsert, DealUpdate } from '../types/schema';

export function useDeals(stageId?: string) {
  return useQuery({
    queryKey: ['deals', stageId],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select(
          '*, contacts(id, first_name, last_name), companies(id, name), pipeline_stages(id, name, color, position)',
        )
        .order('created_at', { ascending: false });
      if (stageId) {
        query = query.eq('stage_id', stageId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as DealWithRelations[];
    },
  });
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deals', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(
          '*, contacts(id, first_name, last_name), companies(id, name), pipeline_stages(id, name, color, position)',
        )
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as DealWithRelations;
    },
    enabled: Boolean(id),
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DealInsert) => {
      const { data, error } = await supabase
        .from('deals')
        .insert(payload)
        .select(
          '*, contacts(id, first_name, last_name), companies(id, name), pipeline_stages(id, name, color, position)',
        )
        .single();
      if (error) throw error;
      return data as unknown as DealWithRelations;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['deals'] });
      const previousList = queryClient.getQueryData<DealWithRelations[]>(['deals', undefined]);
      queryClient.setQueryData<DealWithRelations[]>(['deals', undefined], (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          title: newData.title,
          value: newData.value ?? null,
          stage_id: newData.stage_id ?? null,
          contact_id: newData.contact_id ?? null,
          company_id: newData.company_id ?? null,
          owner_id: newData.owner_id ?? null,
          status: newData.status ?? 'open',
          close_date: newData.close_date ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          contacts: null,
          companies: null,
          pipeline_stages: null,
        },
      ]);
      return { previousList };
    },
    onError: (_err, _data, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['deals', undefined], context.previousList);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: DealUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('deals')
        .update(payload)
        .eq('id', id)
        .select(
          '*, contacts(id, first_name, last_name), companies(id, name), pipeline_stages(id, name, color, position)',
        )
        .single();
      if (error) throw error;
      return data as unknown as DealWithRelations;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['deals'] });
      const previousList = queryClient.getQueryData<DealWithRelations[]>(['deals', undefined]);
      const previousItem = queryClient.getQueryData<DealWithRelations>(['deals', 'detail', id]);
      queryClient.setQueryData<DealWithRelations[]>(['deals', undefined], (old) =>
        (old ?? []).map((d) => (d.id === id ? { ...d, ...updates } : d)),
      );
      queryClient.setQueryData<DealWithRelations>(['deals', 'detail', id], (old) =>
        old ? { ...old, ...updates } : old,
      );
      return { previousList, previousItem };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['deals', undefined], context.previousList);
      if (context?.previousItem)
        queryClient.setQueryData(['deals', 'detail', id], context.previousItem);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', 'detail', id] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('deals').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['deals'] });
      const previousList = queryClient.getQueryData<DealWithRelations[]>(['deals', undefined]);
      queryClient.setQueryData<DealWithRelations[]>(['deals', undefined], (old) =>
        (old ?? []).filter((d) => d.id !== id),
      );
      return { previousList };
    },
    onError: (_err, _id, context) => {
      if (context?.previousList)
        queryClient.setQueryData(['deals', undefined], context.previousList);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function useMoveToStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      const { data, error } = await supabase
        .from('deals')
        .update({ stage_id: stageId, updated_at: new Date().toISOString() })
        .eq('id', dealId)
        .select(
          '*, contacts(id, first_name, last_name), companies(id, name), pipeline_stages(id, name, color, position)',
        )
        .single();
      if (error) throw error;
      return data as unknown as DealWithRelations;
    },
    onMutate: async ({ dealId, stageId }) => {
      await queryClient.cancelQueries({ queryKey: ['deals'] });
      const snapshots: Array<[unknown[], DealWithRelations[] | undefined]> = [];
      queryClient
        .getQueriesData<DealWithRelations[]>({ queryKey: ['deals'] })
        .forEach(([queryKey, data]) => {
          snapshots.push([queryKey as unknown[], data]);
          queryClient.setQueryData<DealWithRelations[]>(queryKey as unknown[], (old) =>
            (old ?? []).map((d) => (d.id === dealId ? { ...d, stage_id: stageId } : d)),
          );
        });
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey as unknown[], data);
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });
}

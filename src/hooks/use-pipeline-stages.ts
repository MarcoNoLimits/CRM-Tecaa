import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PipelineStage, PipelineStageInsert, PipelineStageUpdate } from '../types/schema';

export function usePipelineStages() {
  return useQuery({
    queryKey: ['pipeline_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('position', { ascending: true });
      if (error) throw error;
      return data as unknown as PipelineStage[];
    },
  });
}

export function useCreateStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PipelineStageInsert) => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as PipelineStage;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['pipeline_stages'] });
      const previous = queryClient.getQueryData<PipelineStage[]>(['pipeline_stages']);
      queryClient.setQueryData<PipelineStage[]>(['pipeline_stages'], (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`,
          name: newData.name,
          color: newData.color ?? null,
          position: newData.position,
          probability: newData.probability ?? 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) queryClient.setQueryData(['pipeline_stages'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['pipeline_stages'] }),
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: PipelineStageUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as PipelineStage;
    },
    onMutate: async ({ id, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: ['pipeline_stages'] });
      const previous = queryClient.getQueryData<PipelineStage[]>(['pipeline_stages']);
      queryClient.setQueryData<PipelineStage[]>(['pipeline_stages'], (old) =>
        (old ?? []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) queryClient.setQueryData(['pipeline_stages'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['pipeline_stages'] }),
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pipeline_stages').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['pipeline_stages'] });
      const previous = queryClient.getQueryData<PipelineStage[]>(['pipeline_stages']);
      queryClient.setQueryData<PipelineStage[]>(['pipeline_stages'], (old) =>
        (old ?? []).filter((s) => s.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['pipeline_stages'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['pipeline_stages'] }),
  });
}

export function useReorderStages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stages: Array<{ id: string; position: number }>) => {
      const updates = stages.map(({ id, position }) =>
        supabase
          .from('pipeline_stages')
          .update({ position, updated_at: new Date().toISOString() })
          .eq('id', id),
      );
      const results = await Promise.all(updates);
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) throw firstError;
    },
    onMutate: async (stages) => {
      await queryClient.cancelQueries({ queryKey: ['pipeline_stages'] });
      const previous = queryClient.getQueryData<PipelineStage[]>(['pipeline_stages']);
      const posMap = new Map(stages.map(({ id, position }) => [id, position]));
      queryClient.setQueryData<PipelineStage[]>(['pipeline_stages'], (old) =>
        (old ?? [])
          .map((s) => ({ ...s, position: posMap.get(s.id) ?? s.position }))
          .sort((a, b) => a.position - b.position),
      );
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) queryClient.setQueryData(['pipeline_stages'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['pipeline_stages'] }),
  });
}

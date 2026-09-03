import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { isToday, isPast } from 'date-fns';
import type { DealWithRelations, ActivityWithRelations } from '../types/schema';

export function useDashboardStats() {
  const { data: contacts, isLoading: loadingContacts } = useQuery({
    queryKey: ['dashboard', 'contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: deals, isLoading: loadingDeals } = useQuery({
    queryKey: ['dashboard', 'deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(
          '*, contacts(id, first_name, last_name), companies(id, name), pipeline_stages(id, name, color, position)',
        )
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as DealWithRelations[];
    },
  });

  const { data: activities, isLoading: loadingActivities } = useQuery({
    queryKey: ['dashboard', 'activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*, contacts(id, first_name, last_name), companies(id, name), deals(id, title)')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data as unknown as ActivityWithRelations[];
    },
  });

  const { data: tasks, isLoading: loadingTasks } = useQuery({
    queryKey: ['dashboard', 'tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, status, due_date, created_at')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data as Array<{ id: string; status: string; due_date: string | null; created_at: string }>;
    },
  });

  const stats = useMemo(() => {
    const openDeals = (deals ?? []).filter((d) => d.status === 'open');
    const activeDeals = openDeals.length;
    const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);

    const activitiesToday = (activities ?? []).filter(
      (a) => a.due_date && isToday(new Date(a.due_date)),
    ).length;

    const tasksOverdue = (tasks ?? []).filter(
      (t) => t.status !== 'done' && t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)),
    ).length;

    const recentDeals = (deals ?? []).slice(0, 5);

    const upcomingActivities = (activities ?? [])
      .filter((a) => a.due_date && !isPast(new Date(a.due_date)))
      .slice(0, 5);

    return {
      activeDeals,
      pipelineValue,
      activitiesToday,
      tasksOverdue,
      totalContacts: (contacts ?? []).length,
      recentDeals,
      upcomingActivities,
    };
  }, [contacts, deals, activities, tasks]);

  const isLoading = loadingContacts || loadingDeals || loadingActivities || loadingTasks;

  return { ...stats, isLoading };
}

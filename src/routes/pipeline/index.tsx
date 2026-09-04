import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Plus, User } from 'lucide-react';
import { Skeleton } from '../../components/ui';
import { useUIStore } from '../../stores/ui-store';
import type { DealWithRelations, PipelineStage } from '../../types/schema';

function formatValue(value: number | null): string {
  if (value == null) return '';
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

function DealCard({ deal, isDragging }: { deal: DealWithRelations; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: deal.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-bg-surface hover:bg-bg-surface-2 border border-border-default rounded-radius-lg p-3 cursor-grab active:cursor-grabbing transition-colors select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-[510] text-text-primary leading-tight">{deal.title}</p>
        {deal.value != null && (
          <span className="text-xs font-[510] text-text-secondary shrink-0">{formatValue(deal.value)}</span>
        )}
      </div>
      {deal.contacts && (
        <div className="flex items-center gap-1.5">
          <User size={11} className="text-text-quaternary" />
          <span className="text-xs text-text-tertiary">
            {deal.contacts.first_name} {deal.contacts.last_name}
          </span>
        </div>
      )}
      {deal.pipeline_stages?.probability != null && deal.pipeline_stages.probability > 0 && (
        <div className="mt-2">
          <span className="text-xs text-text-quaternary">{deal.pipeline_stages.probability}% likely</span>
        </div>
      )}
    </div>
  );
}

function StageColumn({
  stage,
  deals,
}: {
  stage: PipelineStage;
  deals: DealWithRelations[];
}) {
  const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div className="flex flex-col w-72 shrink-0 bg-bg-panel border border-border-default rounded-radius-lg overflow-hidden">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border-subtle">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: stage.color ?? '#5e6ad2' }}
        />
        <span className="text-sm font-[510] text-text-primary flex-1 truncate">{stage.name}</span>
        <span className="text-xs text-text-quaternary bg-bg-surface px-1.5 py-0.5 rounded-radius-full">
          {deals.length}
        </span>
        {totalValue > 0 && (
          <span className="text-xs text-text-tertiary">{formatValue(totalValue)}</span>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[120px]">
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <p className="text-xs text-text-quaternary">No deals</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelineIndex() {
  const queryClient = useQueryClient();
  const [activeDeal, setActiveDeal] = useState<DealWithRelations | null>(null);
  const { openDrawer } = useUIStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const { data: stages, isLoading: loadingStages } = useQuery({
    queryKey: ['pipeline_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('position', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as PipelineStage[];
    },
  });

  const { data: deals, isLoading: loadingDeals } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, contacts(id, first_name, last_name), companies(id, name), pipeline_stages(id, name, color, position, probability)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DealWithRelations[];
    },
  });

  const moveDeal = useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      const { error } = await supabase
        .from('deals')
        .update({ stage_id: stageId, updated_at: new Date().toISOString() })
        .eq('id', dealId);
      if (error) throw error;
    },
    onMutate: async ({ dealId, stageId }) => {
      await queryClient.cancelQueries({ queryKey: ['deals'] });
      const previous = queryClient.getQueryData<DealWithRelations[]>(['deals']);
      queryClient.setQueryData<DealWithRelations[]>(['deals'], (old) =>
        (old ?? []).map((d) => (d.id === dealId ? { ...d, stage_id: stageId } : d)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['deals'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });

  const dealsByStage = useCallback((stageId: string) => {
    return (deals ?? []).filter((d) => d.stage_id === stageId);
  }, [deals]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const deal = (deals ?? []).find((d) => d.id === event.active.id);
    setActiveDeal(deal ?? null);
  }, [deals]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);
    if (!over || active.id === over.id) return;
    // "over" could be a deal id or a stage id — find destination stage
    const overDeal = (deals ?? []).find((d) => d.id === over.id);
    const overStageId = overDeal?.stage_id ?? (stages ?? []).find((s) => s.id === over.id)?.id;
    if (overStageId && overStageId !== activeDeal?.stage_id) {
      moveDeal.mutate({ dealId: active.id as string, stageId: overStageId });
    }
  }, [deals, stages, activeDeal, moveDeal]);

  const isLoading = loadingStages || loadingDeals;

  return (
    <div className="p-6 space-y-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[590] text-text-primary">Pipeline</h1>
          <p className="text-sm text-text-tertiary mt-0.5">
            {deals ? `${deals.length} deal${deals.length !== 1 ? 's' : ''}` : 'Loading…'}
          </p>
        </div>
        <button
          onClick={() => openDrawer('deal')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-[510] rounded-radius-md transition-colors"
        >
          <Plus size={15} />
          New Deal
        </button>
      </div>

      {/* Kanban board */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-72 h-64 shrink-0 rounded-radius-lg" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
            {(stages ?? []).map((stage) => (
              <StageColumn
                key={stage.id}
                stage={stage}
                deals={dealsByStage(stage.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeDeal && (
              <div className="bg-bg-surface border border-accent/40 rounded-radius-lg p-3 shadow-xl w-72 rotate-1">
                <p className="text-sm font-[510] text-text-primary">{activeDeal.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

"use client";

import { Deal } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { DealCard } from "./DealCard";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

const STAGES: Deal['stage'][] = ['Lead', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'];

const STAGE_CONFIG = {
  'Lead': { color: 'bg-slate-200 border-slate-300 text-slate-700' },
  'Contacted': { color: 'bg-blue-200 border-blue-300 text-blue-700' },
  'Proposal': { color: 'bg-yellow-200 border-yellow-300 text-yellow-800' },
  'Negotiation': { color: 'bg-orange-200 border-orange-300 text-orange-800' },
  'Won': { color: 'bg-green-200 border-green-300 text-green-800' },
  'Lost': { color: 'bg-red-200 border-red-300 text-red-800' },
};

// Sortable Column Component
function KanbanColumn({ 
  stage, 
  deals, 
  onEditDeal 
}: { 
  stage: Deal['stage']; 
  deals: Deal[]; 
  onEditDeal: (deal: Deal) => void 
}) {
  const { setNodeRef } = useSortable({ id: stage, data: { type: 'Column', stage } });
  
  const totalValue = deals.reduce((sum, d) => sum + Number(d.value), 0);

  return (
    <div className="flex flex-col bg-muted/30 rounded-xl min-w-[300px] max-w-[300px] h-full overflow-hidden border border-border">
      <div className={`px-4 py-3 border-b border-border flex items-center justify-between bg-card`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${STAGE_CONFIG[stage].color.split(' ')[0]}`} />
          <h3 className="font-bold text-foreground">{stage}</h3>
          <span className="text-xs font-semibold bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{deals.length}</span>
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          {formatCurrency(totalValue)}
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map(deal => (
            <SortableDealCard key={deal.id} deal={deal} onEdit={onEditDeal} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

// Sortable Card Wrapper
function SortableDealCard({ deal, onEdit }: { deal: Deal; onEdit: (deal: Deal) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: 'Deal', deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DealCard deal={deal} onEdit={() => onEdit(deal)} />
    </div>
  );
}

interface KanbanBoardProps {
  deals: Deal[];
  onStageChange: (dealId: string, newStage: Deal['stage']) => void;
  onEditDeal: (deal: Deal) => void;
}

export function KanbanBoard({ deals, onStageChange, onEditDeal }: KanbanBoardProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Deal') {
      setActiveDeal(active.data.current.deal);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const activeDeal = active.data.current?.deal as Deal;
    
    // Dropped over a column directly
    if (over.data.current?.type === 'Column') {
      const newStage = over.id as Deal['stage'];
      if (activeDeal && activeDeal.stage !== newStage) {
        onStageChange(activeDeal.id, newStage);
      }
      return;
    }

    // Dropped over another deal card
    if (over.data.current?.type === 'Deal') {
      const overDeal = over.data.current.deal as Deal;
      if (activeDeal && activeDeal.stage !== overDeal.stage) {
        onStageChange(activeDeal.id, overDeal.stage);
      }
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full pb-2">
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          return (
            <KanbanColumn 
              key={stage} 
              stage={stage} 
              deals={stageDeals} 
              onEditDeal={onEditDeal} 
            />
          );
        })}
      </div>
      
      {/* Drag Overlay for smooth visuals */}
      <DragOverlay>
        {activeDeal ? (
          <div className="opacity-80 rotate-2 scale-105 cursor-grabbing shadow-2xl">
            <DealCard deal={activeDeal} onEdit={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

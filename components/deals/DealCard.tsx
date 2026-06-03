"use client";

import { Deal } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Building2, Calendar, Edit2 } from "lucide-react";

interface DealCardProps {
  deal: Deal;
  onEdit: () => void;
}

export function DealCard({ deal, onEdit }: DealCardProps) {
  // Try to extract initials from owner_name
  const initials = deal.owner_name
    ? deal.owner_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'VM'; // Fallback initials

  return (
    <div className="group bg-white p-3 rounded-lg border border-slate-200 shadow-sm cursor-grab hover:shadow-md hover:border-indigo-200 transition-all active:cursor-grabbing relative">
      
      {/* Edit Button (Visible on Hover) */}
      <button 
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="absolute top-3 right-3 p-1.5 bg-white border border-slate-200 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 hover:border-indigo-200 transition-all z-10"
        title="Edit Deal"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>

      <div className="pr-8">
        <h4 className="font-bold text-sm text-slate-900 leading-tight mb-1">{deal.title}</h4>
        
        {deal.customer_name && (
          <div className="flex items-center text-xs text-slate-500 mb-2 gap-1.5">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{deal.customer_name}</span>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between mt-3">
        <div className="space-y-1">
          <div className="font-semibold text-slate-900 text-sm">
            {formatCurrency(deal.value)}
          </div>
          {deal.expected_close_date && (
            <div className="flex items-center text-[11px] text-slate-500 gap-1 font-medium">
              <Calendar className="w-3 h-3" />
              {formatDate(deal.expected_close_date)}
            </div>
          )}
        </div>
        
        <div 
          className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold border border-slate-200"
          title={deal.owner_name || 'Owner'}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}

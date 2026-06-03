"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Deal } from "@/lib/types";
import { KanbanBoard } from "@/components/deals/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DealForm } from "@/components/deals/DealForm";
import { toast } from "react-hot-toast";

export default function DealsPage() {
  const supabase = createClient();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const fetchDeals = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('business_id', profile.business_id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error("Failed to load deals");
    } else {
      setDeals(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleUpdateDealStage = async (dealId: string, newStage: Deal['stage']) => {
    // Optimistic UI update
    setDeals(prevDeals => 
      prevDeals.map(d => d.id === dealId ? { ...d, stage: newStage, updated_at: new Date().toISOString() } : d)
    );

    const { error } = await supabase
      .from('deals')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', dealId);

    if (error) {
      toast.error("Failed to update deal stage");
      fetchDeals(); // revert
    }
  };

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsFormOpen(true);
  };

  return (
    <div className="p-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-900">Sales Pipeline</h2>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => { setSelectedDeal(null); setIsFormOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" /> Naya Deal
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        {loading ? (
          <div className="text-center text-slate-500 mt-20">Loading pipeline...</div>
        ) : (
          <KanbanBoard 
            deals={deals} 
            onStageChange={handleUpdateDealStage} 
            onEditDeal={handleEdit} 
          />
        )}
      </div>

      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto w-full">
          <DealForm 
            deal={selectedDeal} 
            onSuccess={() => { setIsFormOpen(false); fetchDeals(); }} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

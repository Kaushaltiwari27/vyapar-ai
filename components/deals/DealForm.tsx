"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Deal, Customer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "react-hot-toast";

interface DealFormProps {
  deal?: Deal | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const STAGES = ['Lead', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export function DealForm({ deal, onSuccess, onCancel }: DealFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [title, setTitle] = useState(deal?.title || "");
  const [customerId, setCustomerId] = useState(deal?.customer_id || "");
  const [value, setValue] = useState(deal?.value?.toString() || "");
  const [stage, setStage] = useState(deal?.stage || "Lead");
  const [expectedCloseDate, setExpectedCloseDate] = useState(deal?.expected_close_date || "");
  const [ownerName, setOwnerName] = useState(deal?.owner_name || "");
  const [notes, setNotes] = useState(deal?.notes || "");

  useEffect(() => {
    async function loadInitialData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('business_id, full_name').eq('id', user.id).single();
      if (!profile?.business_id) return;

      // Auto-fill owner name if new deal
      if (!deal && profile.full_name) {
        setOwnerName(profile.full_name);
      }

      // Fetch customers for dropdown
      const { data: custData } = await supabase
        .from('customers')
        .select('id, name')
        .eq('business_id', profile.business_id)
        .order('name');
      
      if (custData) setCustomers(custData as Customer[]);
    }
    loadInitialData();
  }, [supabase, deal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User not found");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) {
      toast.error("Business not found");
      setLoading(false);
      return;
    }

    const selectedCustomer = customers.find(c => c.id === customerId);

    const payload = {
      business_id: profile.business_id,
      title,
      customer_id: customerId || null,
      customer_name: selectedCustomer ? selectedCustomer.name : null,
      value: value ? Number(value) : 0,
      stage,
      expected_close_date: expectedCloseDate || null,
      owner_name: ownerName,
      notes,
    };

    let error;

    if (deal?.id) {
      const res = await supabase.from('deals').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', deal.id);
      error = res.error;
    } else {
      const res = await supabase.from('deals').insert([payload]);
      error = res.error;
    }

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success(deal?.id ? "Deal updated successfully" : "Deal created successfully");
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="mb-6">
        <SheetTitle>{deal ? "Edit Deal" : "New Deal"}</SheetTitle>
        <SheetDescription>
          {deal ? "Deal details update karein." : "Naye deal ki details enter karein."}
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Deal Title *</Label>
          <Input id="title" placeholder="e.g. 500 T-Shirts Order" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customer">Customer</Label>
          <Select value={customerId} onValueChange={(val) => setCustomerId(val || "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="value">Value (₹)</Label>
            <Input id="value" type="number" min="0" step="any" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stage">Stage</Label>
            <Select value={stage} onValueChange={(val) => setStage(val || "Lead")}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="closeDate">Expected Close Date</Label>
            <Input id="closeDate" type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner">Owner Name</Label>
            <Input id="owner" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
        </div>
      </form>

      <div className="pt-6 mt-4 border-t border-border flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Deal"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";

interface StockAdjustFormProps {
  productId: string;
  currentStock: number;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function StockAdjustForm({ productId, currentStock, onSave, onCancel }: StockAdjustFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    movement_type: "adjustment",
    quantity: 1,
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    
    // Check if 'out' movement exceeds current stock
    if (formData.movement_type === "out" && formData.quantity > currentStock) {
      toast.error("Cannot deduct more than current stock");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        product_id: productId,
        movement_type: formData.movement_type,
        quantity: formData.quantity,
        notes: formData.notes
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-500">Current Stock</span>
        <span className="text-xl font-bold text-slate-900">{currentStock}</span>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Adjustment Type</Label>
          <Select 
            value={formData.movement_type} 
            onValueChange={(val) => setFormData({ ...formData, movement_type: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">Stock In (Add)</SelectItem>
              <SelectItem value="out">Stock Out (Deduct)</SelectItem>
              <SelectItem value="adjustment">Adjustment (Audit/Damage)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input 
            id="quantity" 
            type="number"
            min="1"
            step="any"
            value={formData.quantity} 
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Reason / Notes</Label>
          <Textarea 
            id="notes" 
            value={formData.notes} 
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
            placeholder="e.g. Damaged during transit"
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
          {loading ? "Saving..." : "Confirm Adjustment"}
        </Button>
      </div>
    </form>
  );
}

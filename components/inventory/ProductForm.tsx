"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";

interface ProductFormProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSave, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    unit: initialData?.unit || "pcs",
    purchase_price: initialData?.purchase_price || 0,
    selling_price: initialData?.selling_price || 0,
    current_stock: initialData?.current_stock || 0,
    reorder_level: initialData?.reorder_level || 10,
    hsn_code: initialData?.hsn_code || "",
    gst_rate: initialData?.gst_rate || 18,
    is_active: initialData?.is_active ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Product name is required");
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            required 
            placeholder="e.g. Cotton Fabric"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input 
              id="sku" 
              value={formData.sku} 
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
              placeholder="e.g. CTN-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input 
              id="category" 
              value={formData.category} 
              onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
              placeholder="e.g. Fabric"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Product details..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="purchase_price">Purchase Price</Label>
            <Input 
              id="purchase_price" 
              type="number"
              min="0"
              step="any"
              value={formData.purchase_price} 
              onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="selling_price">Selling Price</Label>
            <Input 
              id="selling_price" 
              type="number"
              min="0"
              step="any"
              value={formData.selling_price} 
              onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })} 
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select 
              value={formData.unit} 
              onValueChange={(val) => setFormData({ ...formData, unit: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pcs">pcs</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="meter">meter</SelectItem>
                <SelectItem value="litre">litre</SelectItem>
                <SelectItem value="box">box</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_stock">Opening Stock</Label>
            <Input 
              id="current_stock" 
              type="number"
              min="0"
              value={formData.current_stock} 
              onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reorder_level">Reorder Lvl</Label>
            <Input 
              id="reorder_level" 
              type="number"
              min="0"
              value={formData.reorder_level} 
              onChange={(e) => setFormData({ ...formData, reorder_level: Number(e.target.value) })} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hsn_code">HSN Code</Label>
            <Input 
              id="hsn_code" 
              value={formData.hsn_code} 
              onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })} 
              placeholder="e.g. 5208"
            />
          </div>
          <div className="space-y-2">
            <Label>GST Rate (%)</Label>
            <Select 
              value={String(formData.gst_rate)} 
              onValueChange={(val) => setFormData({ ...formData, gst_rate: Number(val) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="GST Rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="12">12%</SelectItem>
                <SelectItem value="18">18%</SelectItem>
                <SelectItem value="28">28%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
          {loading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  );
}

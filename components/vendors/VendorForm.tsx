"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";

interface VendorFormProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function VendorForm({ initialData, onSave, onCancel }: VendorFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    contact_person: initialData?.contact_person || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    gstin: initialData?.gstin || "",
    payment_terms: initialData?.payment_terms || "net30",
    notes: initialData?.notes || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Vendor name is required");
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
          <Label htmlFor="name">Vendor Name *</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            required 
            placeholder="e.g. Surat Textile Mills"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input 
              id="contact_person" 
              value={formData.contact_person} 
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} 
              placeholder="e.g. Rajesh Patel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input 
              id="phone" 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              placeholder="e.g. 9876543210"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              placeholder="e.g. info@vendor.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input 
              id="city" 
              value={formData.city} 
              onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
              placeholder="e.g. Surat"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Full Address</Label>
          <Textarea 
            id="address" 
            value={formData.address} 
            onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
            placeholder="Complete address"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input 
              id="gstin" 
              value={formData.gstin} 
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} 
              placeholder="24ABCDE1234F1Z5"
            />
          </div>
          <div className="space-y-2">
            <Label>Payment Terms</Label>
            <Select 
              value={formData.payment_terms} 
              onValueChange={(val) => setFormData({ ...formData, payment_terms: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="net15">Net 15 Days</SelectItem>
                <SelectItem value="net30">Net 30 Days</SelectItem>
                <SelectItem value="net45">Net 45 Days</SelectItem>
                <SelectItem value="net60">Net 60 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea 
            id="notes" 
            value={formData.notes} 
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
            placeholder="Any specific terms or notes"
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
          {loading ? "Saving..." : "Save Vendor"}
        </Button>
      </div>
    </form>
  );
}

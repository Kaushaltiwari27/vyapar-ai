"use client";

import { useState } from "react";
import { createClient } from "@/lib/client";
import { Customer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { toast } from "react-hot-toast";

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState(customer?.name || "");
  const [company, setCompany] = useState(customer?.company || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [city, setCity] = useState(customer?.city || "");
  const [gstin, setGstin] = useState(customer?.gstin || "");
  const [notes, setNotes] = useState(customer?.notes || "");

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

    const payload = {
      business_id: profile.business_id,
      name,
      company,
      phone,
      email,
      city,
      gstin,
      notes,
    };

    let error;

    if (customer?.id) {
      // Update
      const res = await supabase.from('customers').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', customer.id);
      error = res.error;
    } else {
      // Insert
      const res = await supabase.from('customers').insert([payload]);
      error = res.error;
    }

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success(customer?.id ? "Customer updated successfully" : "Customer added successfully");
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="mb-6">
        <SheetTitle>{customer ? "Edit Customer" : "New Customer"}</SheetTitle>
        <SheetDescription>
          {customer ? "Customer details update karein." : "Naye customer ki details save karein."}
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input id="gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
      </form>

      <div className="pt-6 mt-4 border-t flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Customer"}
        </Button>
      </div>
    </div>
  );
}

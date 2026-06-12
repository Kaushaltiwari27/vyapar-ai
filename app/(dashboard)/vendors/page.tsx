"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Vendor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, Search, Truck } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { VendorForm } from "@/components/vendors/VendorForm";
import { PlanGuard } from "@/components/auth/PlanGuard";

export default function VendorsPage() {
  const supabase = createClient();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  async function loadVendors() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('business_id', profile.business_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVendors(data as Vendor[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadVendors();
  }, [supabase]);

  const handleSaveVendor = async (formData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    const payload = { ...formData, business_id: profile.business_id };
    const { error } = await supabase.from('vendors').insert([payload]);
    
    if (error) throw error;
    
    toast.success("Vendor added successfully");
    setIsSheetOpen(false);
    loadVendors();
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (v.contact_person && v.contact_person.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PlanGuard feature="vendors">
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            Vendors
          </h1>
          <p className="text-slate-500 mt-1">Manage your suppliers and vendors</p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> New Vendor
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by vendor name or contact..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading vendors...</div>
        ) : filteredVendors.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No vendors found</h3>
            <p className="text-slate-500 mt-1">Add your first vendor to start creating purchase orders.</p>
            <Button onClick={() => setIsSheetOpen(true)} variant="outline" className="mt-4">
              Add Vendor
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Vendor Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Phone / Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Terms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id} className="group cursor-pointer hover:bg-indigo-50/30">
                  <TableCell className="font-medium">
                    <Link href={`/vendors/${vendor.id}`} className="text-indigo-600 hover:underline">
                      {vendor.name}
                    </Link>
                  </TableCell>
                  <TableCell>{vendor.contact_person || '-'}</TableCell>
                  <TableCell>
                    <div className="text-sm">{vendor.phone || '-'}</div>
                    <div className="text-xs text-slate-500">{vendor.email}</div>
                  </TableCell>
                  <TableCell>{vendor.city || '-'}</TableCell>
                  <TableCell>
                    <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded font-medium uppercase">
                      {vendor.payment_terms}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Add New Vendor</SheetTitle>
            <SheetDescription>
              Enter the details of your new supplier.
            </SheetDescription>
          </SheetHeader>
          <VendorForm 
            onSave={handleSaveVendor} 
            onCancel={() => setIsSheetOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </div>
      </PlanGuard>
  );
}

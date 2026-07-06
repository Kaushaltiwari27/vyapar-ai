"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Customer } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit2, Trash2, Users } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { CustomerDetail } from "@/components/customers/CustomerDetail";
import { toast } from "react-hot-toast";
import EmptyState from "@/components/ui/EmptyState";

export default function CustomersPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sheet states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', profile.business_id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load customers");
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this customer?")) return;
    
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Customer deleted");
      fetchCustomers();
    }
  };

  const handleEdit = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const totalRevenue = customers.reduce((sum, c) => sum + (Number(c.total_revenue) || 0), 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Customers</p>
            <p className="text-3xl font-bold text-slate-900">{customers.length}</p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">₹</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search name, phone, or company..." 
            className="pl-9 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 h-11"
          onClick={() => { setSelectedCustomer(null); setIsFormOpen(true); }}
        >
          <Plus className="w-4 h-4 mr-2" /> New Customer
        </Button>
      </div>

      {/* Table / Empty State */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">Loading customers...</div>
      ) : customers.length === 0 ? (
        <EmptyState 
          icon={Users}
          title="No Customers Yet"
          description="Aapke business ke liye koi customer add nahi kiya gaya hai. Abhi add karein aur records track karna shuru karein."
          actionLabel="Add Customer"
          onAction={() => { setSelectedCustomer(null); setIsFormOpen(true); }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Total Revenue</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No customers match your search.</td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => (
                    <tr 
                      key={customer.id} 
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(customer)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                            {customer.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="font-medium text-slate-900">{customer.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{customer.company || '-'}</td>
                      <td className="px-6 py-4 text-slate-600">{customer.phone || '-'}</td>
                      <td className="px-6 py-4 text-slate-600">{customer.city || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(customer.total_revenue)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600" onClick={(e) => handleEdit(e, customer)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={(e) => handleDelete(e, customer.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <CustomerForm 
            customer={selectedCustomer} 
            onSuccess={() => { setIsFormOpen(false); fetchCustomers(); }} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </SheetContent>
      </Sheet>

      {/* Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto w-full">
          {selectedCustomer && <CustomerDetail customer={selectedCustomer} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

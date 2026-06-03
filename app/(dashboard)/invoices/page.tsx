"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Invoice } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Eye, CheckCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function InvoicesPage() {
  const supabase = createClient();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');

  const fetchInvoices = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('business_id', profile.business_id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load invoices");
    } else {
      const processedInvoices = data.map(inv => {
        if (inv.status === 'sent' && inv.due_date && new Date(inv.due_date) < new Date(new Date().setHours(0,0,0,0))) {
          return { ...inv, status: 'overdue' };
        }
        return inv;
      });
      setInvoices(processedInvoices as Invoice[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleMarkAsPaid = async (id: string) => {
    const { error } = await supabase.from('invoices').update({ status: 'paid' }).eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Invoice marked as paid!");
      fetchInvoices();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Invoice deleted");
      fetchInvoices();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>
        <Link href="/invoices/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> Naya Invoice
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-px">
        {[
          { id: 'all', label: 'Sab' },
          { id: 'draft', label: 'Draft' },
          { id: 'sent', label: 'Sent' },
          { id: 'paid', label: 'Paid' },
          { id: 'overdue', label: 'Overdue' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as 'all' | 'draft' | 'sent' | 'paid' | 'overdue')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.id 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading invoices...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No invoices found.</td>
                </tr>
              ) : (
                filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-indigo-600">
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{invoice.customer_name || '-'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(invoice.total_amount)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(invoice.issue_date)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(invoice.due_date)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`${getStatusColor(invoice.status)} border-0 uppercase text-[10px]`}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                          <Button variant="outline" size="sm" className="h-8 text-green-600 border-green-200 bg-green-50 hover:bg-green-100" onClick={() => handleMarkAsPaid(invoice.id)}>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Paid
                          </Button>
                        )}
                        <Link href={`/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(invoice.id)}>
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
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Quotation } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Eye, CheckCircle2, Trash2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function QuotationsPage() {
  const supabase = createClient();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'declined' | 'invoiced'>('all');

  const fetchQuotations = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('business_id', profile.business_id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load quotations");
    } else {
      setQuotations(data as Quotation[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    const { error } = await supabase.from('quotations').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Quotation deleted");
      fetchQuotations();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-emerald-100 text-emerald-700';
      case 'declined': return 'bg-rose-100 text-rose-700';
      case 'invoiced': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredQuotations = filter === 'all' 
    ? quotations 
    : quotations.filter(q => q.status === filter);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quotations & Proposals</h2>
          <p className="text-slate-500 text-sm mt-1">Manage price estimates and send proposals to clients.</p>
        </div>
        <Link href="/quotations/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> New Quotation
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-px overflow-x-auto whitespace-nowrap scrollbar-hide">
        {[
          { id: 'all', label: 'All' },
          { id: 'draft', label: 'Draft' },
          { id: 'sent', label: 'Sent' },
          { id: 'accepted', label: 'Accepted' },
          { id: 'declined', label: 'Declined' },
          { id: 'invoiced', label: 'Invoiced' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
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
                <th className="px-6 py-4">Quotation #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading quotations...</td>
                </tr>
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No quotations found.</td>
                </tr>
              ) : (
                filteredQuotations.map(quote => (
                  <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-indigo-600">
                      <Link href={`/quotations/${quote.id}`} className="hover:underline">
                        {quote.quotation_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{quote.customer_name || '-'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(quote.total_amount)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(quote.issue_date)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(quote.valid_until)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={`${getStatusColor(quote.status)} border-0 uppercase text-[10px]`}>
                        {quote.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {quote.status !== 'invoiced' && (
                          <Link href={`/quotations/${quote.id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100">
                              View Details
                            </Button>
                          </Link>
                        )}
                        {quote.status === 'invoiced' && quote.invoice_id && (
                          <Link href={`/invoices/${quote.invoice_id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100">
                              View Invoice <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(quote.id)}>
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

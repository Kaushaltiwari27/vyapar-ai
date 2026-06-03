"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Customer, Deal, Invoice } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, MapPin, Building, FileText, TrendingUp } from "lucide-react";

interface CustomerDetailProps {
  customer: Customer;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  const supabase = createClient();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Fetch deals
      const { data: dealsData } = await supabase
        .from('deals')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });
      
      if (dealsData) setDeals(dealsData as Deal[]);

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });
        
      if (invoicesData) setInvoices(invoicesData as Invoice[]);

      setLoading(false);
    }

    if (customer.id) fetchData();
  }, [customer.id, supabase]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Lead': return 'bg-slate-100 text-slate-700';
      case 'Contacted': return 'bg-blue-100 text-blue-700';
      case 'Proposal': return 'bg-yellow-100 text-yellow-700';
      case 'Negotiation': return 'bg-orange-100 text-orange-700';
      case 'Won': return 'bg-green-100 text-green-700';
      case 'Lost': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
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

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-2 pb-6">
      <SheetHeader className="mb-6 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 font-bold text-2xl flex items-center justify-center">
            {customer.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <SheetTitle className="text-2xl">{customer.name}</SheetTitle>
            <SheetDescription className="text-base mt-1">
              Customer Details & History
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="space-y-8">
        {/* Contact Info */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h3>
          <div className="bg-slate-50 p-4 rounded-xl space-y-3">
            {customer.company && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-900">{customer.company}</span>
                {customer.gstin && <Badge variant="outline" className="ml-2 text-xs">GST: {customer.gstin}</Badge>}
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                {customer.phone}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                {customer.email}
              </div>
            )}
            {customer.city && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                {customer.city}
              </div>
            )}
            {customer.notes && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Notes</p>
                <p className="text-sm text-slate-700">{customer.notes}</p>
              </div>
            )}
          </div>
        </section>

        {/* Deals History */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Deals
            </h3>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">{deals.length}</Badge>
          </div>
          
          {loading ? (
            <div className="text-sm text-slate-500">Loading deals...</div>
          ) : deals.length === 0 ? (
            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-500 text-center">No deals found for this customer.</div>
          ) : (
            <div className="space-y-3">
              {deals.map(deal => (
                <div key={deal.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{deal.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(deal.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-slate-900">{formatCurrency(deal.value)}</span>
                    <Badge variant="secondary" className={`${getStageColor(deal.stage)} border-0 text-[10px]`}>{deal.stage}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Invoices History */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Invoices
            </h3>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">{invoices.length}</Badge>
          </div>
          
          {loading ? (
            <div className="text-sm text-slate-500">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-500 text-center">No invoices found for this customer.</div>
          ) : (
            <div className="space-y-3">
              {invoices.map(invoice => (
                <div key={invoice.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{invoice.invoice_number}</p>
                    <p className="text-xs text-slate-500 mt-1">Due: {formatDate(invoice.due_date)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-slate-900">{formatCurrency(invoice.total_amount)}</span>
                    <Badge variant="secondary" className={`${getStatusColor(invoice.status)} border-0 text-[10px] uppercase`}>{invoice.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

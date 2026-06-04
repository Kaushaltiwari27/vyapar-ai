"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Invoice, Customer } from "@/lib/types";
import { formatCurrency, formatDate, numberToWords } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Printer } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [business, setBusiness] = useState<{name:string, address:string, city:string, state:string, gstin:string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoiceData() {
      if (!params?.id) return;
      setLoading(true);

      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', params.id)
        .single();

      if (invError || !invData) {
        toast.error("Invoice not found");
        router.push("/invoices");
        return;
      }
      setInvoice(invData as Invoice);

      // Fetch Customer
      if (invData.customer_id) {
        const { data: custData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', invData.customer_id)
          .single();
        if (custData) setCustomer(custData as Customer);
      }

      // Fetch Business
      const { data: busData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', invData.business_id)
        .single();
      if (busData) setBusiness(busData);

      setLoading(false);
    }
    fetchInvoiceData();
  }, [params?.id, router, supabase]);

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    const { error } = await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoice.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Invoice marked as paid!");
      setInvoice({ ...invoice, status: 'paid' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading || !invoice) {
    return <div className="p-8 text-slate-500">Loading invoice details...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 print:p-0 print:max-w-none print:m-0">
      
      {/* SCREEN CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print-hide">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="icon" className="h-9 w-9 border-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{invoice.invoice_number}</h2>
            <Badge variant="outline" className={`${getStatusColor(invoice.status)} uppercase text-xs font-bold px-3 py-1`}>
              {invoice.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={handleMarkAsPaid}>
              <CheckCircle className="w-4 h-4 mr-2" /> Mark as Paid
            </Button>
          )}
          <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Download PDF / Print
          </Button>
        </div>
      </div>

      {/* PRINTABLE INVOICE DOCUMENT */}
      <div id="printable-invoice" className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Header Section */}
        <div className="bg-slate-900 text-white p-10 flex justify-between items-center print:bg-slate-900 print:text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight uppercase">INVOICE</h1>
            <p className="text-indigo-300 font-medium mt-1">#{invoice.invoice_number}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">{business?.name || "Your Business Name"}</h2>
            <p className="text-sm text-slate-300 mt-1">{business?.address || ""}</p>
            {business?.city && <p className="text-sm text-slate-300">{business.city}, {business.state}</p>}
            {business?.gstin && <p className="text-sm font-semibold text-indigo-200 mt-2">GSTIN: {business.gstin}</p>}
          </div>
        </div>

        {/* Info Section */}
        <div className="p-10">
          <div className="grid grid-cols-2 gap-12 border-b border-slate-100 pb-10">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Billed To</h3>
              <p className="text-xl font-bold text-slate-900">{customer?.name || invoice.customer_name || "Customer Name"}</p>
              {customer?.company && <p className="text-md text-slate-700 mt-1">{customer.company}</p>}
              {customer?.city && <p className="text-sm text-slate-500 mt-1">{customer.city}</p>}
              {customer?.gstin && <p className="text-sm font-semibold text-slate-700 mt-3 bg-slate-50 inline-block px-3 py-1 rounded-md border border-slate-200">GSTIN: {customer.gstin}</p>}
            </div>
            <div className="grid grid-cols-2 gap-6 text-right">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Issue Date</h3>
                <p className="text-md font-bold text-slate-900">{formatDate(invoice.issue_date)}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Due Date</h3>
                <p className="text-md font-bold text-slate-900">{formatDate(invoice.due_date)}</p>
              </div>
              <div className="col-span-2 mt-4 flex justify-end">
                {invoice.status === 'paid' && (
                  <div className="border-4 border-emerald-500 text-emerald-500 text-3xl font-black uppercase tracking-widest px-6 py-2 rounded-lg transform rotate-12 opacity-80 inline-block">
                    PAID
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mt-10">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <th className="py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Description</th>
                  <th className="py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">HSN/SAC</th>
                  <th className="py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty</th>
                  <th className="py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Rate</th>
                  <th className="py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 border-b border-slate-200">
                {invoice.items?.map((item: import("@/lib/types").InvoiceItem, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-5 text-sm text-slate-900 font-bold">{item.description}</td>
                    <td className="py-5 px-5 text-sm text-slate-500">{item.hsn || '-'}</td>
                    <td className="py-5 px-5 text-sm text-slate-700 text-center font-medium">{item.quantity}</td>
                    <td className="py-5 px-5 text-sm text-slate-700 text-right font-medium">{formatCurrency(item.rate)}</td>
                    <td className="py-5 px-5 text-sm text-slate-900 font-bold text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start mt-10">
            <div className="w-full sm:w-1/2 pr-8 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Amount in Words</h3>
                <p className="text-sm font-bold text-slate-800 capitalize bg-slate-50 p-4 rounded-lg border border-slate-100">{numberToWords(invoice.total_amount)}</p>
              </div>
              {invoice.notes && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notes & Terms</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
                </div>
              )}
            </div>
            
            <div className="w-full sm:w-1/2 max-w-md ml-auto mt-8 sm:mt-0 bg-slate-50 p-6 rounded-xl border border-slate-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(invoice.subtotal)}</span>
                </div>
                
                {invoice.gst_rate > 0 ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-500">CGST ({invoice.gst_rate / 2}%)</span>
                      <span className="font-bold text-slate-900">{formatCurrency(invoice.gst_amount / 2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-500">SGST ({invoice.gst_rate / 2}%)</span>
                      <span className="font-bold text-slate-900">{formatCurrency(invoice.gst_amount / 2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-500">GST (0%)</span>
                    <span className="font-bold text-slate-900">₹0</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-4">
                  <span className="font-black text-slate-900 text-lg uppercase tracking-wider">Total</span>
                  <span className="font-black text-indigo-700 text-3xl">{formatCurrency(invoice.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400 text-sm font-medium">
            <p>Thank you for your business!</p>
            <p>Generated by VyaparAI</p>
          </div>
        </div>
      </div>
    </div>
  );
}

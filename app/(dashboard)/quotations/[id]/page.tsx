"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Quotation, Customer } from "@/lib/types";
import { formatCurrency, formatDate, numberToWords } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Printer, FileSpreadsheet, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [business, setBusiness] = useState<{name:string, address:string, city:string, state:string, gstin:string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    async function fetchQuotationData() {
      if (!params?.id) return;
      setLoading(true);

      const { data: qData, error: qError } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', params.id)
        .single();

      if (qError || !qData) {
        toast.error("Quotation not found");
        router.push("/quotations");
        return;
      }
      setQuotation(qData as Quotation);

      // Fetch Customer
      if (qData.customer_id) {
        const { data: custData } = await supabase
          .from('customers')
          .select('*')
          .eq('id', qData.customer_id)
          .single();
        if (custData) setCustomer(custData as Customer);
      }

      // Fetch Business
      const { data: busData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', qData.business_id)
        .single();
      if (busData) setBusiness(busData);

      setLoading(false);
    }
    fetchQuotationData();
  }, [params?.id, router, supabase]);

  const handleMarkAsAccepted = async () => {
    if (!quotation) return;
    const { error } = await supabase.from('quotations').update({ status: 'accepted' }).eq('id', quotation.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Quotation marked as accepted!");
      setQuotation({ ...quotation, status: 'accepted' });
    }
  };

  const handleConvertToInvoice = async () => {
    if (!quotation) return;
    setConverting(true);

    try {
      // 1. Generate next invoice number
      const { data: invData } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('business_id', quotation.business_id)
        .order('created_at', { ascending: false })
        .limit(1);

      let nextNum = "INV-001";
      if (invData && invData.length > 0) {
        const lastNum = invData[0].invoice_number;
        const parts = lastNum.split('-');
        if (parts.length === 2 && !isNaN(Number(parts[1]))) {
          const num = parseInt(parts[1]) + 1;
          nextNum = `INV-${num.toString().padStart(3, '0')}`;
        }
      }

      const invoicePayload = {
        business_id: quotation.business_id,
        customer_id: quotation.customer_id,
        customer_name: quotation.customer_name,
        invoice_number: nextNum,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], // 15 days due date
        status: 'draft',
        subtotal: quotation.subtotal,
        gst_rate: quotation.gst_rate,
        gst_amount: quotation.gst_amount,
        total_amount: quotation.total_amount,
        notes: `Converted from Quotation: ${quotation.quotation_number}. ` + (quotation.notes || ''),
        items: quotation.items
      };

      // 2. Insert invoice
      const { data: newInvoice, error: invError } = await supabase
        .from('invoices')
        .insert([invoicePayload])
        .select('id')
        .single();

      if (invError) throw invError;

      // 3. Update quotation status and link invoice_id
      const { error: quoteUpdateError } = await supabase
        .from('quotations')
        .update({ 
          status: 'invoiced', 
          invoice_id: newInvoice.id, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', quotation.id);

      if (quoteUpdateError) throw quoteUpdateError;

      toast.success("Successfully converted to invoice!");
      router.push(`/invoices/${newInvoice.id}`);
    } catch (e: any) {
      toast.error("Failed to convert: " + e.message);
    } finally {
      setConverting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'declined': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'invoiced': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading || !quotation) {
    return <div className="p-8 text-slate-500">Loading quotation details...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 print:p-0 print:max-w-none print:m-0">
      
      {/* SCREEN CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print-hide">
        <div className="flex items-center gap-4">
          <Link href="/quotations">
            <Button variant="outline" size="icon" className="h-9 w-9 border-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{quotation.quotation_number}</h2>
            <Badge variant="outline" className={`${getStatusColor(quotation.status)} uppercase text-xs font-bold px-3 py-1`}>
              {quotation.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {quotation.status === 'sent' && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold" onClick={handleMarkAsAccepted}>
              Mark as Accepted
            </Button>
          )}
          {quotation.status !== 'invoiced' && quotation.status !== 'draft' && (
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold" onClick={handleConvertToInvoice} disabled={converting}>
              <FileSpreadsheet className="w-4 h-4 mr-2" /> 
              {converting ? 'Converting...' : 'Convert to Invoice'}
            </Button>
          )}
          <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Download PDF / Print
          </Button>
        </div>
      </div>

      {/* PRINTABLE QUOTATION DOCUMENT */}
      <div id="printable-quotation" className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Header Section */}
        <div className="bg-slate-950 text-white p-10 flex justify-between items-center print:bg-slate-950 print:text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight uppercase">QUOTATION</h1>
            <p className="text-indigo-300 font-medium mt-1">#{quotation.quotation_number}</p>
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
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Prepared For</h3>
              <p className="text-xl font-bold text-slate-900">{customer?.name || quotation.customer_name || "Customer Name"}</p>
              {customer?.company && <p className="text-md text-slate-700 mt-1">{customer.company}</p>}
              {customer?.city && <p className="text-sm text-slate-500 mt-1">{customer.city}</p>}
              {customer?.gstin && <p className="text-sm font-semibold text-slate-700 mt-3 bg-slate-50 inline-block px-3 py-1 rounded-md border border-slate-200">GSTIN: {customer.gstin}</p>}
            </div>
            <div className="grid grid-cols-2 gap-6 text-right">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Quotation Date</h3>
                <p className="text-md font-bold text-slate-900">{formatDate(quotation.issue_date)}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Valid Until</h3>
                <p className="text-md font-bold text-slate-900">{formatDate(quotation.valid_until)}</p>
              </div>
              <div className="col-span-2 mt-4 flex justify-end">
                {quotation.status === 'invoiced' && (
                  <div className="border-4 border-indigo-500 text-indigo-500 text-3xl font-black uppercase tracking-widest px-6 py-2 rounded-lg transform rotate-12 opacity-80 inline-block">
                    INVOICED
                  </div>
                )}
                {quotation.status === 'accepted' && (
                  <div className="border-4 border-emerald-500 text-emerald-500 text-3xl font-black uppercase tracking-widest px-6 py-2 rounded-lg transform rotate-12 opacity-80 inline-block">
                    ACCEPTED
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
                {quotation.items?.map((item, i: number) => (
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
                <p className="text-sm font-bold text-slate-800 capitalize bg-slate-50 p-4 rounded-lg border border-slate-100">{numberToWords(quotation.total_amount)}</p>
              </div>
              {quotation.notes && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notes & Terms</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{quotation.notes}</p>
                </div>
              )}
            </div>
            
            <div className="w-full sm:w-1/2 max-w-md ml-auto mt-8 sm:mt-0 bg-slate-50 p-6 rounded-xl border border-slate-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(quotation.subtotal)}</span>
                </div>
                
                {quotation.gst_rate > 0 ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-500">CGST ({quotation.gst_rate / 2}%)</span>
                      <span className="font-bold text-slate-900">{formatCurrency(quotation.gst_amount / 2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-500">SGST ({quotation.gst_rate / 2}%)</span>
                      <span className="font-bold text-slate-900">{formatCurrency(quotation.gst_amount / 2)}</span>
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
                  <span className="font-black text-indigo-700 text-3xl">{formatCurrency(quotation.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400 text-sm font-medium">
            <p>We appreciate the opportunity to provide this proposal.</p>
            <div className="flex items-center gap-2">
              <span>Generated by</span>
              <Image src="/logo.png" alt="VyaparAI" width={80} height={20} className="object-contain opacity-50 grayscale" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

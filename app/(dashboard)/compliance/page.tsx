"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { ComplianceCalendar, Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { getMonthName } from "@/lib/payroll";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ShieldCheck, Download, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { PlanGuard } from "@/components/auth/PlanGuard";

export default function CompliancePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [deadlines, setDeadlines] = useState<ComplianceCalendar[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [gstMonth, setGstMonth] = useState(new Date().getMonth() + 1);
  const [gstYear, setGstYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
      if (!profile?.business_id) return;

      // Fetch pending compliances + recently completed
      const { data: complianceData } = await supabase
        .from('compliance_calendar')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('due_date', { ascending: true });

      if (complianceData) setDeadlines(complianceData as ComplianceCalendar[]);

      // Fetch Invoices for GSTR-1
      const startDate = `${gstYear}-${String(gstMonth).padStart(2, '0')}-01`;
      const endDate = `${gstYear}-${String(gstMonth).padStart(2, '0')}-31`;
      
      const { data: invData } = await supabase
        .from('invoices')
        .select('*, customers(gstin)')
        .eq('business_id', profile.business_id)
        .gte('issue_date', startDate)
        .lte('issue_date', endDate);

      if (invData) setInvoices(invData as Invoice[]);

      setLoading(false);
    }
    loadData();
  }, [supabase, gstMonth, gstYear]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'done' : 'pending';
    const { error } = await supabase.from('compliance_calendar').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setDeadlines(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
      toast.success(`Marked as ${newStatus}`);
    }
  };

  const downloadGSTR1 = () => {
    const headers = ['GSTIN/UIN of Recipient', 'Invoice Number', 'Invoice date', 'Invoice Value', 'Rate', 'Taxable Value', 'Cess Amount'];
    const rows = invoices.map(inv => {
      // @ts-ignore
      const isB2B = inv.customers?.gstin ? true : false;
      // @ts-ignore
      const gstin = inv.customers?.gstin || '';
      return [
        gstin,
        inv.invoice_number,
        inv.issue_date,
        inv.total_amount,
        inv.gst_rate || 18,
        inv.subtotal,
        0
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GSTR1_Summary_${getMonthName(gstMonth)}_${gstYear}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'PF': return 'bg-blue-100 text-[#0176D3]';
      case 'ESIC': return 'bg-green-100 text-green-700';
      case 'TDS': return 'bg-amber-100 text-amber-700';
      case 'GST': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) return <div className="p-8">Loading compliance data...</div>;

  const pendingDeadlines = deadlines.filter(d => d.status === 'pending');
  const completedDeadlines = deadlines.filter(d => d.status === 'done');

  // GSTR-1 Calcs
  // @ts-ignore
  const b2bInvoices = invoices.filter(i => i.customers?.gstin);
  const b2cInvoices = invoices.filter(i => {
    // @ts-ignore
    return !i.customers?.gstin;
  });

  return (
    <PlanGuard feature="compliance">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
          <div className="w-12 h-12 bg-slate-800 rounded text-white flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Statutory Compliance</h1>
            <p className="text-sm text-slate-500">Track deadlines for PF, ESIC, TDS, and GST returns.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Compliance Calendar */}
          <Card className="border border-slate-200 shadow-sm rounded-sm bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-200 p-4">
              <CardTitle className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0176D3]" /> Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pendingDeadlines.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No pending deadlines! You are fully compliant.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingDeadlines.map(deadline => {
                    const daysLeft = Math.ceil((new Date(deadline.due_date).getTime() - Date.now()) / (1000 * 3600 * 24));
                    const isUrgent = daysLeft <= 7;
                    const isWarning = daysLeft > 7 && daysLeft <= 15;
                    
                    return (
                      <div key={deadline.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                        <div className="flex gap-4 items-center">
                          <Badge className={`${getBadgeColor(deadline.compliance_type)} border-0 font-black px-2`}>
                            {deadline.compliance_type}
                          </Badge>
                          <div>
                            <p className="font-bold text-slate-900">{deadline.title}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              Due: {new Date(deadline.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {daysLeft > 0 && (
                                <span className={`font-bold ml-2 ${isUrgent ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                                  ({daysLeft} days left)
                                </span>
                              )}
                              {daysLeft < 0 && <span className="font-bold ml-2 text-rose-600">({Math.abs(daysLeft)} days overdue!)</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {deadline.amount ? <span className="font-extrabold text-slate-800">{formatCurrency(deadline.amount)}</span> : null}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs font-semibold text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => toggleStatus(deadline.id, 'pending')}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Done
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* GSTR-1 Extraction */}
          <Card className="border border-[#0176D3] shadow-sm rounded-sm bg-white overflow-hidden">
            <div className="bg-[#0176D3] text-white p-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><FileText className="w-5 h-5"/> GSTR-1 Data Extractor</h3>
              <p className="text-xs text-blue-100 opacity-90 mt-1">Export your sales invoices for GST filing</p>
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-slate-800">Summary for {getMonthName(gstMonth)} {gstYear}</h4>
                <Button onClick={downloadGSTR1} className="bg-white text-[#0176D3] border border-[#0176D3] hover:bg-blue-50 font-bold h-9">
                  <Download className="w-4 h-4 mr-2" /> Download CSV
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-sm bg-slate-50 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">B2B Invoices (Registered)</p>
                    <p className="text-xs text-slate-500">{b2bInvoices.length} invoices generated</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900">{formatCurrency(b2bInvoices.reduce((sum, i) => sum + i.total_amount, 0))}</p>
                    <p className="text-xs text-slate-500">Tax: {formatCurrency(b2bInvoices.reduce((sum, i) => sum + i.gst_amount, 0))}</p>
                  </div>
                </div>
                
                <div className="p-4 border border-slate-200 rounded-sm bg-slate-50 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">B2C Invoices (Unregistered)</p>
                    <p className="text-xs text-slate-500">{b2cInvoices.length} invoices generated</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900">{formatCurrency(b2cInvoices.reduce((sum, i) => sum + i.total_amount, 0))}</p>
                    <p className="text-xs text-slate-500">Tax: {formatCurrency(b2cInvoices.reduce((sum, i) => sum + i.gst_amount, 0))}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 p-3 rounded-sm flex items-start gap-2 border border-blue-100">
                <AlertTriangle className="w-4 h-4 text-[#0176D3] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Disclaimer:</strong> You can download this CSV and send it directly to your CA or upload it to the GST portal using the Offline Utility. Verify all HSN codes and GSTINs before filing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PlanGuard>
  );
}

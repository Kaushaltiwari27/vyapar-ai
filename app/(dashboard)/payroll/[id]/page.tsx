"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { PayrollRun, PayrollDetail, Business } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { getMonthName } from "@/lib/payroll";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PayslipDocument } from "@/components/payroll/PayslipDocument";
import { ArrowLeft, Download, Printer, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PayrollDetailPage() {
  const params = useParams();
  const runId = params.id as string;
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [run, setRun] = useState<PayrollRun | null>(null);
  const [details, setDetails] = useState<PayrollDetail[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollDetail | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
      if (!profile?.business_id) return;

      const [bizRes, runRes, detRes] = await Promise.all([
        supabase.from('businesses').select('*').eq('id', profile.business_id).single(),
        supabase.from('payroll_runs').select('*').eq('id', runId).single(),
        supabase.from('payroll_details').select('*').eq('payroll_run_id', runId).order('employee_name')
      ]);

      if (bizRes.data) setBusiness(bizRes.data as Business);
      if (runRes.data) setRun(runRes.data as PayrollRun);
      if (detRes.data) setDetails(detRes.data as PayrollDetail[]);
      
      setLoading(false);
    }
    loadData();
  }, [supabase, runId]);

  if (loading) return <div className="p-8">Loading payroll details...</div>;
  if (!run || !business) return <div className="p-8">Payroll run not found.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none">
      
      {/* Hide everything except payslip when printing */}
      <div className="print:hidden space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/payroll">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll Register</h1>
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${run.status === 'processed' ? 'bg-green-100 text-[#008a00]' : 'bg-slate-100 text-slate-600'}`}>
                  {run.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">{getMonthName(run.month)} {run.year}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white text-slate-700 font-semibold h-9 rounded-sm border-slate-300">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-slate-200 shadow-sm rounded-sm">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Total Net Pay</p>
              <div className="text-xl font-bold text-slate-900">{formatCurrency(run.total_net_pay)}</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 shadow-sm rounded-sm">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Total Gross</p>
              <div className="text-xl font-bold text-slate-900">{formatCurrency(run.total_gross)}</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 shadow-sm rounded-sm">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Total Deductions</p>
              <div className="text-xl font-bold text-slate-900">{formatCurrency(run.total_deductions)}</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 shadow-sm rounded-sm">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">Employees</p>
              <div className="text-xl font-bold text-slate-900">{run.employee_count}</div>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <Card className="border border-slate-200 shadow-sm rounded-sm">
          <CardHeader className="bg-slate-50 p-4 border-b border-slate-200">
            <CardTitle className="text-sm font-bold text-slate-900">Employee Payslips</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-slate-200 text-slate-500 text-xs">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide">Employee</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide">Working</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide">Gross</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide">Deductions</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide text-[#0176D3]">Net Pay</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {details.map(det => (
                  <tr key={det.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{det.employee_name}</p>
                      <p className="text-slate-500 text-[10px] uppercase">{det.employee_code || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{det.present_days}/{det.working_days} Days</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(det.gross_salary)}</td>
                    <td className="px-4 py-3 text-rose-600">{formatCurrency(det.total_deductions)}</td>
                    <td className="px-4 py-3 font-bold text-[#0176D3]">{formatCurrency(det.net_pay)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs font-semibold"
                        onClick={() => setSelectedPayslip(det)}
                      >
                        <FileText className="w-3 h-3 mr-1" /> View Payslip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Print View Wrapper */}
      {selectedPayslip && (
        <>
          <div className="print:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-md shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <h3 className="font-bold text-lg">Payslip: {selectedPayslip.employee_name}</h3>
                <div className="flex gap-2">
                  <Button onClick={() => window.print()} className="bg-[#0176D3] hover:bg-[#014486] text-white">
                    <Printer className="w-4 h-4 mr-2"/> Print PDF
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedPayslip(null)}>Close</Button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto">
                <PayslipDocument business={business} payroll={selectedPayslip} />
              </div>
            </div>
          </div>
          
          {/* True Print Element */}
          <div className="hidden print:block">
            <PayslipDocument business={business} payroll={selectedPayslip} />
          </div>
        </>
      )}

    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { PayrollRun } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Users, FileText, CheckCircle2, AlertCircle, ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { getMonthName } from "@/lib/payroll";

export default function PayrollDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRun[]>([]);
  const [currentMonthRun, setCurrentMonthRun] = useState<PayrollRun | null>(null);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
      if (!profile?.business_id) return;

      const { data: runs } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('business_id', profile.business_id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (runs) {
        setPayrollHistory(runs as PayrollRun[]);
        const current = runs.find(r => r.month === currentMonth && r.year === currentYear);
        if (current) setCurrentMonthRun(current as PayrollRun);
      }
      setLoading(false);
    }
    loadData();
  }, [supabase, currentMonth, currentYear]);

  if (loading) {
    return <div className="p-8 text-slate-500">Loading payroll data...</div>;
  }

  const isCurrentProcessed = currentMonthRun?.status === 'processed';

  return (
    <PlanGuard feature="payroll">
  
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0176D3] rounded text-white flex items-center justify-center shadow-inner">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll Engine</h1>
            <p className="text-sm text-slate-500">Process monthly salaries and manage compliance</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Current Period: {getMonthName(currentMonth)} {currentYear}
          </div>
          {!isCurrentProcessed ? (
            <Link href="/payroll/run">
              <Button className="bg-[#0176D3] hover:bg-[#014486] text-white shadow-sm font-semibold h-10 px-6">
                Run Payroll for {getMonthName(currentMonth)}
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-sm font-bold border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" /> Payroll Processed
            </div>
          )}
        </div>
      </div>

      {/* Current Month Status */}
      {currentMonthRun && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Net Payout</p>
                <Wallet className="h-4 w-4 text-[#0176D3]" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(currentMonthRun.total_net_pay)}</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Gross Payroll</p>
                <FileText className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(currentMonthRun.total_gross)}</div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Total PF</p>
                <AlertCircle className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(currentMonthRun.total_pf_employee + currentMonthRun.total_pf_employer)}</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Employees</p>
                <Users className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{currentMonthRun.employee_count}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Table */}
      <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white">
        <CardHeader className="bg-slate-50 p-4 border-b border-slate-200 flex flex-row justify-between items-center">
          <CardTitle className="text-[15px] font-bold text-slate-900">Payroll History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payrollHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No payroll history found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-white border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-bold uppercase tracking-wide">Period</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wide">Employees</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wide">Gross Pay</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wide">Net Pay</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 font-bold uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollHistory.map((run) => (
                    <tr key={run.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {getMonthName(run.month)} {run.year}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{run.employee_count}</td>
                      <td className="px-6 py-4 text-slate-600">{formatCurrency(run.total_gross)}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(run.total_net_pay)}</td>
                      <td className="px-6 py-4">
                        <Badge className={`${run.status === 'processed' ? 'bg-[#e5f6e8] text-[#008a00] hover:bg-[#e5f6e8]' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'} border-0 uppercase tracking-wider text-[10px] font-bold`}>
                          {run.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/payroll/${run.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-[#0176D3] font-semibold hover:bg-blue-50">
                            View Details <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  
    </PlanGuard>
  );
}

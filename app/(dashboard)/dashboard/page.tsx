"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Deal, Invoice, Product } from "@/lib/types";
import { Users, TrendingUp, FileText, CheckCircle2, Clock, Plus, ArrowRight, AlertTriangle, Building2, Calendar, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getMonthName } from "@/lib/payroll";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import MetricCard from "@/components/ui/MetricCard";
import PageWrapper from "@/components/ui/PageWrapper";

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [activeApp, setActiveApp] = useState<'crm' | 'hrms'>('crm');
  const [userName, setUserName] = useState("User");
  
  // Metrics
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [wonThisMonth, setWonThisMonth] = useState(0);
  
  // HRMS Metrics
  const [presentToday, setPresentToday] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  
  // Activity
  const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  
  // Payroll & Compliance Alerts
  const [payrollStatus, setPayrollStatus] = useState<any>(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);

  // Chart Data
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    // Determine active app
    const savedApp = localStorage.getItem('vyapar_active_app') as 'crm' | 'hrms';
    if (savedApp) setActiveApp(savedApp);

    // Listen for storage changes if app is switched in another tab/component
    const handleStorageChange = () => {
      const updatedApp = localStorage.getItem('vyapar_active_app') as 'crm' | 'hrms';
      if (updatedApp) setActiveApp(updatedApp);
    };
    window.addEventListener('storage', handleStorageChange);
    // Poll localstorage periodically just in case TopNavigation changed it without triggering 'storage' event in same window
    const interval = setInterval(() => {
      const currentApp = localStorage.getItem('vyapar_active_app') as 'crm' | 'hrms';
      if (currentApp && currentApp !== activeApp) setActiveApp(currentApp);
    }, 1000);

    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('full_name, business_id').eq('id', user.id).single();
      if (!profile?.business_id) return;
      const businessId = profile.business_id;
      
      if (profile.full_name) {
        setUserName(profile.full_name.split(' ')[0]); // Get First Name
      }

      // 1. Total Customers
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId);
      setTotalCustomers(customersCount || 0);

      // 2. Pipeline Value (active deals: not won, not lost)
      const { data: activeDeals } = await supabase
        .from('deals')
        .select('value')
        .eq('business_id', businessId)
        .not('stage', 'in', '("Won", "Lost")');
      const pValue = activeDeals?.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0) || 0;
      setPipelineValue(pValue);

      // 3. Pending Invoices (sent, overdue)
      const { data: pendingInvs } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('business_id', businessId)
        .in('status', ['sent', 'overdue']);
      const pInvoices = pendingInvs?.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0) || 0;
      setPendingInvoices(pInvoices);

      // 4. Won This Month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      const { data: wonDeals } = await supabase
        .from('deals')
        .select('value')
        .eq('business_id', businessId)
        .eq('stage', 'Won')
        .gte('updated_at', startOfMonth.toISOString());
      const wMonth = wonDeals?.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0) || 0;
      setWonThisMonth(wMonth);

      // 5. Recent Deals
      const { data: rDeals } = await supabase
        .from('deals')
        .select('*')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false })
        .limit(5);
      setRecentDeals(rDeals || []);

      // 6. Overdue Invoices
      const { data: oInvoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('business_id', businessId)
        .eq('status', 'overdue')
        .order('due_date', { ascending: true })
        .limit(5);
      setOverdueInvoices(oInvoices || []);

      // 7. Low Stock Products
      const { data: lowStock } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true);
      
      if (lowStock) {
        const filteredLowStock = (lowStock as Product[]).filter(p => p.current_stock <= p.reorder_level);
        setLowStockProducts(filteredLowStock);
      }

      // 8. HRMS Metrics
      const today = new Date().toISOString().split('T')[0];
      const [present, emps, pending] = await Promise.all([
        supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('business_id', businessId).eq('date', today).eq('status', 'present'),
        supabase.from('employees').select('id', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'active'),
        supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'pending')
      ]);
      setPresentToday(present.count || 0);
      setTotalEmployees(emps.count || 0);
      setPendingLeaves(pending.count || 0);
      
      // 9. Payroll & Compliance Alerts
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const { data: currentPayroll } = await supabase
        .from('payroll_runs')
        .select('status, total_net_pay, employee_count')
        .eq('business_id', businessId)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .single();
      setPayrollStatus(currentPayroll);

      const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      const { data: deadlines } = await supabase
        .from('compliance_calendar')
        .select('*')
        .eq('business_id', businessId)
        .eq('status', 'pending')
        .gte('due_date', today)
        .lte('due_date', in7Days);
      setUpcomingDeadlines(deadlines || []);

      // 10. Fetch Revenue Data (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      const { data: revDeals } = await supabase
        .from('deals')
        .select('value, updated_at')
        .eq('business_id', businessId)
        .eq('stage', 'Won')
        .gte('updated_at', sixMonthsAgo.toISOString());
      
      if (revDeals) {
        const groupedRev: Record<string, number> = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const mName = getMonthName(d.getMonth() + 1);
          groupedRev[mName] = 0;
        }
        revDeals.forEach(deal => {
          const d = new Date(deal.updated_at);
          const mName = getMonthName(d.getMonth() + 1);
          if (groupedRev[mName] !== undefined) {
            groupedRev[mName] += Number(deal.value) || 0;
          }
        });
        setRevenueData(Object.keys(groupedRev).map(k => ({ month: k, revenue: groupedRev[k] })));
      }

      // 11. Fetch Attendance Trend (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const { data: attTrend } = await supabase
        .from('attendance')
        .select('status, date')
        .eq('business_id', businessId)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0]);

      if (attTrend) {
        const groupedAtt: Record<string, { display: string, present: number, lop: number }> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          const isoDate = d.toISOString().split('T')[0];
          groupedAtt[isoDate] = { display: dateStr, present: 0, lop: 0 };
        }
        
        attTrend.forEach(a => {
          if (groupedAtt[a.date]) {
            if (['present', 'half_day'].includes(a.status)) groupedAtt[a.date].present++;
            if (['on_leave', 'absent'].includes(a.status)) groupedAtt[a.date].lop++;
          }
        });
        
        setAttendanceData(Object.keys(groupedAtt).sort().map(k => ({ 
          date: groupedAtt[k].display, 
          present: groupedAtt[k].present, 
          lop: groupedAtt[k].lop 
        })));
      }

      setLoading(false);
    }

    loadDashboardData();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [supabase, activeApp]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Won': return 'bg-[#e5f6e8] text-[#008a00] border-[#008a00]';
      case 'Lost': return 'bg-[#fff0f0] text-[#c23934] border-[#c23934]';
      default: return 'bg-[#f3f2f2] text-slate-700 border-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-slate-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-100 animate-pulse rounded border border-slate-200"></div>)}
        </div>
        <div className="h-64 bg-slate-100 animate-pulse rounded border border-slate-200 mt-8"></div>
      </div>
    );
  }

  // --- CRM VIEW ---
  if (activeApp === 'crm') {
    return (
      <PageWrapper>
        {/* Header & Quick Actions */}
        <div className="animate-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0176D3] rounded text-white flex items-center justify-center shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vyapar CRM</p>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {userName}!</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/deals">
              <Button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-slate-50 active:scale-95" style={{ border: '1px solid #E5E7EB', color: '#374151' }} variant="outline">
                New Deal
              </Button>
            </Link>
            <Link href="/invoices/new">
              <Button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-95" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
                New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* Pipeline Sparklines (Mini visual trend) */}
        <div className="animate-card mb-6 p-5 bg-white rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm flex items-end gap-2 h-20">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mr-4 mb-2">Pipeline Trend</div>
          {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
            <div key={i} className="w-8 bg-[#4F46E5]/20 rounded-t-sm hover:bg-[#4F46E5]/40 transition-colors cursor-pointer relative group flex items-end" style={{ height: \`\${h}%\` }}>
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded transition-opacity">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}
              </div>
            </div>
          ))}
        </div>

        {/* CRM Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard title="Pipeline Value" value={pipelineValue} prefix="₹" icon={<TrendingUp className="w-5 h-5"/>} />
          <MetricCard title="Won This Month" value={wonThisMonth} prefix="₹" icon={<CheckCircle2 className="w-5 h-5"/>} />
          <MetricCard title="Pending Invoices" value={pendingInvoices} prefix="₹" icon={<FileText className="w-5 h-5"/>} />
          <MetricCard title="Total Customers" value={totalCustomers} icon={<Users className="w-5 h-5"/>} />
        </div>
        {/* Charts Row */}
        <div className="animate-card grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueData} />
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Overdue Invoices Table moved to side of chart */}
            <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white flex-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between bg-slate-50 p-4 border-b border-slate-200">
                <CardTitle className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#c23934]" /> Overdue Invoices
                </CardTitle>
                <Link href="/invoices" className="text-[13px] font-bold text-[#0176D3] hover:underline">View All</Link>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto max-h-[250px]">
                {overdueInvoices.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">No overdue invoices. Great job!</div>
                ) : (
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-white border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-2 font-bold uppercase tracking-wide">Invoice</th>
                        <th className="px-4 py-2 font-bold uppercase tracking-wide">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {overdueInvoices.map(invoice => {
                        const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.due_date || new Date().toISOString()).getTime()) / (1000 * 3600 * 24));
                        return (
                          <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <Link href={`/invoices/${invoice.id}`} className="font-bold text-[#0176D3] hover:underline">
                                {invoice.invoice_number}
                              </Link>
                              <div className="text-[10px] font-bold uppercase text-[#c23934] mt-0.5">{daysOverdue} days late</div>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(invoice.total_amount)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity Row */}
        <div className="animate-card grid grid-cols-1 gap-6">
          {/* Recent Deals Table */}
          <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50 p-4 border-b border-slate-200">
              <CardTitle className="text-[15px] font-bold text-slate-900">Recent Deals</CardTitle>
              <Link href="/deals" className="text-[13px] font-bold text-[#0176D3] hover:underline">View All</Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentDeals.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No deals found.</div>
              ) : (
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-white border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-bold uppercase tracking-wide">Deal Name</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-wide">Value</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-wide text-right">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentDeals.map(deal => (
                      <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#0176D3] hover:underline cursor-pointer">{deal.title}</p>
                          <p className="text-slate-500">{deal.customer_name || 'Unknown'}</p>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(deal.value)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${getStageColor(deal.stage)}`}>
                            {deal.stage}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  // --- HRMS VIEW ---
  return (
    <PageWrapper>
      {/* Header & Quick Actions */}
      <div className="animate-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded text-white flex items-center justify-center shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vyapar HRMS</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {userName}!</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/employees">
            <Button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:opacity-90 active:scale-95" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' }}>
              Manage Employees
            </Button>
          </Link>
        </div>
      </div>

      {/* HRMS Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Employees" value={totalEmployees} icon={<Users className="w-5 h-5"/>} />
        <MetricCard title="Present Today" value={presentToday} icon={<ClipboardCheck className="w-5 h-5"/>} />
        <MetricCard title="Pending Leaves" value={pendingLeaves} icon={<Calendar className="w-5 h-5"/>} />
      </div>
      {/* HRMS Chart Row */}
      <div className="animate-card grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <AttendanceChart data={attendanceData} />
        </div>
        
        {/* Alerts Section (Moved to side of chart) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Payroll Alert */}
          <Card className={`border shadow-sm rounded-sm flex-1 flex flex-col ${payrollStatus?.status === 'processed' ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/50'}`}>
            <CardContent className="p-6 flex-1 flex flex-col justify-between items-start">
              <div className="mb-4">
                <h3 className={`font-bold text-lg mb-1 flex items-center gap-2 ${payrollStatus?.status === 'processed' ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {payrollStatus?.status === 'processed' ? <CheckCircle2 className="w-5 h-5"/> : <AlertTriangle className="w-5 h-5"/>} 
                  {getMonthName(new Date().getMonth() + 1)} Payroll
                </h3>
                <p className={`text-sm font-medium ${payrollStatus?.status === 'processed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {payrollStatus?.status === 'processed' 
                    ? `Processed for ${payrollStatus.employee_count} employees. Net Pay: ${formatCurrency(payrollStatus.total_net_pay)}` 
                    : 'Payroll for this month is pending calculation.'}
                </p>
              </div>
              {!payrollStatus || payrollStatus.status !== 'processed' ? (
                <Link href="/payroll/run">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm font-bold w-full">Run Now</Button>
                </Link>
              ) : (
                <Link href="/payroll">
                  <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 font-bold w-full">View Payroll</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Compliance Alert */}
          {upcomingDeadlines.length > 0 ? (
            <Card className="border border-rose-200 bg-rose-50/50 shadow-sm rounded-sm flex-1 flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col justify-between items-start">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-rose-800 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5"/> Compliance Deadlines
                  </h3>
                  <p className="text-sm font-medium text-rose-700">
                    {upcomingDeadlines[0].title} is due in {Math.ceil((new Date(upcomingDeadlines[0].due_date).getTime() - Date.now()) / 86400000)} days.
                  </p>
                </div>
                <Link href="/compliance">
                  <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-bold w-full">Review Now</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-slate-200 bg-slate-50/50 shadow-sm rounded-sm flex-1 flex items-center justify-center p-6">
              <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500"/> No urgent compliance deadlines.
              </p>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

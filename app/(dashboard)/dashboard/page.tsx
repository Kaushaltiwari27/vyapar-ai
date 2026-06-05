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
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header & Quick Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0176D3] rounded text-white flex items-center justify-center shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Vyapar CRM</p>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {userName}!</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/deals">
              <Button size="sm" className="bg-white text-slate-700 border-slate-300 hover:bg-slate-50 h-9 font-semibold rounded-sm" variant="outline">
                New Deal
              </Button>
            </Link>
            <Link href="/invoices/new">
              <Button size="sm" className="bg-[#0176D3] hover:bg-[#014486] text-white h-9 rounded-sm font-semibold shadow-sm">
                New Invoice
              </Button>
            </Link>
          </div>
        </div>

        {/* CRM Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white hover:border-[#0176D3] transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Pipeline Value</p>
                <TrendingUp className="h-4 w-4 text-[#0176D3]" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(pipelineValue)}</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white hover:border-[#0176D3] transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Won This Month</p>
                <CheckCircle2 className="h-4 w-4 text-[#008a00]" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(wonThisMonth)}</div>
            </CardContent>
          </Card>
          
          <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white hover:border-[#0176D3] transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Pending Invoices</p>
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(pendingInvoices)}</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white hover:border-[#0176D3] transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Total Customers</p>
                <Users className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalCustomers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Overdue Invoices Table */}
          <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50 p-4 border-b border-slate-200">
              <CardTitle className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#c23934]" /> Overdue Invoices
              </CardTitle>
              <Link href="/invoices" className="text-[13px] font-bold text-[#0176D3] hover:underline">View All</Link>
            </CardHeader>
            <CardContent className="p-0">
              {overdueInvoices.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">No overdue invoices. Great job!</div>
              ) : (
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-white border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-bold uppercase tracking-wide">Invoice</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-wide">Amount</th>
                      <th className="px-4 py-2 font-bold uppercase tracking-wide text-right">Status</th>
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
                            <p className="text-slate-500">{invoice.customer_name || 'Unknown'}</p>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">{formatCurrency(invoice.total_amount)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c23934] bg-[#fff0f0] border border-[#c23934] px-2 py-0.5 rounded">
                              {daysOverdue} days late
                            </span>
                          </td>
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
    );
  }

  // --- HRMS VIEW ---
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
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
            <Button size="sm" className="bg-[#0176D3] hover:bg-[#014486] text-white h-9 rounded-sm font-semibold shadow-sm">
              Manage Employees
            </Button>
          </Link>
        </div>
      </div>

      {/* HRMS Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white hover:border-[#0176D3] transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider pb-1">Total Employees</p>
              <div className="text-3xl font-bold text-slate-900">{totalEmployees}</div>
            </div>
            <div className="w-10 h-10 rounded bg-[#f3f2f2] flex items-center justify-center">
              <Users className="h-5 w-5 text-[#0176D3]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white hover:border-emerald-500 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider pb-1">Present Today</p>
              <div className="text-3xl font-bold text-slate-900">{presentToday}</div>
            </div>
            <div className="w-10 h-10 rounded bg-emerald-50 flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-[0_2px_2px_rgba(0,0,0,0.05)] rounded-sm bg-white hover:border-amber-500 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider pb-1">Pending Leaves</p>
              <div className="text-3xl font-bold text-slate-900">{pendingLeaves}</div>
            </div>
            <div className="w-10 h-10 rounded bg-amber-50 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 text-center p-12 border-2 border-dashed border-slate-200 rounded-sm bg-slate-50">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700">HRMS Workspace</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">Use the navigation tabs above to manage employee profiles, track daily attendance, and approve leave requests.</p>
      </div>
    </div>
  );
}

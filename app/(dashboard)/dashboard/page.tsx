"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Deal, Invoice, Product } from "@/lib/types";
import { Users, TrendingUp, FileText, CheckCircle2, Clock, Plus, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  
  // Metrics
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [wonThisMonth, setWonThisMonth] = useState(0);
  
  // Activity
  const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
      if (!profile?.business_id) return;
      const businessId = profile.business_id;

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

      // 4. Won This Month (simple check for recent won deals)
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

      setLoading(false);
    }

    loadDashboardData();
  }, [supabase]);

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

  if (loading) {
    return <div className="p-8 text-slate-500">Loading dashboard data...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your business today.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/customers">
            <Button className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm gap-2 font-semibold" variant="outline">
              <Plus className="w-4 h-4 text-slate-400" /> New Customer
            </Button>
          </Link>
          <Link href="/deals">
            <Button className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm gap-2 font-semibold" variant="outline">
              <Plus className="w-4 h-4 text-slate-400" /> New Deal
            </Button>
          </Link>
          <Link href="/invoices/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 gap-2 font-semibold">
              <Plus className="w-4 h-4" /> New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-100 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-semibold text-slate-500">Total Customers</p>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCustomers}</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-100 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-semibold text-slate-500">Pipeline Value</p>
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(pipelineValue)}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-100 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-semibold text-slate-500">Pending Invoices</p>
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(pendingInvoices)}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-100 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-semibold text-slate-500">Won This Month</p>
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatCurrency(wonThisMonth)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Deals */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">Recent Deals</CardTitle>
            <Link href="/deals" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            {recentDeals.length === 0 ? (
              <p className="text-sm text-slate-500 px-6 pb-2">No recent deals found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentDeals.map(deal => (
                  <div key={deal.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900">{deal.title}</p>
                      <p className="text-sm font-medium text-slate-500">{deal.customer_name || 'Unknown Customer'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="text-sm font-extrabold text-slate-900">{formatCurrency(deal.value)}</div>
                      <Badge variant="secondary" className={`${getStageColor(deal.stage)} border-0 text-[10px] uppercase font-bold tracking-wider px-2`}>
                        {deal.stage}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Invoices */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" /> Overdue Invoices
            </CardTitle>
            <Link href="/invoices" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            {overdueInvoices.length === 0 ? (
              <p className="text-sm text-slate-500 px-6 pb-2">Great job! No overdue invoices.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {overdueInvoices.map(invoice => {
                  const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.due_date || new Date().toISOString()).getTime()) / (1000 * 3600 * 24));
                  return (
                    <div key={invoice.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="space-y-1">
                        <Link href={`/invoices/${invoice.id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                          {invoice.invoice_number}
                        </Link>
                        <p className="text-sm font-medium text-slate-500">{invoice.customer_name || 'Unknown Customer'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="text-sm font-extrabold text-slate-900">{formatCurrency(invoice.total_amount)}</div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          {daysOverdue} days overdue
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="shadow-sm border-0 ring-1 ring-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" /> Inventory Alerts
            </CardTitle>
            <Link href="/inventory" className="text-sm font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors">
              Manage Inventory <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-800/80 mb-5 font-semibold">
              {lowStockProducts.length} product(s) are running low. Consider reordering soon.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.slice(0, 6).map(product => (
                <div key={product.id} className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[150px]" title={product.name}>
                      {product.name}
                    </p>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Reorder at {product.reorder_level}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-xs font-bold border ${product.current_stock === 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {product.current_stock} {product.unit} left
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

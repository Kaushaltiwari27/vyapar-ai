"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { PurchaseOrder } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ClipboardList, Plus, PackageCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function PurchaseOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  async function loadOrders() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('business_id', profile.business_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as PurchaseOrder[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, [supabase]);

  const handleMarkReceived = async (po: PurchaseOrder) => {
    if (!confirm(`Mark ${po.po_number} as received? This will automatically update your inventory stock.`)) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
      if (!profile?.business_id) return;

      // 1. Update PO status
      const { error: poError } = await supabase
        .from('purchase_orders')
        .update({ 
          status: 'received', 
          received_at: new Date().toISOString() 
        })
        .eq('id', po.id);
      if (poError) throw poError;

      // 2. Insert Stock Movements & Update Products
      for (const item of po.items) {
        if (!item.product_id) continue;

        // Fetch current product stock to increment
        const { data: pData } = await supabase.from('products').select('current_stock').eq('id', item.product_id).single();
        const currentStock = pData?.current_stock || 0;
        const newStock = currentStock + item.quantity;

        // Insert Movement
        await supabase.from('stock_movements').insert([{
          business_id: profile.business_id,
          product_id: item.product_id,
          movement_type: 'in',
          quantity: item.quantity,
          reference_type: 'purchase_order',
          reference_id: po.id,
          reference_number: po.po_number,
          notes: `Received via PO: ${po.po_number}`
        }]);

        // Update Product
        await supabase.from('products').update({ current_stock: newStock, updated_at: new Date().toISOString() }).eq('id', item.product_id);
      }

      toast.success(`${po.po_number} marked as received and stock updated!`);
      loadOrders();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'ordered': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'received': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredOrders = orders.filter(po => {
    const matchesSearch = po.po_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (po.vendor_name && po.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (filterStatus !== 'all' && po.status !== filterStatus) return false;
    
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-600" />
            Purchase Orders
          </h1>
          <p className="text-slate-500 mt-1">Manage vendor orders and receive inventory</p>
        </div>
        <Link href="/purchase-orders/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Naya PO
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by PO number or vendor..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['all', 'draft', 'ordered', 'received', 'cancelled'].map(status => (
              <Button 
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={`capitalize ${filterStatus === status ? 'bg-slate-800 text-white' : 'bg-white'}`}
              >
                {status === 'all' ? 'Sab' : status}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading purchase orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No purchase orders found</h3>
            <p className="text-slate-500 mt-1">Create your first PO to restock inventory.</p>
            <Link href="/purchase-orders/new">
              <Button variant="outline" className="mt-4">
                Create Purchase Order
              </Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>PO Number</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((po) => (
                <TableRow key={po.id} className="group hover:bg-indigo-50/30">
                  <TableCell className="font-medium text-indigo-600">
                    {po.po_number}
                  </TableCell>
                  <TableCell>{po.vendor_name || '-'}</TableCell>
                  <TableCell className="text-slate-600">{formatDate(po.order_date)}</TableCell>
                  <TableCell className="text-slate-600">{formatDate(po.expected_date)}</TableCell>
                  <TableCell className="font-bold text-slate-900">{formatCurrency(po.total_amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(po.status)} capitalize text-xs`}>
                      {po.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {po.status === 'ordered' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleMarkReceived(po)}
                      >
                        <PackageCheck className="w-4 h-4 mr-2" /> Receive
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

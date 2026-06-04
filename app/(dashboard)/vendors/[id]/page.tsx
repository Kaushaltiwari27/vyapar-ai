"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Vendor, PurchaseOrder } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Building2, Phone, Mail, MapPin, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function VendorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: vData } = await supabase.from('vendors').select('*').eq('id', id).single();
      if (vData) setVendor(vData as Vendor);

      const { data: poData } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('vendor_id', id)
        .order('created_at', { ascending: false });
      if (poData) setPurchaseOrders(poData as PurchaseOrder[]);

      setLoading(false);
    }
    loadData();
  }, [id, supabase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'ordered': return 'bg-blue-100 text-blue-700';
      case 'received': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading vendor details...</div>;
  if (!vendor) return <div className="p-8 text-red-500">Vendor not found.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/vendors">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">{vendor.name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm border-slate-200 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Vendor Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.contact_person && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{vendor.contact_person}</p>
                  <p className="text-xs text-slate-500">Contact Person</p>
                </div>
              </div>
            )}
            {vendor.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{vendor.phone}</p>
                  <p className="text-xs text-slate-500">Phone</p>
                </div>
              </div>
            )}
            {vendor.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{vendor.email}</p>
                  <p className="text-xs text-slate-500">Email</p>
                </div>
              </div>
            )}
            {(vendor.address || vendor.city) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{[vendor.address, vendor.city].filter(Boolean).join(', ')}</p>
                  <p className="text-xs text-slate-500">Address</p>
                </div>
              </div>
            )}
            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">GSTIN</p>
                  <p className="text-sm font-medium text-slate-900">{vendor.gstin || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Payment Terms</p>
                  <span className="inline-block mt-1 bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                    {vendor.payment_terms}
                  </span>
                </div>
              </div>
            </div>
            {vendor.notes && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Notes</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{vendor.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Purchase Order History</CardTitle>
            <Link href={`/purchase-orders/new?vendor=${vendor.id}`}>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                Create PO
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {purchaseOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p>No purchase orders found for this vendor.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map(po => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">
                        <Link href={`/purchase-orders/${po.id}`} className="text-indigo-600 hover:underline">
                          {po.po_number}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(po.order_date)}</TableCell>
                      <TableCell>{formatDate(po.expected_date)}</TableCell>
                      <TableCell className="font-medium text-slate-900">{formatCurrency(po.total_amount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${getStatusColor(po.status)} border-0 text-xs capitalize`}>
                          {po.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

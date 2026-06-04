"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Product, StockMovement } from "@/lib/types";
import { formatCurrency, formatDate, getStockStatus, getStockBadgeStyle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Package, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, History } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StockAdjustForm } from "@/components/inventory/StockAdjustForm";
import { toast } from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    
    // Load product
    const { data: pData } = await supabase.from('products').select('*').eq('id', id).single();
    if (pData) setProduct(pData as Product);

    // Load movements
    const { data: mData } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false });
    if (mData) setMovements(mData as StockMovement[]);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [id, supabase]);

  const handleAdjustStock = async (movementData: any) => {
    if (!product) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    // 1. Insert Movement
    const { error: movementError } = await supabase.from('stock_movements').insert([{
      ...movementData,
      business_id: profile.business_id,
    }]);

    if (movementError) throw movementError;

    // 2. Update Product Stock
    let newStock = product.current_stock;
    if (movementData.movement_type === 'in') {
      newStock += movementData.quantity;
    } else {
      newStock -= movementData.quantity;
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', product.id);

    if (updateError) throw updateError;

    toast.success("Stock adjusted successfully");
    setIsAdjustModalOpen(false);
    loadData();
  };

  const getMovementIcon = (type: string) => {
    switch(type) {
      case 'in': return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'out': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      default: return <ArrowRightLeft className="w-4 h-4 text-amber-600" />;
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading product details...</div>;
  if (!product) return <div className="p-8 text-red-500">Product not found.</div>;

  const status = getStockStatus(product.current_stock, product.reorder_level);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
            {product.sku && <p className="text-slate-500 text-sm">SKU: {product.sku}</p>}
          </div>
        </div>
        <Button onClick={() => setIsAdjustModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <ArrowRightLeft className="w-4 h-4 mr-2" /> Adjust Stock
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Details Card */}
        <Card className="md:col-span-1 shadow-sm border-slate-200 h-fit">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex justify-between items-center">
              Product Details
              <Badge variant="outline" className={product.is_active ? "text-green-700 bg-green-50 border-green-200" : "text-slate-500 bg-slate-100"}>
                {product.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="text-sm text-slate-500">Current Stock</span>
              <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold border ${getStockBadgeStyle(status)}`}>
                {product.current_stock} {product.unit}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Purchase Price</p>
                <p className="text-sm font-medium text-slate-900">{formatCurrency(product.purchase_price)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Selling Price</p>
                <p className="text-sm font-medium text-slate-900">{formatCurrency(product.selling_price)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500">Category</p>
                <p className="text-sm font-medium text-slate-900">{product.category || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Reorder Level</p>
                <p className="text-sm font-medium text-slate-900">{product.reorder_level} {product.unit}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500">HSN Code</p>
                <p className="text-sm font-medium text-slate-900">{product.hsn_code || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">GST Rate</p>
                <p className="text-sm font-medium text-slate-900">{product.gst_rate}%</p>
              </div>
            </div>

            {product.description && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm text-slate-700">{product.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Movement History */}
        <Card className="md:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Stock Movement History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {movements.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p>No stock movements recorded yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map(m => (
                    <TableRow key={m.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(m.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 capitalize text-sm">
                          {getMovementIcon(m.movement_type)}
                          <span className={
                            m.movement_type === 'in' ? 'text-green-700' : 
                            m.movement_type === 'out' ? 'text-red-700' : 'text-amber-700'
                          }>
                            {m.movement_type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {m.movement_type === 'in' ? '+' : '-'}{m.quantity}
                      </TableCell>
                      <TableCell>
                        {m.reference_number ? (
                          <div className="text-sm">
                            <span className="text-slate-500 text-xs uppercase mr-1">{m.reference_type}</span>
                            <span className="font-medium text-indigo-600">{m.reference_number}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">
                        {m.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAdjustModalOpen} onOpenChange={setIsAdjustModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Record a manual stock adjustment for <strong className="text-slate-900">{product.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <StockAdjustForm
            productId={product.id}
            currentStock={product.current_stock}
            onSave={handleAdjustStock}
            onCancel={() => setIsAdjustModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

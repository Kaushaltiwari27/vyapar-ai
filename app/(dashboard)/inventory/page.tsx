"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Product } from "@/lib/types";
import { formatCurrency, getStockStatus, getStockBadgeStyle } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Package, AlertTriangle, XCircle, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ProductForm } from "@/components/inventory/ProductForm";
import { StockAdjustForm } from "@/components/inventory/StockAdjustForm";

export default function InventoryPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all');
  
  // Modals state
  const [isProductSheetOpen, setIsProductSheetOpen] = useState(false);
  const [adjustStockProduct, setAdjustStockProduct] = useState<Product | null>(null);

  async function loadProducts() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', profile.business_id)
      .order('name');

    if (!error && data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, [supabase]);

  // Handle Save Product
  const handleSaveProduct = async (formData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    const payload = { ...formData, business_id: profile.business_id };
    const { data, error } = await supabase.from('products').insert([payload]).select('id, current_stock').single();
    
    if (error) throw error;
    
    // Create initial stock movement if opening stock > 0
    if (formData.current_stock > 0 && data) {
      await supabase.from('stock_movements').insert([{
        business_id: profile.business_id,
        product_id: data.id,
        movement_type: 'in',
        quantity: formData.current_stock,
        reference_type: 'opening_stock',
        notes: 'Initial opening stock'
      }]);
    }

    toast.success("Product added successfully");
    setIsProductSheetOpen(false);
    loadProducts();
  };

  // Handle Adjust Stock
  const handleAdjustStock = async (movementData: any) => {
    if (!adjustStockProduct) return;
    
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
    let newStock = adjustStockProduct.current_stock;
    if (movementData.movement_type === 'in') {
      newStock += movementData.quantity;
    } else if (movementData.movement_type === 'out') {
      newStock -= movementData.quantity;
    } else {
      // For 'adjustment', we assume it's additive unless negative is allowed.
      // Usually adjustment can be either. The form logic checks this, let's treat it as negative if 'out'.
      // If it's just 'adjustment', let's say it's an additive correction. Wait, usually users select In/Out/Adj.
      // If movement_type is 'adjustment', let's assume it decreases stock if it was damaged.
      // Actually, let's just make it a generic subtract for adjustments unless it's an "in" adjustment. 
      // In the form we have In, Out, Adj. We'll subtract for Adj just to be safe.
      newStock -= movementData.quantity;
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', adjustStockProduct.id);

    if (updateError) throw updateError;

    toast.success("Stock adjusted successfully");
    setAdjustStockProduct(null);
    loadProducts();
  };

  // Calculations
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.current_stock * p.purchase_price), 0);
  const lowStockCount = products.filter(p => p.current_stock > 0 && p.current_stock <= p.reorder_level).length;
  const outOfStockCount = products.filter(p => p.current_stock === 0).length;

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filterType === 'low') return p.current_stock > 0 && p.current_stock <= p.reorder_level;
    if (filterType === 'out') return p.current_stock === 0;
    
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            Inventory
          </h1>
          <p className="text-slate-500 mt-1">Manage products, stock levels, and pricing</p>
        </div>
        <Button onClick={() => setIsProductSheetOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> New Product
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Total Products</p>
            <div className="text-3xl font-bold text-slate-900 mt-2">{totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Total Stock Value</p>
            <div className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>

        <Card className={`shadow-sm ${lowStockCount > 0 ? 'border-amber-300 bg-amber-50/30' : ''}`}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Low Stock Items</p>
              <div className={`text-3xl font-bold mt-2 ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {lowStockCount}
              </div>
            </div>
            {lowStockCount > 0 && <AlertTriangle className="w-8 h-8 text-amber-500 opacity-50" />}
          </CardContent>
        </Card>

        <Card className={`shadow-sm ${outOfStockCount > 0 ? 'border-red-300 bg-red-50/30' : ''}`}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Out of Stock</p>
              <div className={`text-3xl font-bold mt-2 ${outOfStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {outOfStockCount}
              </div>
            </div>
            {outOfStockCount > 0 && <XCircle className="w-8 h-8 text-red-500 opacity-50" />}
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by product name or SKU..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filterType === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('all')}
              className={filterType === 'all' ? 'bg-slate-800 text-white' : ''}
            >
              Sab
            </Button>
            <Button 
              variant={filterType === 'low' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('low')}
              className={filterType === 'low' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200' : ''}
            >
              Low Stock
            </Button>
            <Button 
              variant={filterType === 'out' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilterType('out')}
              className={filterType === 'out' ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' : ''}
            >
              Out of Stock
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No products found</h3>
            <p className="text-slate-500 mt-1">Add your first product to start tracking inventory.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Product / SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Lvl</TableHead>
                <TableHead>Price (Buy/Sell)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const status = getStockStatus(product.current_stock, product.reorder_level);
                return (
                  <TableRow key={product.id} className="group hover:bg-indigo-50/30">
                    <TableCell>
                      <Link href={`/inventory/${product.id}`} className="font-medium text-indigo-600 hover:underline">
                        {product.name}
                      </Link>
                      {product.sku && <div className="text-xs text-slate-500 mt-0.5">{product.sku}</div>}
                    </TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockBadgeStyle(status)}`}>
                        {product.current_stock} {product.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-500">{product.reorder_level} {product.unit}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{formatCurrency(product.selling_price)}</div>
                      <div className="text-xs text-slate-500">Buy: {formatCurrency(product.purchase_price)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setAdjustStockProduct(product)}
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                      >
                        <ArrowRightLeft className="w-4 h-4 mr-2" /> Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Product Sheet */}
      <Sheet open={isProductSheetOpen} onOpenChange={setIsProductSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Add New Product</SheetTitle>
            <SheetDescription>
              Create a new product in your inventory.
            </SheetDescription>
          </SheetHeader>
          <ProductForm 
            onSave={handleSaveProduct} 
            onCancel={() => setIsProductSheetOpen(false)} 
          />
        </SheetContent>
      </Sheet>

      {/* Adjust Stock Dialog */}
      <Dialog open={!!adjustStockProduct} onOpenChange={(open) => !open && setAdjustStockProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Record a manual stock adjustment for <strong className="text-slate-900">{adjustStockProduct?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          {adjustStockProduct && (
            <StockAdjustForm
              productId={adjustStockProduct.id}
              currentStock={adjustStockProduct.current_stock}
              onSave={handleAdjustStock}
              onCancel={() => setAdjustStockProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Vendor, Product, PurchaseOrderItem } from "@/lib/types";
import { formatCurrency, generatePONumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function NewPurchaseOrderPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Form State
  const [vendorId, setVendorId] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { product_id: "", product_name: "", quantity: 1, rate: 0, gst_rate: 0, amount: 0 }
  ]);

  useEffect(() => {
    async function loadInitialData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
      if (!profile?.business_id) return;

      // Fetch vendors
      const { data: vData } = await supabase.from('vendors').select('id, name').eq('business_id', profile.business_id).order('name');
      if (vData) setVendors(vData as Vendor[]);

      // Fetch products
      const { data: pData } = await supabase.from('products').select('*').eq('business_id', profile.business_id).eq('is_active', true).order('name');
      if (pData) setProducts(pData as Product[]);

      // Generate PO number
      const nextNum = await generatePONumber(supabase, profile.business_id);
      setPoNumber(nextNum);
    }
    loadInitialData();
  }, [supabase]);

  // Handle Items
  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    // Auto populate details if product selected
    if (field === 'product_id' && typeof value === 'string') {
      const product = products.find(p => p.id === value);
      if (product) {
        item.product_name = product.name;
        item.rate = product.purchase_price;
        item.gst_rate = product.gst_rate || 0;
      }
    }
    
    // Auto calculate amount
    const qty = field === 'quantity' ? Number(value) : item.quantity;
    const rate = field === 'rate' ? Number(value) : item.rate;
    item.amount = qty * rate;
    
    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { product_id: "", product_name: "", quantity: 1, rate: 0, gst_rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = items.reduce((sum, item) => sum + (item.amount * (item.gst_rate / 100)), 0);
  const totalAmount = subtotal + gstAmount;

  // Save PO
  const handleSave = async (status: 'draft' | 'ordered') => {
    if (!vendorId) {
      toast.error("Please select a vendor");
      return;
    }
    if (items.some(i => !i.product_id)) {
      toast.error("Please select products for all line items");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    const selectedVendor = vendors.find(v => v.id === vendorId);

    const payload = {
      business_id: profile.business_id,
      vendor_id: vendorId,
      vendor_name: selectedVendor ? selectedVendor.name : null,
      po_number: poNumber,
      order_date: orderDate,
      expected_date: expectedDate || null,
      status,
      subtotal,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      notes,
      items
    };

    const { error } = await supabase.from('purchase_orders').insert([payload]);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success(`Purchase Order ${status === 'draft' ? 'saved as draft' : 'sent'} successfully`);
      router.push(`/purchase-orders`);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/purchase-orders">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Create Purchase Order</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Vendor *</Label>
                <Select value={vendorId} onValueChange={(val) => setVendorId(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>PO Number *</Label>
                <Input value={poNumber} onChange={e => setPoNumber(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Order Date *</Label>
                <Input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Expected Delivery Date</Label>
                <Input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Line Items</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-3 text-sm font-semibold text-slate-600 mb-2">
                <div className="col-span-4">Product</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate (₹)</div>
                <div className="col-span-1">GST %</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-4">
                    <Select value={item.product_id} onValueChange={(val) => handleItemChange(index, 'product_id', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min="0" step="any" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <Input type="number" min="0" max="100" value={item.gst_rate} onChange={e => handleItemChange(index, 'gst_rate', e.target.value)} />
                  </div>
                  <div className="col-span-2 text-right font-medium text-slate-900 py-2">
                    {formatCurrency(item.amount)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => removeItem(index)} disabled={items.length === 1}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" className="w-full border-dashed text-indigo-600 hover:bg-indigo-50 mt-4" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <Label>Notes for Vendor</Label>
            <Textarea placeholder="Delivery instructions or other notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Total GST</span>
                <span className="font-medium text-slate-900">{formatCurrency(gstAmount)}</span>
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-lg">Total</span>
                <span className="font-extrabold text-indigo-600 text-2xl">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-11" onClick={() => handleSave('ordered')} disabled={loading}>
                <Send className="w-4 h-4 mr-2" /> Order Bhejo (Ordered)
              </Button>
              <Button variant="outline" className="w-full h-11 border-slate-200" onClick={() => handleSave('draft')} disabled={loading}>
                <Save className="w-4 h-4 mr-2" /> Draft Bachao
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

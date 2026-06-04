"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Customer, InvoiceItem, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function NewInvoicePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [gstRate, setGstRate] = useState("18");
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", hsn: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  useEffect(() => {
    async function loadInitialData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
      if (!profile?.business_id) return;

      // Fetch customers
      const { data: custData } = await supabase
        .from('customers')
        .select('id, name')
        .eq('business_id', profile.business_id)
        .order('name');
      if (custData) setCustomers(custData as Customer[]);

      // Fetch products
      const { data: pData } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', profile.business_id)
        .eq('is_active', true)
        .order('name');
      if (pData) setProducts(pData as Product[]);

      // Generate next invoice number
      const { data: invData } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('business_id', profile.business_id)
        .order('created_at', { ascending: false })
        .limit(1);

      let nextNum = "INV-001";
      if (invData && invData.length > 0) {
        const lastNum = invData[0].invoice_number;
        const parts = lastNum.split('-');
        if (parts.length === 2 && !isNaN(Number(parts[1]))) {
          const num = parseInt(parts[1]) + 1;
          nextNum = `INV-${num.toString().padStart(3, '0')}`;
        }
      }
      setInvoiceNumber(nextNum);
    }
    loadInitialData();
  }, [supabase]);

  // Handle Items
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'product_id' && typeof value === 'string') {
      const product = products.find(p => p.id === value);
      if (product) {
        item.description = product.name;
        item.hsn = product.hsn_code || "";
        item.rate = product.selling_price;
      }
    }

    // Auto calculate amount
    if (field === 'quantity' || field === 'rate' || field === 'product_id') {
      const qty = field === 'quantity' ? Number(value) : item.quantity;
      const rate = field === 'rate' ? Number(value) : item.rate;
      item.amount = qty * rate;
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", hsn: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = subtotal * (Number(gstRate) / 100);
  const totalAmount = subtotal + gstAmount;

  // Save Invoice
  const handleSave = async (status: 'draft' | 'sent') => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (items.some(i => !i.description)) {
      toast.error("All items must have a description");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;

    const selectedCustomer = customers.find(c => c.id === customerId);

    const payload = {
      business_id: profile.business_id,
      customer_id: customerId,
      customer_name: selectedCustomer ? selectedCustomer.name : null,
      invoice_number: invoiceNumber,
      issue_date: issueDate,
      due_date: dueDate || null,
      status,
      subtotal,
      gst_rate: Number(gstRate),
      gst_amount: gstAmount,
      total_amount: totalAmount,
      notes,
      items
    };

    const { data, error } = await supabase.from('invoices').insert([payload]).select('id').single();

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      // If status is 'sent', update stock
      if (status === 'sent') {
        for (const item of items) {
          if (!item.product_id) continue;
          
          const { data: pData } = await supabase.from('products').select('current_stock').eq('id', item.product_id).single();
          const currentStock = pData?.current_stock || 0;

          await supabase.from('stock_movements').insert([{
            business_id: profile.business_id,
            product_id: item.product_id,
            movement_type: 'out',
            quantity: item.quantity,
            reference_type: 'invoice',
            reference_id: data.id,
            reference_number: invoiceNumber,
            notes: `Sold via Invoice: ${invoiceNumber}`
          }]);

          await supabase.from('products').update({ 
            current_stock: currentStock - item.quantity, 
            updated_at: new Date().toISOString() 
          }).eq('id', item.product_id);
        }
      }

      toast.success(`Invoice ${status === 'draft' ? 'saved as draft' : 'sent'} successfully`);
      router.push(`/invoices/${data.id}`);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/invoices">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Create New Invoice</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Customer *</Label>
                <Select value={customerId} onValueChange={(val) => setCustomerId(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invoice Number *</Label>
                <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Issue Date *</Label>
                <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Line Items</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-3 text-sm font-semibold text-slate-600 mb-2">
                <div className="col-span-4">Description</div>
                <div className="col-span-2">HSN/SAC</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-2">Rate (₹)</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-4 space-y-2">
                    <Select value={item.product_id} onValueChange={(val) => handleItemChange(index, 'product_id', val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Product (Optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} <span className="text-slate-400 text-xs ml-1">({p.current_stock} {p.unit} avail)</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Item description" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Input placeholder="HSN" value={item.hsn || ""} onChange={e => handleItemChange(index, 'hsn', e.target.value)} />
                  </div>
                  <div className="col-span-1">
                    <Input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" min="0" step="any" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} />
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

              <Button type="button" variant="outline" className="w-full border-dashed text-indigo-600 hover:bg-indigo-50" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <Label>Notes / Terms</Label>
            <Textarea placeholder="Thank you for your business!" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
          </div>
        </div>

        {/* Right Col - Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-2">
                  <span>GST</span>
                  <Select value={gstRate} onValueChange={(val) => setGstRate(val || "0")}>
                    <SelectTrigger className="w-[80px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <span className="font-medium text-slate-900">{formatCurrency(gstAmount)}</span>
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-lg">Total</span>
                <span className="font-extrabold text-indigo-600 text-2xl">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-11" onClick={() => handleSave('sent')} disabled={loading}>
                <Send className="w-4 h-4 mr-2" /> Send Invoice
              </Button>
              <Button variant="outline" className="w-full h-11 border-slate-200" onClick={() => handleSave('draft')} disabled={loading}>
                <Save className="w-4 h-4 mr-2" /> Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

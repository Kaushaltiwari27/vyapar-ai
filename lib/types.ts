export interface Business {
  id: string;
  name: string;
  owner_name: string | null;
  gstin: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string;
  created_at: string;
}

export interface Profile {
  id: string;
  business_id: string | null;
  full_name: string | null;
  role: string;
  whatsapp_number: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  gstin: string | null;
  notes: string | null;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  business_id: string;
  customer_id: string | null;
  customer_name: string | null;
  title: string;
  value: number;
  stage: 'Lead' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  owner_name: string | null;
  expected_close_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  product_id?: string;
  description: string;
  hsn?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  business_id: string;
  customer_id: string | null;
  customer_name: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  notes: string | null;
  items: InvoiceItem[] | null;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string | null;
  description: string | null;
  category: string | null;
  unit: string;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  reorder_level: number;
  hsn_code: string | null;
  gst_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  business_id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  business_id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  gstin: string | null;
  payment_terms: string;
  notes: string | null;
  created_at: string;
}

export interface PurchaseOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  rate: number;
  gst_rate: number;
  amount: number;
}

export interface PurchaseOrder {
  id: string;
  business_id: string;
  vendor_id: string | null;
  vendor_name: string | null;
  po_number: string;
  order_date: string;
  expected_date: string | null;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  gst_amount: number;
  total_amount: number;
  notes: string | null;
  received_at: string | null;
  created_at: string;
}

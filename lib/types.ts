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

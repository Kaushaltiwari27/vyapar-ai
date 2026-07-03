-- 1. Create Quotations Table
CREATE TABLE IF NOT EXISTS public.quotations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text,
  quotation_number text NOT NULL,
  issue_date date DEFAULT current_date,
  valid_until date,
  status text DEFAULT 'draft', -- draft, sent, accepted, declined, invoiced
  subtotal numeric DEFAULT 0,
  gst_rate numeric DEFAULT 18,
  gst_amount numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  notes text,
  items jsonb DEFAULT '[]',
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Enable Row-Level Security
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- 3. Setup RLS Policies
DROP POLICY IF EXISTS "own quotations" ON public.quotations;
CREATE POLICY "own quotations" ON public.quotations 
  FOR ALL USING (business_id IN (SELECT business_id FROM public.profiles WHERE id = auth.uid()));

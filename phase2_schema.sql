-- Products / Inventory items
create table products (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  name text not null,
  sku text,
  description text,
  category text,
  unit text default 'pcs',
  purchase_price numeric default 0,
  selling_price numeric default 0,
  current_stock numeric default 0,
  reorder_level numeric default 10,
  hsn_code text,
  gst_rate numeric default 18,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Stock movements (every in/out recorded)
create table stock_movements (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  product_id uuid references products(id) not null,
  movement_type text not null,
  quantity numeric not null,
  reference_type text,
  reference_id uuid,
  reference_number text,
  notes text,
  created_at timestamptz default now()
);

-- Vendors / Suppliers
create table vendors (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  gstin text,
  payment_terms text default 'net30',
  notes text,
  created_at timestamptz default now()
);

-- Purchase Orders
create table purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  vendor_id uuid references vendors(id),
  vendor_name text,
  po_number text not null,
  order_date date default current_date,
  expected_date date,
  status text default 'draft',
  items jsonb default '[]',
  subtotal numeric default 0,
  gst_amount numeric default 0,
  total_amount numeric default 0,
  notes text,
  received_at timestamptz,
  created_at timestamptz default now()
);

-- RLS policies
alter table products enable row level security;
alter table stock_movements enable row level security;
alter table vendors enable row level security;
alter table purchase_orders enable row level security;

create policy "own products" on products for all using (business_id in (select business_id from profiles where id = auth.uid()));
create policy "own stock_movements" on stock_movements for all using (business_id in (select business_id from profiles where id = auth.uid()));
create policy "own vendors" on vendors for all using (business_id in (select business_id from profiles where id = auth.uid()));
create policy "own purchase_orders" on purchase_orders for all using (business_id in (select business_id from profiles where id = auth.uid()));

-- INSTRUCTIONS FOR SEED DATA
-- Replace 'YOUR_BUSINESS_ID' with your actual business_id from the 'businesses' table before running this part.

-- INSERT INTO products (business_id, name, sku, category, unit, purchase_price, selling_price, current_stock, reorder_level, hsn_code, gst_rate) VALUES
-- ('YOUR_BUSINESS_ID', 'Cotton Fabric Roll', 'CTN-001', 'Fabric', 'meter', 150, 220, 45, 20, '5208', 5),
-- ('YOUR_BUSINESS_ID', 'Silk Fabric Premium', 'SLK-001', 'Fabric', 'meter', 450, 680, 8, 15, '5007', 5),
-- ('YOUR_BUSINESS_ID', 'Polyester Blend', 'PLY-001', 'Fabric', 'meter', 80, 130, 0, 25, '5512', 12),
-- ('YOUR_BUSINESS_ID', 'Linen Fabric', 'LNN-001', 'Fabric', 'meter', 280, 420, 32, 10, '5309', 5),
-- ('YOUR_BUSINESS_ID', 'Packaging Box (Large)', 'PKG-001', 'Packaging', 'pcs', 12, 18, 200, 50, '4819', 18);

-- INSERT INTO vendors (business_id, name, contact_person, phone, city, gstin, payment_terms) VALUES
-- ('YOUR_BUSINESS_ID', 'Surat Textile Mills', 'Rajesh Patel', '9876543210', 'Surat', '24ABCDE1234F1Z5', 'net30'),
-- ('YOUR_BUSINESS_ID', 'Gujarat Fabric House', 'Suresh Shah', '9765432109', 'Ahmedabad', '24FGHIJ5678K2Z6', 'net15');

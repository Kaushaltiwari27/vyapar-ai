-- DROP existing tables safely if you are resetting (optional, ONLY if you have no important data):
-- DROP TABLE IF EXISTS invoices;
-- DROP TABLE IF EXISTS deals;
-- DROP TABLE IF EXISTS customers;
-- DROP TABLE IF EXISTS profiles;
-- DROP TABLE IF EXISTS businesses;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Businesses table
create table if not exists businesses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_name text,
  gstin text,
  phone text,
  address text,
  city text default 'Surat',
  state text default 'Gujarat',
  created_at timestamptz default now()
);

-- Profiles (linked to Supabase auth users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  business_id uuid references businesses(id),
  full_name text,
  role text default 'owner',
  whatsapp_number text,
  created_at timestamptz default now()
);

-- Customers
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  name text not null,
  company text,
  phone text,
  email text,
  city text,
  gstin text,
  notes text,
  total_revenue numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Deals
create table if not exists deals (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  customer_id uuid references customers(id),
  customer_name text,
  title text not null,
  value numeric default 0,
  stage text default 'Lead',
  owner_name text,
  expected_close_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invoices
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  customer_id uuid references customers(id),
  customer_name text,
  invoice_number text not null,
  issue_date date default current_date,
  due_date date,
  status text default 'draft',
  subtotal numeric default 0,
  gst_rate numeric default 18,
  gst_amount numeric default 0,
  total_amount numeric default 0,
  notes text,
  items jsonb default '[]',
  created_at timestamptz default now()
);

-- RLS Policies
alter table businesses enable row level security;
alter table profiles enable row level security;
alter table customers enable row level security;
alter table deals enable row level security;
alter table invoices enable row level security;

-- Policies

-- Profiles
DROP POLICY IF EXISTS "Users see own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Businesses
DROP POLICY IF EXISTS "Users see own business" ON businesses;
DROP POLICY IF EXISTS "Users can insert business" ON businesses;
DROP POLICY IF EXISTS "Users can update own business" ON businesses;

CREATE POLICY "Users see own business" ON businesses FOR SELECT USING (id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert business" ON businesses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own business" ON businesses FOR UPDATE USING (id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

-- Customers
DROP POLICY IF EXISTS "Users see own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;

CREATE POLICY "Users see own customers" ON customers FOR SELECT USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert customers" ON customers FOR INSERT WITH CHECK (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own customers" ON customers FOR UPDATE USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own customers" ON customers FOR DELETE USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

-- Deals
DROP POLICY IF EXISTS "Users see own deals" ON deals;
DROP POLICY IF EXISTS "Users can insert deals" ON deals;
DROP POLICY IF EXISTS "Users can update own deals" ON deals;
DROP POLICY IF EXISTS "Users can delete own deals" ON deals;

CREATE POLICY "Users see own deals" ON deals FOR SELECT USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert deals" ON deals FOR INSERT WITH CHECK (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own deals" ON deals FOR UPDATE USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own deals" ON deals FOR DELETE USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

-- Invoices
DROP POLICY IF EXISTS "Users see own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;

CREATE POLICY "Users see own invoices" ON invoices FOR SELECT USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert invoices" ON invoices FOR INSERT WITH CHECK (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own invoices" ON invoices FOR UPDATE USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own invoices" ON invoices FOR DELETE USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

-- Trigger for New User Signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_business_id uuid;
begin
  -- Insert into businesses
  insert into public.businesses (name, owner_name, phone, city, gstin)
  values (
    COALESCE(new.raw_user_meta_data->>'businessName', 'My Business'),
    new.raw_user_meta_data->>'fullName',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'city', 'Surat'),
    new.raw_user_meta_data->>'gstin'
  ) returning id into new_business_id;

  -- Insert into profiles
  insert into public.profiles (id, business_id, full_name, whatsapp_number, role)
  values (
    new.id,
    new_business_id,
    new.raw_user_meta_data->>'fullName',
    new.raw_user_meta_data->>'phone',
    'owner'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

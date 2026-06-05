-- Monthly payroll runs
create table payroll_runs (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  month integer not null,
  year integer not null,
  status text default 'draft',
  total_gross numeric default 0,
  total_pf_employee numeric default 0,
  total_pf_employer numeric default 0,
  total_esic_employee numeric default 0,
  total_esic_employer numeric default 0,
  total_tds numeric default 0,
  total_deductions numeric default 0,
  total_net_pay numeric default 0,
  employee_count integer default 0,
  processed_at timestamptz,
  processed_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique(business_id, month, year)
);

-- Per-employee payroll details
create table payroll_details (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  payroll_run_id uuid references payroll_runs(id) not null,
  employee_id uuid references employees(id) not null,
  employee_name text,
  employee_code text,
  department text,
  designation text,
  month integer not null,
  year integer not null,
  working_days integer default 26,
  present_days integer default 26,
  leave_days integer default 0,
  lop_days integer default 0,
  basic_salary numeric default 0,
  hra numeric default 0,
  other_allowances numeric default 0,
  gross_salary numeric default 0,
  lop_deduction numeric default 0,
  pf_employee numeric default 0,
  pf_employer numeric default 0,
  esic_employee numeric default 0,
  esic_employer numeric default 0,
  tds numeric default 0,
  other_deductions numeric default 0,
  total_deductions numeric default 0,
  net_pay numeric default 0,
  bank_account text,
  bank_ifsc text,
  pan_number text,
  payslip_sent boolean default false,
  created_at timestamptz default now()
);

-- Compliance calendar entries
create table compliance_calendar (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  compliance_type text not null,
  title text not null,
  description text,
  due_date date not null,
  month integer,
  year integer,
  status text default 'pending',
  amount numeric default 0,
  notes text,
  created_at timestamptz default now()
);

-- RLS
alter table payroll_runs enable row level security;
alter table payroll_details enable row level security;
alter table compliance_calendar enable row level security;

create policy "own payroll_runs" on payroll_runs for all using (business_id in (select business_id from profiles where id = auth.uid()));
create policy "own payroll_details" on payroll_details for all using (business_id in (select business_id from profiles where id = auth.uid()));
create policy "own compliance_calendar" on compliance_calendar for all using (business_id in (select business_id from profiles where id = auth.uid()));

-- Update employees table to have salary details if not present
alter table employees 
add column if not exists basic_salary numeric default 0,
add column if not exists hra numeric default 0,
add column if not exists other_allowances numeric default 0,
add column if not exists pf_applicable boolean default true,
add column if not exists esic_applicable boolean default true,
add column if not exists pan_number text,
add column if not exists bank_account text,
add column if not exists bank_ifsc text;

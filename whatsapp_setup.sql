-- WhatsApp settings per business
create table whatsapp_settings (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null unique,
  owner_phone text not null,
  is_active boolean default true,
  morning_briefing_enabled boolean default true,
  morning_briefing_time text default '08:00',
  low_stock_alerts boolean default true,
  invoice_alerts boolean default true,
  compliance_alerts boolean default true,
  leave_alerts boolean default true,
  payroll_alerts boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- All WhatsApp messages log (sent + received)
create table whatsapp_messages (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id),
  direction text not null,
  from_number text,
  to_number text,
  message_type text default 'text',
  content text,
  wa_message_id text,
  status text default 'sent',
  intent_type text,
  intent_entity text,
  action_taken text,
  action_result text,
  created_at timestamptz default now()
);

-- Pending approvals queue
create table pending_approvals (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) not null,
  owner_phone text not null,
  action_type text not null,
  entity_id uuid,
  entity_name text,
  message text,
  amount numeric,
  extra_data jsonb default '{}',
  status text default 'pending',
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

-- RLS
alter table whatsapp_settings enable row level security;
alter table whatsapp_messages enable row level security;
alter table pending_approvals enable row level security;

create policy "own whatsapp_settings" on whatsapp_settings for all using (business_id in (select business_id from profiles where id = auth.uid()));
create policy "own whatsapp_messages" on whatsapp_messages for all using (business_id in (select business_id from profiles where id = auth.uid()));
create policy "own pending_approvals" on pending_approvals for all using (business_id in (select business_id from profiles where id = auth.uid()));

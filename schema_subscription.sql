-- Add subscription fields to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT now() + interval '14 days',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz;

-- Update existing businesses to start a new 14-day trial today if they don't have one
UPDATE businesses
SET 
  plan = 'starter',
  subscription_status = 'trialing',
  trial_ends_at = now() + interval '14 days'
WHERE subscription_status IS NULL OR subscription_status = 'trialing';

-- Update the handle_new_user function to include default subscription values
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_business_id uuid;
begin
  -- Insert into businesses
  insert into public.businesses (name, owner_name, phone, city, gstin, plan, subscription_status, trial_ends_at)
  values (
    COALESCE(new.raw_user_meta_data->>'businessName', 'My Business'),
    new.raw_user_meta_data->>'fullName',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'city', 'Surat'),
    new.raw_user_meta_data->>'gstin',
    'starter',
    'trialing',
    now() + interval '14 days'
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

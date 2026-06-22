-- 1. Ensure columns exist in the businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz;

-- 2. Ensure columns exist in the profiles table to prevent discrepancies
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT (now() + interval '14 days');

-- 3. Update the handle_new_user trigger function to use the correct defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_business_id uuid;
  selected_plan text;
BEGIN
  -- Extract plan from raw_user_meta_data if present, otherwise default to 'starter'
  selected_plan := COALESCE(new.raw_user_meta_data->>'plan', 'starter');

  -- Insert into businesses
  INSERT INTO public.businesses (name, owner_name, phone, city, gstin, plan, subscription_status, trial_ends_at)
  VALUES (
    COALESCE(new.raw_user_meta_data->>'businessName', 'My Business'),
    new.raw_user_meta_data->>'fullName',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'city', 'Surat'),
    new.raw_user_meta_data->>'gstin',
    selected_plan,
    'trial',
    now() + interval '14 days'
  ) RETURNING id INTO new_business_id;

  -- Insert into profiles
  INSERT INTO public.profiles (id, business_id, full_name, whatsapp_number, role, plan, subscription_status, trial_ends_at)
  VALUES (
    new.id,
    new_business_id,
    new.raw_user_meta_data->>'fullName',
    new.raw_user_meta_data->>'phone',
    'owner',
    selected_plan,
    'trial',
    now() + interval '14 days'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

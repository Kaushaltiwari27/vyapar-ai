-- UPDATE businesses table with new razorpay and subscription fields
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS subscription_started_at timestamptz;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS razorpay_subscription_id text;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS razorpay_customer_id text;

-- CREATE payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id uuid REFERENCES businesses(id) NOT NULL,
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  razorpay_payment_id text,
  razorpay_order_id text,
  razorpay_subscription_id text,
  plan text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- RLS Policies for payment_history
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- If the policy already exists, this might error, so it's best to drop it first
DROP POLICY IF EXISTS "own payment_history" ON payment_history;
CREATE POLICY "own payment_history" ON payment_history FOR ALL USING (business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid()));

-- Also, let's make sure the trigger handles setting 'trial' as default instead of 'starter' if we are moving to select-plan flow
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  new_business_id UUID;
BEGIN
  -- Insert into businesses table, defaulting to 'trial'
  INSERT INTO public.businesses (name, plan, subscription_status, trial_ends_at)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'businessName', 'My Business'),
    'trial',
    'trial',
    now() + interval '14 days'
  )
  RETURNING id INTO new_business_id;

  -- Insert into profiles table
  INSERT INTO public.profiles (id, full_name, role, business_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'fullName', 'New User'),
    'owner',
    new_business_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

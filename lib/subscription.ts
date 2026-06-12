import { createClient } from '@supabase/supabase-js'
import { Plan } from './plans'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getBusinessWithPlan(userId: string) {
  // Get profile to find business
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', userId)
    .single()
    
  if (!profile?.business_id) return null;

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', profile.business_id)
    .single()
    
  return business
}

export async function activateSubscription(businessId: string, plan: Plan, razorpaySubId: string) {
  const { error } = await supabase
    .from('businesses')
    .update({
      plan,
      subscription_status: 'active',
      subscription_started_at: new Date().toISOString(),
      razorpay_subscription_id: razorpaySubId
    })
    .eq('id', businessId)
  return !error
}

export async function expireTrials() {
  const { error } = await supabase
    .from('businesses')
    .update({ subscription_status: 'expired' })
    .eq('subscription_status', 'trial')
    .lt('trial_ends_at', new Date().toISOString())
  return !error
}

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, businessName, phone, city, gstin, plan } = body;

    const adminAuthClient = createAdminClient();

    // Create user using admin API which bypasses rate limits and email confirmation
    const { data, error } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        fullName,
        businessName,
        phone,
        city,
        gstin: gstin || null,
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // The database trigger automatically creates a business with plan='starter'.
    // Update both business and profile with chosen plan details.
    const chosenPlan = plan || 'starter';
    const trialEndsAt = new Date(Date.now() + 14 * 86400000).toISOString();

    if (data.user) {
      const { data: profile } = await adminAuthClient
        .from('profiles')
        .select('business_id')
        .eq('id', data.user.id)
        .single();

      if (profile?.business_id) {
        // Update business subscription details
        await adminAuthClient
          .from('businesses')
          .update({ 
            plan: chosenPlan,
            subscription_status: 'trialing',
            trial_ends_at: trialEndsAt
          })
          .eq('id', profile.business_id);

        // Update profile subscription details
        await adminAuthClient
          .from('profiles')
          .update({
            plan: chosenPlan,
            subscription_status: 'trial',
            trial_ends_at: trialEndsAt
          })
          .eq('id', data.user.id);
      }
    }

    return NextResponse.json({ user: data.user });
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

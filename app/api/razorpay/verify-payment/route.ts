import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan, profileId, businessId, amount } = await req.json()

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return Response.json({ success: false, error: 'Razorpay secret not configured' }, { status: 500 })
    }

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return Response.json({ success: false, error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update the business subscription status
    await supabase.from('businesses').update({
      plan,
      subscription_status: 'active',
      subscription_started_at: new Date().toISOString(),
      razorpay_subscription_id: razorpay_payment_id
    }).eq('id', businessId)

    // Log the payment
    await supabase.from('payment_history').insert({
      business_id: businessId,
      profile_id: profileId,
      razorpay_payment_id,
      razorpay_order_id,
      plan,
      amount: amount / 100,
      status: 'paid'
    })

    return Response.json({ success: true })
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return Response.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

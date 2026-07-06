'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import Image from 'next/image'
import { CheckCircle2, ShieldAlert } from 'lucide-react'

declare global { interface Window { Razorpay: any } }

export default function SubscribePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*, businesses(name)').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    })
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    document.body.appendChild(script)
  }, [supabase])

  const plans = [
    { id: 'starter', name: 'Basic', amount: 99900, display: '₹999', desc: 'Solo founders', color: '#1D9E75' },
    { id: 'growth', name: 'Intermediate', amount: 249900, display: '₹2,499', desc: 'Growing businesses', color: '#2563EB', recommended: true },
    { id: 'business', name: 'Advance', amount: 499900, display: '₹4,999', desc: 'Full enterprise stack', color: '#7C3AED' }
  ]

  async function handlePayment(plan: typeof plans[0]) {
    setLoading(plan.id)
    try {
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.amount, plan: plan.id, businessId: profile?.business_id })
      })
      const order = await orderRes.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: plan.amount,
        currency: 'INR',
        name: 'VyaparAI',
        description: `${plan.name} Plan - Monthly`,
        image: '/logo.png',
        order_id: order.id,
        prefill: {
          name: profile?.full_name || '',
          email: ''
        },
        theme: { color: plan.color },
        handler: async function(response: any) {
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.id,
              profileId: profile?.id,
              businessId: profile?.business_id,
              amount: plan.amount
            })
          })
          const result = await verifyRes.json()
          if (result.success) {
            window.location.href = '/dashboard?subscribed=true'
          } else {
            alert('Payment verification failed.')
          }
        },
        modal: { ondismiss: () => setLoading(null) }
      }
      new window.Razorpay(options).open()
    } catch (err) {
      console.error(err)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans p-6">
      <div className="max-w-4xl w-full">
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Aapka free trial khatam ho gaya</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Continue karne ke liye ek plan choose karein — aapka poora data safe hai aur wahi se shuru hoga jahan aapne chhoda tha.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left items-stretch mb-8">
          {plans.map(plan => (
            <div 
              key={plan.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col relative"
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-[10px] px-3 py-1 rounded-full whitespace-nowrap shadow-md">
                  RECOMMENDED
                </div>
              )}
              
              <div className="text-lg font-bold text-slate-900 mb-1">{plan.name}</div>
              <div className="text-sm text-slate-500 font-medium mb-4">{plan.desc}</div>
              
              <div className="text-2xl font-extrabold text-slate-900 mb-6">{plan.display}<span className="text-sm text-slate-500 font-medium font-normal">/mo</span></div>

              <button
                onClick={() => handlePayment(plan)}
                disabled={loading !== null}
                className="w-full mt-auto py-3 rounded-xl text-sm font-bold text-white transition-all shadow-md"
                style={{
                  background: plan.recommended ? 'linear-gradient(135deg, #2563EB, #7C3AED)' : plan.color,
                  opacity: loading === plan.id ? 0.7 : 1
                }}
              >
                {loading === plan.id ? 'Processing...' : `${plan.display}/mo se shuru karo`}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Aapka data safe hai — customers, deals, invoices sab waisa hi rahega
        </div>
      </div>
    </div>
  )
}

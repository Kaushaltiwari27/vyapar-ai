'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/client'
import Image from 'next/image'
import { CheckCircle2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

function SelectPlanContent() {
  const searchParams = useSearchParams()
  const initialPlan = searchParams.get('plan') || 'growth'
  const [selected, setSelected] = useState(initialPlan)
  const [loading, setLoading] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('business_id').eq('id', user.id).single().then(({ data }) => {
        if (data?.business_id) setBusinessId(data.business_id)
      })
    })
  }, [supabase])

  const plans = [
    { id: 'starter', name: 'Basic', price: '₹999/mo', desc: 'Solo founders', color: '#1D9E75', features: ['CRM (Customers, Deals, Invoices)', 'HRMS (Employees, Attendance, Leaves)', 'AI Chat (50 msgs/day)', 'No Inventory/WhatsApp/Payroll'] },
    { id: 'growth', name: 'Intermediate', price: '₹2,499/mo', desc: 'Growing businesses', color: '#2563EB', recommended: true, features: ['Everything in Basic plan', 'Inventory & Stock Management', 'Vendor Directory & POs', 'GST Report Filing', 'No WhatsApp/Payroll'] },
    { id: 'business', name: 'Advance', price: '₹4,999/mo', desc: 'Enterprise stack', color: '#7C3AED', features: ['Everything in Intermediate', 'WhatsApp OS Integration', 'Payroll & Statutory Compliance', 'Priority Support & Onboarding'] }
  ]

  async function startTrial() {
    if (!businessId) return
    setLoading(true)

    await supabase.from('businesses').update({
      plan: selected,
      subscription_status: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString()
    }).eq('id', businessId)

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Simple Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="VyaparAI" width={120} height={32} className="object-contain" priority />
        </div>
      </header>

      <main className="flex-1 pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Apna plan chuniye</h1>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
            14 din bilkul free — koi payment nahi. Baad mein upgrade ya cancel karo.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left items-stretch mb-12">
            {plans.map(plan => (
              <div 
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`p-8 rounded-3xl bg-white border-2 shadow-sm flex flex-col hover:shadow-md transition-all cursor-pointer relative ${selected === plan.id ? 'scale-105 shadow-xl z-10' : ''}`}
                style={{
                  borderColor: selected === plan.id ? plan.color : '#e2e8f0',
                }}
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs px-4 py-1.5 rounded-full whitespace-nowrap shadow-md">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-800 font-bold text-xs rounded-full mb-6 w-fit" style={{ color: plan.color, backgroundColor: `${plan.color}20` }}>
                  {plan.name}
                </div>
                
                <div className="text-3xl font-extrabold text-slate-900 mb-2">{plan.price}</div>
                <div className="text-sm text-slate-500 font-medium mb-6">{plan.desc}</div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: plan.color }} /> {f}
                    </li>
                  ))}
                </ul>

                {selected === plan.id && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-6 h-6" style={{ color: plan.color }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="max-w-md mx-auto">
            <Button 
              onClick={startTrial}
              disabled={loading || !businessId}
              className="w-full py-6 rounded-xl text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/20"
              style={{ background: 'var(--grad-button)' }}
            >
              {loading ? 'Shuru ho raha hai...' : '14 din free mein shuru karo →'}
            </Button>
            <p className="mt-4 text-sm text-slate-500 font-medium">No credit card required • Cancel anytime</p>
          </div>

        </div>
      </main>
    </div>
  )
}

export default function SelectPlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading plans...</div>}>
      <SelectPlanContent />
    </Suspense>
  )
}

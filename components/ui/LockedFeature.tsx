'use client'
import Link from 'next/link'
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react'

const planNames = {
  starter: 'Basic',
  growth: 'Intermediate',
  business: 'Advance'
}

const planPrices = {
  starter: '₹999',
  growth: '₹2,499',
  business: '₹4,999'
}

interface LockedFeatureProps {
  feature: string
  requiredPlan: 'starter' | 'growth' | 'business'
}

export default function LockedFeature({ feature, requiredPlan }: LockedFeatureProps) {
  const planName = planNames[requiredPlan] || 'Premium'
  const planPrice = planPrices[requiredPlan] || ''

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-[calc(100vh-100px)] animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />

        {/* Lock Icon */}
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-8 ring-indigo-50/40 relative z-10">
          <Lock className="w-10 h-10" />
        </div>

        {/* Locked Feature Title */}
        <h2 className="text-2xl font-extrabold text-slate-900 mb-3 relative z-10">
          {feature} is Locked
        </h2>

        {/* Explanation */}
        <p className="text-sm text-slate-600 leading-relaxed mb-6 px-2">
          Yeh feature humare <span className="font-extrabold text-indigo-600">{planName}</span> plan mein available hai.
          Upgrade karein aur VyaparAI ke professional dashboard tools use karein.
        </p>

        {/* Pricing tag */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 mb-8 flex justify-between items-center text-left">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Required Plan</p>
            <p className="text-lg font-extrabold text-slate-900">{planName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pricing</p>
            <p className="text-xl font-black text-indigo-600">{planPrice}<span className="text-xs text-slate-500 font-normal">/mo</span></p>
          </div>
        </div>

        {/* Upgrade Button */}
        <Link 
          href="/subscribe"
          className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40"
          style={{ background: 'var(--grad-button)' }}
        >
          Upgrade Now <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Footnote */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>All your existing data remains secure.</span>
        </div>
      </div>
    </div>
  )
}

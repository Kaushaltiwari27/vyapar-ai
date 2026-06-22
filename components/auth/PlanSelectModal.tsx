'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, Shield, Users, MessageSquare, Zap, Smartphone, ArrowRight } from 'lucide-react'

interface PlanSelectModalProps {
  isOpen: boolean
  onClose: () => void
  redirectPath?: string
}

export default function PlanSelectModal({ isOpen, onClose, redirectPath = '/dashboard' }: PlanSelectModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'business'>('growth')
  const router = useRouter()

  const plans = [
    {
      id: 'starter' as const,
      name: 'Basic',
      price: '₹999',
      period: '/ month',
      desc: 'Solo founders and small startups.',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
      icon: Shield,
      features: [
        'CRM (Customers, Deals & Invoices)',
        'HRMS (Employees, Attendance & Leaves)',
        'AI Chat Assistant (50 msgs/day)',
        'Bilingual Support (Hindi/English)'
      ],
      notIncluded: [
        'WhatsApp OS Integration',
        'Inventory & Vendor Management',
        'Payroll & Compliance Calendar'
      ]
    },
    {
      id: 'growth' as const,
      name: 'Intermediate',
      price: '₹2,499',
      period: '/ month',
      desc: 'Perfect for growing businesses.',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.08)',
      icon: Zap,
      recommended: true,
      features: [
        'Everything in Basic plan',
        'Inventory & Vendor Management',
        'Purchase Orders Tracking',
        'GST filing integrations',
        '14-Day Free Trial (No Card Needed)'
      ],
      notIncluded: [
        'WhatsApp OS Integration',
        'Payroll processing & TDS/PF/ESIC',
        'Priority onboarding'
      ]
    },
    {
      id: 'business' as const,
      name: 'Advance',
      price: '₹4,999',
      period: '/ month',
      desc: 'Full enterprise automation stack.',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.08)',
      icon: Smartphone,
      features: [
        'Everything in Intermediate plan',
        'WhatsApp OS Automation (Unlimited)',
        'Full Payroll & HRMS Compliance',
        'Compliance calendar & auto-filing',
        'Dedicated onboarding manager',
        'Priority 24/7 Support'
      ],
      notIncluded: []
    }
  ]

  const handleProceed = (action: 'signup' | 'login') => {
    onClose()
    const encodedRedirect = encodeURIComponent(redirectPath)
    router.push(`/${action}?plan=${selectedPlan}&redirect=${encodedRedirect}`)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Apna Plan Chuniye <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1 rounded-full">Trial Active</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Get started with a 14-day free trial on Intermediate, or select our Basic/Advance plans.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto flex-1 grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon
              const isSelected = selectedPlan === plan.id

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-6 rounded-3xl border-2 flex flex-col cursor-pointer transition-all relative ${
                    isSelected
                      ? 'scale-[1.02] shadow-lg bg-slate-50/30'
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-sm bg-white'
                  }`}
                  style={{
                    borderColor: isSelected ? plan.color : undefined
                  }}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                      Recommended
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: plan.bgColor, color: plan.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-6 h-6" style={{ color: plan.color }} />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium min-h-[32px]">{plan.desc}</p>

                  <div className="my-5 flex items-baseline">
                    <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-500 font-medium ml-1">{plan.period}</span>
                  </div>

                  {/* Feature Lists */}
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">What's Included</div>
                      <ul className="space-y-2.5">
                        {plan.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: plan.color }} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.notIncluded.length > 0 && (
                      <div className="pt-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Not Included</div>
                        <ul className="space-y-2.5 opacity-60">
                          {plan.notIncluded.map((f, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-500 font-medium line-through decoration-slate-300">
                              <X className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              Selected Plan: <strong className="text-slate-800 capitalize font-bold">{selectedPlan}</strong> • No credit card required to start trial.
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleProceed('login')}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all text-center"
              >
                Already have account? Log In
              </button>
              <button
                onClick={() => handleProceed('signup')}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95"
                style={{ background: 'var(--grad-button)' }}
              >
                Register & Start Free Trial <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

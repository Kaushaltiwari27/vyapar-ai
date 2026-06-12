import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function UpgradePrompt({ feature, requiredPlan }: { feature: string, requiredPlan: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-[calc(100vh-100px)]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">{feature} is locked</h2>
        <p className="text-slate-600 mb-8">
          Yeh feature {requiredPlan} plan mein available hai. Upgrade karo aur aapka poora data safe rahega.
        </p>
        <Link 
          href="/subscribe"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
          style={{ background: 'var(--grad-button)' }}
        >
          Upgrade karo →
        </Link>
      </div>
    </div>
  )
}

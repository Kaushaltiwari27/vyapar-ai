"use client";

import { usePlan } from '@/components/providers/PlanProvider';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function PlanGuard({ 
  children, 
  allowedPlans = ['growth', 'business'] 
}: { 
  children: React.ReactNode, 
  allowedPlans?: string[] 
}) {
  const { plan } = usePlan();

  if (allowedPlans.includes(plan)) {
    return <>{children}</>;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-[calc(100vh-100px)]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Upgrade Required</h2>
        <p className="text-slate-600 mb-8">
          This feature is not available on the Starter plan. Upgrade to the Growth or Business plan to unlock advanced capabilities.
        </p>
        <Link 
          href="/upgrade"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
          style={{ background: 'var(--grad-button)' }}
        >
          View Upgrade Options
        </Link>
      </div>
    </div>
  );
}

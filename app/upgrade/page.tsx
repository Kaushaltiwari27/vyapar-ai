"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function UpgradePage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  const handleUpgrade = async (plan: string) => {
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        throw new Error('Failed to upgrade');
      }

      toast.success('Subscription activated successfully!');
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to process upgrade. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Simple Header */}
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="VyaparAI" width={120} height={32} className="object-contain" priority />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Checkout
        </div>
      </header>

      <main className="flex-1 pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 font-bold text-sm mb-6 shadow-sm border border-amber-200">
            <AlertTriangle className="w-4 h-4" /> Your 14-day free trial has expired
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Choose a plan to continue</h1>
          <p className="text-lg text-slate-600 mb-16 max-w-2xl mx-auto">
            All your data is safe and exactly where you left it. Select a package below to instantly restore access to your dashboard.
          </p>

          {/* PRICING GRID */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left items-stretch">
            
            {/* Starter Tier */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="inline-block px-3 py-1 bg-slate-100 text-slate-800 font-bold text-xs rounded-full mb-6 w-fit">
                Starter
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-6 flex items-baseline">
                ₹999<span className="text-base text-slate-500 font-medium ml-2">/ month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Freelancers, solo founders</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> CRM + Invoice + AI chat</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Up to 5 users</li>
              </ul>
              <div className="mt-auto pt-6 border-t border-slate-100">
                <p className="text-slate-500 text-sm font-medium mb-4 text-center">Perfect for small teams starting out.</p>
                <Button 
                  onClick={() => handleUpgrade('starter')}
                  disabled={loadingPlan !== null}
                  className="w-full py-6 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 transition-all duration-300 hover:bg-slate-200"
                >
                  {loadingPlan === 'starter' ? 'Processing...' : 'Select Starter Plan'}
                </Button>
              </div>
            </div>

            {/* Growth Tier */}
            <div className="p-8 rounded-3xl bg-white border-2 border-blue-500 shadow-xl relative flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs px-4 py-1.5 rounded-full whitespace-nowrap shadow-md">
                MOST POPULAR
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-6 mt-2 flex items-baseline">
                ₹2,499<span className="text-base text-slate-500 font-medium ml-2">/ month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> 10-50 employee SMBs</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> Full CRM + ERP + HRMS</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> WhatsApp OS + GST filing</li>
              </ul>
              <div className="mt-auto pt-6 border-t border-slate-100">
                <p className="text-slate-500 text-sm font-medium mb-4 text-center">Everything you need to scale your business.</p>
                <Button 
                  onClick={() => handleUpgrade('growth')}
                  disabled={loadingPlan !== null}
                  className="w-full py-6 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                  style={{ background: 'var(--grad-button)' }}
                >
                  {loadingPlan === 'growth' ? 'Processing...' : 'Select Growth Plan'}
                </Button>
              </div>
            </div>

            {/* Business Tier */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="inline-block px-3 py-1 bg-slate-100 text-slate-800 font-bold text-xs rounded-full mb-6 w-fit">
                Business
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-6 flex items-baseline">
                ₹4,999<span className="text-base text-slate-500 font-medium ml-2">/ month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" /> 50-200 employee companies</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" /> Sab kuch + priority support</li>
                <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" /> Dedicated onboarding</li>
              </ul>
              <div className="mt-auto pt-6 border-t border-slate-100">
                <p className="text-slate-500 text-sm font-medium mb-4 text-center">Advanced features for large teams.</p>
                <Button 
                  onClick={() => handleUpgrade('business')}
                  disabled={loadingPlan !== null}
                  className="w-full py-6 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 transition-all duration-300 hover:bg-slate-200"
                >
                  {loadingPlan === 'business' ? 'Processing...' : 'Select Business Plan'}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

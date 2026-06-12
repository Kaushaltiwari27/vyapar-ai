import Link from "next/link";
import { ShieldCheck, CheckCircle2, Zap, ArrowRight, Activity, Users, Database } from "lucide-react";
import Image from "next/image";
import { APP_FEATURES } from "@/lib/features";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A14] flex flex-col font-sans selection:bg-[#4F46E5]/30 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 bg-[rgba(10,10,20,0.7)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]">
        <div className="w-full flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="VyaparAI" 
              width={160} 
              height={45} 
              className="filter brightness-0 invert object-contain"
              priority
            />
          </div>
          <div className="space-x-6 flex items-center">
            <Link href="/login" className="text-[rgba(255,255,255,0.7)] hover:text-white font-medium text-sm transition-colors">
              Log In
            </Link>
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(37,99,235,0.35)]"
              style={{ background: 'var(--grad-button)' }}
            >
              Try for Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-20">
        <section className="relative pt-32 pb-40 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
          {/* Animated gradient orbs in background */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--primary-brand)] rounded-full blur-[120px] opacity-20 animate-float" />
          <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--accent-brand)] rounded-full blur-[100px] opacity-20 animate-float" style={{ animationDelay: '1s' }} />
          
          <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] mb-8 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-[#38ef7d] animate-pulse"></span>
              <span className="text-xs font-medium text-[rgba(255,255,255,0.8)]">VyaparAI 2.0 is now live</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 animate-slide-up leading-tight">
              India ka pehla <br className="hidden md:block"/>
              <span className="gradient-text">AI Business Brain</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[rgba(255,255,255,0.6)] mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              CRM, HRMS, Payroll, and Invoicing powered by Artificial Intelligence. 
              Built exclusively for modern Indian SMBs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl text-base font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(37,99,235,0.35)]"
                style={{ background: 'var(--grad-button)' }}
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl text-base font-semibold text-white transition-all duration-300 hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-sm"
              >
                Watch Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 relative z-10 bg-[#0A0A14]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">A complete intelligent suite.</h2>
              <p className="text-[rgba(255,255,255,0.5)] max-w-2xl mx-auto text-lg">Everything you need to run your business, seamlessly connected.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {APP_FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.id} className="relative group p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(79,70,229,0.15)] bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl">
                    {feature.isNew && (
                      <div className="absolute top-6 right-6 bg-[rgba(79,70,229,0.2)] text-[#8B5CF6] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[rgba(79,70,229,0.3)]">
                        New
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110" style={{ background: 'var(--grad-subtle)' }}>
                      <Icon className="w-6 h-6 text-[#2563EB]" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 relative z-10 bg-[#05050A] border-t border-[rgba(255,255,255,0.05)]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-16">Enterprise power, SMB pricing.</h2>
            
            <div className="p-10 relative max-w-md mx-auto rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-[0_0_40px_rgba(79,70,229,0.1)] backdrop-blur-xl">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-[var(--primary-brand)] to-[var(--accent-brand)] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 mt-2">Premium Edition</h3>
              <div className="text-5xl font-bold text-white mb-6 mt-4 flex items-baseline justify-center">
                ₹2,499<span className="text-sm text-[rgba(255,255,255,0.5)] font-medium ml-2">/ user / month</span>
              </div>
              <p className="text-[rgba(255,255,255,0.6)] mb-8 pb-8 border-b border-[rgba(255,255,255,0.06)] text-sm">Billed annually. Full access to CRM, HRMS, and AI.</p>
              
              <ul className="space-y-4 text-left mb-10">
                {['Unlimited Customers & Invoices', 'Full HRMS & Payroll Engine', 'Advanced AI Chat Assistant', '24/7 Priority Support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-[var(--primary-brand)] flex-shrink-0" />
                    <span className="text-[rgba(255,255,255,0.8)]">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/signup"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_15px_rgba(37,99,235,0.35)]"
                style={{ background: 'var(--grad-button)' }}
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#05050A] border-t border-[rgba(255,255,255,0.05)] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="VyaparAI" 
              width={120} 
              height={32} 
              className="filter brightness-0 invert object-contain"
            />
          </div>
          <div className="flex gap-8 text-sm text-[rgba(255,255,255,0.5)]">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-[rgba(255,255,255,0.3)] text-sm">&copy; {new Date().getFullYear()} VyaparAI, Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

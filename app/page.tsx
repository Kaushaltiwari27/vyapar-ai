'use client';

import Link from "next/link";
import { ShieldCheck, CheckCircle2, Zap, ArrowRight, Activity, Users, Database, Globe, Lock, PlayCircle, Star, MessageSquare, XCircle } from "lucide-react";
import Image from "next/image";
import { APP_FEATURES } from "@/lib/features";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PlanSelectModal from "@/components/auth/PlanSelectModal";

function Preloader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <Image src="/logo.png" alt="VyaparAI" width={200} height={60} className="object-contain" priority />
      </motion.div>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
        className="h-1 mt-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
      />
    </motion.div>
  );
}

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/dashboard');

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });
  }, [supabase]);

  const handleActionClick = (e: React.MouseEvent<any>, path: string = '/dashboard') => {
    if (user) {
      router.push(path);
      return;
    }
    e.preventDefault();
    setRedirectPath(path);
    setIsPlanModalOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#4F46E5]/30 selection:text-slate-900"
      >
        <LandingNavbar />

      {/* Hero Section */}
      <main className="flex-1 pt-20">
        <section className="relative pt-32 pb-40 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
          {/* Animated gradient orbs in background */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--primary-brand)] rounded-full blur-[120px] opacity-20 animate-float" />
          <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--accent-brand)] rounded-full blur-[100px] opacity-20 animate-float" style={{ animationDelay: '1s' }} />
          
          <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              VyaparAI 2.0 is now live
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              India ka pehla <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600">AI Business Brain</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
              Automate sales, service, HR, and marketing with humans and AI agents working together on one trusted, agentic CRM platform. See value from day one with quick and easy setup.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              {user ? (
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl text-base font-bold text-white transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-500/20"
                  style={{ background: 'var(--grad-button)' }}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button 
                  onClick={(e) => handleActionClick(e, '/dashboard')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl text-base font-bold text-white transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-500/20"
                  style={{ background: 'var(--grad-button)' }}
                >
                  Start Free Trial
                </button>
              )}
              <Link 
                href="/login"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    setIsPlanModalOpen(true);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl text-base font-bold text-slate-700 bg-white border border-slate-200 transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              >
                <PlayCircle className="w-5 h-5 text-blue-600" /> Watch Demo
              </Link>
            </div>

            {/* Premium SaaS Mockup Preview */}
            <motion.div 
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="mt-16 w-full max-w-4xl mx-auto rounded-3xl bg-slate-950 border border-slate-800/80 p-2.5 shadow-2xl relative z-10 overflow-hidden text-left"
            >
              {/* Window Header */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-850 bg-slate-900/40">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[10px] text-slate-500 font-bold ml-4 tracking-widest uppercase">dashboard.vyapar.ai</span>
              </div>

              {/* Layout body */}
              <div className="grid md:grid-cols-4 gap-4 p-4">
                {/* Sidebar Mockup */}
                <div className="hidden md:flex flex-col gap-3 border-r border-slate-900 pr-4">
                  <div className="h-6 bg-slate-900 rounded-md w-3/4 animate-pulse" />
                  <div className="h-5 bg-slate-900/50 rounded-md w-full" />
                  <div className="h-5 bg-slate-900/50 rounded-md w-5/6" />
                  <div className="h-5 bg-slate-900/50 rounded-md w-4/5" />
                  <div className="h-5 bg-slate-900/50 rounded-md w-full" />
                  
                  <div className="mt-auto h-12 bg-slate-900/30 border border-slate-850 rounded-xl p-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-blue-500/30">RK</div>
                    <div className="flex-1 min-w-0">
                      <div className="h-2.5 bg-slate-800 rounded-full w-2/3" />
                      <div className="h-2 bg-slate-800 rounded-full w-1/2 mt-1.5" />
                    </div>
                  </div>
                </div>

                {/* Content Mockup */}
                <div className="md:col-span-3 space-y-4">
                  {/* Top Bar Mockup */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <div className="h-4 bg-slate-900 rounded-full w-1/3" />
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-xs">🔔</span>
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center">RK</div>
                    </div>
                  </div>

                  {/* Dashboard stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-3">
                      <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Pipeline</p>
                      <p className="text-sm md:text-base font-extrabold text-white mt-1">₹4,85,000</p>
                      <span className="text-[8px] text-emerald-500 font-bold mt-0.5 inline-block">↑ 15% this month</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-3">
                      <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">Invoices Due</p>
                      <p className="text-sm md:text-base font-extrabold text-rose-500 mt-1">₹1,24,500</p>
                      <span className="text-[8px] text-rose-400 font-bold mt-0.5 inline-block">2 Overdue</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-3">
                      <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">HR Active</p>
                      <p className="text-sm md:text-base font-extrabold text-blue-400 mt-1">12 / 13</p>
                      <span className="text-[8px] text-slate-400 font-semibold mt-0.5 inline-block">1 Leave request</span>
                    </div>
                  </div>

                  {/* AI Chat Box */}
                  <div className="border border-slate-850 bg-slate-900/20 rounded-xl p-4 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
                    
                    {/* User */}
                    <div className="flex gap-2 items-start justify-end">
                      <div className="bg-blue-600 text-white text-[11px] px-3 py-1.5 rounded-xl rounded-tr-none font-medium max-w-[80%]">
                        Show me today's business health summary.
                      </div>
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">U</span>
                    </div>

                    {/* AI Agent */}
                    <div className="flex gap-2 items-start">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">AI</span>
                      <div className="bg-slate-900/80 text-slate-200 text-[11px] px-3 py-2 rounded-xl rounded-tl-none font-medium max-w-[85%] border border-slate-850 leading-relaxed">
                        Good morning Ramesh! Today your Sales Pipeline is up by <span className="text-emerald-400 font-bold">15%</span>, 2 invoices are overdue, and low stock alert triggered for <span className="text-amber-400 font-semibold">Fortune Oil</span>. Should I generate a purchase order?
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex gap-2 pl-7 pt-1">
                      <button className="bg-slate-900 border border-slate-800 text-[9px] text-slate-400 font-bold px-2.5 py-1 rounded-md hover:bg-slate-850 hover:text-white transition-colors cursor-pointer">
                        Generate PO
                      </button>
                      <button className="bg-slate-900 border border-slate-800 text-[9px] text-slate-400 font-bold px-2.5 py-1 rounded-md hover:bg-slate-850 hover:text-white transition-colors cursor-pointer">
                        Email Overdue Customers
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
            
            <div className="mt-12 text-sm font-semibold text-slate-500">
              Trusted by 10,000+ modern Indian SMBs
            </div>
          </div>
        </section>

        {/* Agentforce / AI Assistants Section */}
        <section id="solutions" className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                  Welcome to the <span className="text-blue-600">Agentic Enterprise.</span>
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Humans and AI agents work inside the systems that run your business. The result? Faster decisions, stronger customer relationships, and nonstop growth, all delivered via WhatsApp, your personal AI agent.
                </p>
                <div className="space-y-6">
                  {[
                    { title: "WhatsApp OS", desc: "Where people, data, apps, and agents work together seamlessly.", icon: MessageSquare },
                    { title: "Vyapar Agentforce", desc: "Delivers always-on intelligent agents for customers and employees.", icon: Zap },
                    { title: "Unified Data 360", desc: "Gives everyone real-time context on inventory, leads, and payroll.", icon: Database }
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
                          <p className="text-slate-600 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-50 rounded-[3rem] transform rotate-3" />
                <div className="relative bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                  <Image src="/logo.png" alt="VyaparAI App" width={400} height={400} className="w-full object-cover rounded-2xl" />
                  
                  {/* Floating Notification */}
                  <div className="absolute -left-8 top-12 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Lead Converted</p>
                      <p className="text-xs text-slate-500">By AI Assistant</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Success / Trust */}
        <section id="customers" className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/50 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">See why Indian companies trust us to grow.</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">VyaparAI gave us the agility and ease of use to quickly build transparent and service-oriented journeys.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Sanjay Rastogi", company: "Rastogi Enterprises", quote: "Salesforce level features at a fraction of the cost. Our sales went up 30%.", rating: 5 },
                { name: "Priya Sharma", company: "Sharma Logistics", quote: "The WhatsApp AI bot handles 60% of our customer queries automatically. Game changer.", rating: 5 },
                { name: "Rahul Verma", company: "Verma Manufacturing", quote: "Inventory and Payroll in one place. It truly is the AI brain of our business.", rating: 5 }
              ].map((testimonial, i) => (
                <div key={i} className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, j) => <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-lg font-medium text-slate-300 mb-8">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-slate-400">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 bg-white border-t border-slate-100 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-16">Enterprise power, SMB pricing.</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left items-stretch">
              
              {/* Basic Tier */}
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-800 font-bold text-xs rounded-full mb-6 w-fit">
                  Basic
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mb-6 flex items-baseline">
                  ₹999<span className="text-base text-slate-500 font-medium ml-2">/ month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> CRM (Customers & Deals & Invoices)</li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> HRMS (Employees & Attendance & Leaves)</li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> AI Chat Assistant</li>
                  <li className="flex items-center gap-3 text-slate-400 font-medium opacity-60"><XCircle className="w-4 h-4 text-slate-400 shrink-0" /> <span className="line-through">Inventory Management</span></li>
                  <li className="flex items-center gap-3 text-slate-400 font-medium opacity-60"><XCircle className="w-4 h-4 text-slate-400 shrink-0" /> <span className="line-through">WhatsApp Automation</span></li>
                  <li className="flex items-center gap-3 text-slate-400 font-medium opacity-60"><XCircle className="w-4 h-4 text-slate-400 shrink-0" /> <span className="line-through">Payroll Compliance</span></li>
                </ul>
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <p className="text-slate-500 text-sm font-medium mb-4 text-center">Perfect for small teams starting out.</p>
                  {user ? (
                    <Link 
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] shadow-md"
                      style={{ background: 'var(--grad-button)' }}
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setRedirectPath('/dashboard');
                        setIsPlanModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 transition-all duration-300 hover:bg-slate-200"
                    >
                      Choose Basic
                    </button>
                  )}
                </div>
              </div>

              {/* Intermediate Tier */}
              <div className="p-8 rounded-3xl bg-white border-2 border-blue-500 shadow-xl relative flex flex-col transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs px-4 py-1.5 rounded-full whitespace-nowrap shadow-md">
                  MOST POPULAR (14-DAY TRIAL)
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mb-6 mt-2 flex items-baseline">
                  ₹2,499<span className="text-base text-slate-500 font-medium ml-2">/ month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> Everything in Basic plan</li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> Inventory & Stock Management</li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> Vendor Directory & POs</li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> GST Report Filing</li>
                  <li className="flex items-center gap-3 text-slate-400 font-medium opacity-60"><XCircle className="w-4 h-4 text-slate-400 shrink-0" /> <span className="line-through">WhatsApp Automation</span></li>
                  <li className="flex items-center gap-3 text-slate-400 font-medium opacity-60"><XCircle className="w-4 h-4 text-slate-400 shrink-0" /> <span className="line-through">Payroll Compliance</span></li>
                </ul>
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <p className="text-slate-500 text-sm font-medium mb-4 text-center">Everything you need to scale your business.</p>
                  {user ? (
                    <Link 
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] shadow-md"
                      style={{ background: 'var(--grad-button)' }}
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setRedirectPath('/dashboard');
                        setIsPlanModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                      style={{ background: 'var(--grad-button)' }}
                    >
                      Start 14-Day Free Trial
                    </button>
                  )}
                </div>
              </div>

              {/* Advance Tier */}
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="inline-block px-3 py-1 bg-slate-100 text-slate-800 font-bold text-xs rounded-full mb-6 w-fit">
                  Advance
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mb-6 flex items-baseline">
                  ₹4,999<span className="text-base text-slate-500 font-medium ml-2">/ month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" /> Everything in Intermediate</li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" /> WhatsApp OS Integration</li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" /> Payroll & Statutory Compliance</li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium"><CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" /> Priority Support & Onboarding</li>
                </ul>
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <p className="text-slate-500 text-sm font-medium mb-4 text-center">Advanced features for large teams.</p>
                  {user ? (
                    <Link 
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] shadow-md"
                      style={{ background: 'var(--grad-button)' }}
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setRedirectPath('/dashboard');
                        setIsPlanModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 transition-all duration-300 hover:bg-slate-200"
                    >
                      Choose Advance
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="VyaparAI" 
              width={120} 
              height={32} 
              className="object-contain"
            />
          </div>
          <div className="flex gap-8 text-sm font-semibold text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
          <div className="text-slate-400 font-medium text-sm">&copy; {new Date().getFullYear()} VyaparAI, Inc. All rights reserved.</div>
        </div>
      </footer>
      </motion.div>

      {/* Plan Selection Modal */}
      <PlanSelectModal 
        isOpen={isPlanModalOpen} 
        onClose={() => setIsPlanModalOpen(false)} 
        redirectPath={redirectPath} 
      />
    </>
  );
}

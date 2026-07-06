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
      <main className="flex-1">
        <section className="relative pt-28 pb-20 overflow-hidden flex flex-col items-center justify-center min-h-[95vh] bg-slate-50/40">
          {/* Animated gradient orbs in background */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] opacity-30 animate-float" />
          <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] opacity-30 animate-float" style={{ animationDelay: '1s' }} />

          {/* Left CRM Side Card */}
          <div 
            className="hidden lg:block absolute top-[180px] left-12 w-[clamp(180px,13vw,240px)] bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xl z-20 animate-slide-in-left delay-600"
          >
            <div className="aspect-[240/220] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-3 relative group">
              <div className="w-full h-full flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">Active Deal</span>
                  <span className="text-[9px] text-slate-400 font-medium">9:30 AM</span>
                </div>
                <div className="h-14 w-full flex items-end gap-1.5 pt-2">
                  <div className="bg-slate-200 rounded-sm w-full h-1/3" />
                  <div className="bg-slate-200 rounded-sm w-full h-1/2" />
                  <div className="bg-slate-200 rounded-sm w-full h-2/3" />
                  <div className="bg-indigo-500 rounded-sm w-full h-full animate-pulse" />
                </div>
              </div>
              <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center cursor-pointer hover:bg-indigo-600 transition-colors">
                <ArrowRight className="w-4 h-4 -rotate-45" />
              </div>
            </div>
            <div className="mt-3 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vyapaar CRM</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">Kaushal Tiwari Deal</p>
              <p className="text-xs font-extrabold text-indigo-600 mt-1">₹49,999</p>
            </div>
          </div>

          {/* Right WhatsApp/AI Assistant Card */}
          <div 
            className="hidden lg:block absolute top-[180px] right-12 w-[clamp(160px,11vw,200px)] bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xl z-20 animate-slide-in-right delay-700"
          >
            <div className="aspect-[200/260] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 p-3 relative flex flex-col justify-between group">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span className="text-[9px] text-slate-500 font-bold uppercase">WhatsApp OS</span>
              </div>
              <div className="space-y-1.5 my-3">
                <div className="bg-slate-200/60 rounded-lg p-1.5 text-[8px] text-slate-700 max-w-[85%] text-left">
                  Ramesh, stock level low for Fortune Oil.
                </div>
                <div className="bg-indigo-600 text-white rounded-lg p-1.5 text-[8px] max-w-[85%] ml-auto text-right font-medium">
                  Order 10 units.
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto cursor-pointer hover:scale-110 transition-transform shadow-md shadow-indigo-200">
                <PlayCircle className="w-4 h-4 fill-white text-indigo-600" />
              </div>
            </div>
            <div className="mt-3 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Assistant</p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5 leading-snug">Auto-pilot orders & alerts via WhatsApp</p>
            </div>
          </div>

          <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs mb-8 shadow-sm animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              VyaparAI 2.0 is now live
            </div>

            {/* Staggered Heading */}
            <h1 className="font-serif-display text-[#1a3d1a] text-[clamp(40px,6.8vw,88px)] leading-[0.95] tracking-tight mb-8">
              {["India's", "First", "AI", "Business", "Brain"].map((word, idx) => (
                <span 
                  key={idx} 
                  className="inline-block animate-word-pop" 
                  style={{ animationDelay: `${200 + idx * 100}ms`, marginRight: '0.22em' }}
                >
                  {word}
                </span>
              ))}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto animate-fade-up delay-600 leading-relaxed">
              Automate sales, service, HR, and marketing with humans and AI agents working together on one trusted, agentic CRM platform. See value from day one with quick and easy setup.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-up delay-700 mb-12">
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

            {/* Bottom 3 Mockup Panels (reveal from bottom) */}
            <div className="hidden lg:flex items-end justify-center w-full max-w-5xl mx-auto mt-6 gap-4">
              {/* Left Panel */}
              <div className="flex-1 bg-gradient-to-tr from-white to-indigo-50/50 border border-slate-200/80 rounded-t-3xl p-6 h-48 relative overflow-hidden shadow-sm animate-photo-reveal delay-800">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
                <div className="text-left flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Active Database</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">98K+</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Managed Leads & Deals</p>
                  </div>
                  
                  {/* Avatar stack */}
                  <div className="flex items-center -space-x-2 mt-4">
                    {["A", "B", "C", "D"].map((n, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-slate-800 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
                        {n}
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
                      +
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Panel (tallest) */}
              <div className="flex-[1.2] bg-gradient-to-tr from-slate-950 to-indigo-950 border border-slate-800/80 rounded-t-3xl p-6 h-56 relative overflow-hidden shadow-xl text-left animate-photo-reveal delay-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">Featured Agent</span>
                    <h3 className="text-lg font-bold text-white mt-1 leading-snug">Vyapaar Mitra AI Chat</h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">Bilingual auto-pilot assistant for automated customer support.</p>
                  </div>
                  
                  <button 
                    onClick={(e) => handleActionClick(e, '/chat')}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all w-fit"
                  >
                    Try AI Chat <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Panel */}
              <div className="flex-1 bg-gradient-to-tr from-white to-indigo-50/50 border border-slate-200/80 rounded-t-3xl p-6 h-48 relative overflow-hidden shadow-sm animate-photo-reveal delay-900">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
                <div className="text-left flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">HR & Payroll</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">4.8★</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">User Satisfaction Score</p>
                  </div>
                  
                  <div className="flex gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tablet/Mobile stats row (below md) */}
            <div className="lg:hidden mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto animate-fade-up delay-900">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl text-left">
                <h4 className="text-xl font-black text-slate-900 font-serif-display">98K+</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Managed Leads</p>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl text-left">
                <h4 className="text-xl font-black text-slate-900 font-serif-display">4.8★ Rating</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">User Score</p>
              </div>
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

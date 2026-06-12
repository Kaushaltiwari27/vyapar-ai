'use client';

import Link from "next/link";
import { ShieldCheck, CheckCircle2, Zap, ArrowRight, Activity, Users, Database, Globe, Lock, PlayCircle, Star, MessageSquare } from "lucide-react";
import Image from "next/image";
import { APP_FEATURES } from "@/lib/features";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

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
              <Link 
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl text-base font-bold text-white transition-all duration-300 hover:scale-105 shadow-xl shadow-blue-500/20"
                style={{ background: 'var(--grad-button)' }}
              >
                Start Free Trial
              </Link>
              <Link 
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-2xl text-base font-bold text-slate-700 bg-white border border-slate-200 transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              >
                <PlayCircle className="w-5 h-5 text-blue-600" /> Watch Demo
              </Link>
            </div>
            
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
              
              {/* Starter Tier */}
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full mb-6 w-fit">
                  Starter
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mb-6 flex items-baseline">
                  ₹999<span className="text-base text-slate-500 font-medium ml-2">/ month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-slate-700 font-medium">Freelancers, solo founders</li>
                  <li className="text-slate-700 font-medium">CRM + Invoice + AI chat</li>
                  <li className="text-slate-700 font-medium">Up to 5 users</li>
                </ul>
                <div className="mt-auto">
                  <div className="w-full h-2 bg-slate-100 rounded-full mb-3 overflow-hidden">
                    <div className="w-1/3 h-full bg-indigo-500 rounded-full"></div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Entry point — free trial se convert karo</p>
                </div>
              </div>

              {/* Growth Tier */}
              <div className="p-8 rounded-3xl bg-white border-2 border-blue-500 shadow-xl relative flex flex-col transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-100 text-blue-800 font-bold text-xs px-4 py-1.5 rounded-full whitespace-nowrap">
                  Growth — Push this
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mb-6 mt-2 flex items-baseline">
                  ₹2,499<span className="text-base text-slate-500 font-medium ml-2">/ month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-slate-700 font-medium">10-50 employee SMBs</li>
                  <li className="text-slate-700 font-medium">Full CRM + ERP + HRMS</li>
                  <li className="text-slate-700 font-medium">WhatsApp OS + GST filing</li>
                </ul>
                <div className="mt-auto">
                  <div className="w-full h-2 bg-slate-100 rounded-full mb-3 overflow-hidden">
                    <div className="w-2/3 h-full bg-indigo-500 rounded-full"></div>
                  </div>
                  <p className="text-blue-600 text-sm font-bold">Yahi tier pitch karo hamesha</p>
                  <Link 
                    href="/signup"
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
                    style={{ background: 'var(--grad-button)' }}
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>

              {/* Business Tier */}
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 font-bold text-xs rounded-full mb-6 w-fit">
                  Business
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mb-6 flex items-baseline">
                  ₹4,999<span className="text-base text-slate-500 font-medium ml-2">/ month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="text-slate-700 font-medium">50-200 employee companies</li>
                  <li className="text-slate-700 font-medium">Sab kuch + priority support</li>
                  <li className="text-slate-700 font-medium">Dedicated onboarding</li>
                </ul>
                <div className="mt-auto">
                  <div className="w-full h-2 bg-slate-100 rounded-full mb-3 overflow-hidden">
                    <div className="w-[90%] h-full bg-indigo-500 rounded-full"></div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Upsell baad mein</p>
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
    </>
  );
}

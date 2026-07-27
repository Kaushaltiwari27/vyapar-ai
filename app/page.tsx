'use client';

import Link from "next/link";
import { ShieldCheck, CheckCircle2, Zap, ArrowRight, Activity, Users, Database, Globe, Lock, PlayCircle, Star, MessageSquare, XCircle, TrendingUp, Smartphone, FileText } from "lucide-react";
import Image from "next/image";
import { APP_FEATURES } from "@/lib/features";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PlanSelectModal from "@/components/auth/PlanSelectModal";
import { MaskedCard, useMaskPositions, useImageWidth, useIsMobile, useStaggeredReveal } from "@/components/ui/MaskedCard";

function Preloader({ onComplete }: { onComplete: () => void }) {
  const [counter, setCounter] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    let start = 0
    const duration = 2000
    const stepTime = 20
    const totalSteps = duration / stepTime // 100 steps

    const interval = setInterval(() => {
      start += 1
      if (start <= 100) {
        setCounter(start)
      } else {
        clearInterval(interval)
        // Wait 200ms after reaching 100, then exit
        setTimeout(() => {
          setExiting(true)
          // 700ms transition duration
          setTimeout(() => {
            onComplete()
          }, 700)
        }, 200)
      }
    }, stepTime)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-slate-950 flex items-end justify-start p-6 md:p-10 transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${exiting ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="text-7xl md:text-9xl font-bold tabular-nums text-white leading-none select-none">
        {counter}
      </div>
    </div>
  )
}

const carouselCards = [
  {
    icon: TrendingUp,
    color: "#4f46e5",
    title: "AI Sales Assistant",
    desc: "Auto-pilot lead scoring, email drafts, and deal pipeline management."
  },
  {
    icon: Smartphone,
    color: "#16a34a",
    title: "WhatsApp OS Automation",
    desc: "Engage customers, send PDF invoices, and process orders on WhatsApp."
  },
  {
    icon: FileText,
    color: "#2563eb",
    title: "Smart Invoicing & GST",
    desc: "Generate compliant bills and calculate tax slabs in a single click."
  },
  {
    icon: Users,
    color: "#d97706",
    title: "HR & Leaves Autopilot",
    desc: "Manage payroll payouts, record attendance, and approve leave requests."
  }
]

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/dashboard');

  const [activeCarousel, setActiveCarousel] = useState(0)
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCarousel((prev) => (prev + 1) % 4)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') || 
        target.classList.contains('cursor-pointer')
      ) {
        setHovering(true)
      } else {
        setHovering(false)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleMouseOver)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [])

  const router = useRouter();
  const supabase = createClient();

  const sectionRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])

  // Setup cardRefs helper
  const addToRefs = (el: HTMLElement | null) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el)
    }
  }

  const positions = useMaskPositions(sectionRef, cardRefs)
  const sectionHeight = positions[0]?.sh || 600
  const imageWidth = useImageWidth('/saas_dashboard_mockup.png', sectionHeight)
  const isMobile = useIsMobile()

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

      {/* Custom Cursor Effect */}
      <motion.div 
        className="hidden md:block fixed w-8 h-8 rounded-full border border-indigo-500/50 pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePos.x - 16,
          y: mousePos.y - 16,
          scale: hovering ? 1.8 : 1,
          backgroundColor: hovering ? 'rgba(79, 70, 229, 0.15)' : 'rgba(0,0,0,0)'
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
      />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#4F46E5]/30 selection:text-slate-900"
      >
        <LandingNavbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section ref={sectionRef} className="relative pt-28 pb-20 overflow-hidden flex flex-col items-center justify-center min-h-[95vh] bg-slate-50/40">
          {/* Animated liquid organic blobs in background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-40">
            {/* Liquid Blob 1 (Blue) */}
            <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] animate-pulse" style={{ animationDuration: '10s' }}>
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-500/10 fill-current filter blur-[80px]">
                <path d="M44.5,-76.3C57,-69.1,65.9,-55.8,72.4,-41.7C78.9,-27.6,83.1,-12.8,82.8,1.9C82.5,16.5,77.7,31,70,43.5C62.3,55.9,51.7,66.4,38.9,72.3C26.1,78.2,11,79.5,-3.8,74.7C-18.6,69.9,-33.2,59,-45.5,47.9C-57.8,36.9,-67.7,25.6,-73,11.5C-78.3,-2.6,-78.9,-19.6,-72.6,-33.4C-66.3,-47.2,-53,-57.8,-39.2,-64.5C-25.3,-71.2,-10.8,-74.1,2.8,-78.5C16.5,-82.9,32,-83.4,44.5,-76.3Z" transform="translate(100 100)">
                  <animate attributeName="d" dur="15s" repeatCount="indefinite" values="
                    M44.5,-76.3C57,-69.1,65.9,-55.8,72.4,-41.7C78.9,-27.6,83.1,-12.8,82.8,1.9C82.5,16.5,77.7,31,70,43.5C62.3,55.9,51.7,66.4,38.9,72.3C26.1,78.2,11,79.5,-3.8,74.7C-18.6,69.9,-33.2,59,-45.5,47.9C-57.8,36.9,-67.7,25.6,-73,11.5C-78.3,-2.6,-78.9,-19.6,-72.6,-33.4C-66.3,-47.2,-53,-57.8,-39.2,-64.5C-25.3,-71.2,-10.8,-74.1,2.8,-78.5C16.5,-82.9,32,-83.4,44.5,-76.3Z;
                    M48.8,-71.3C61.4,-63.4,68.8,-46.7,73.1,-30.7C77.4,-14.8,78.6,0.3,75.1,14.6C71.6,28.9,63.4,42.5,52.3,52.9C41.2,63.3,27.1,70.5,11.9,73C-3.3,75.5,-19.5,73.4,-33.9,66.7C-48.3,60,-60.8,48.7,-68.8,34.8C-76.8,20.9,-80.3,4.4,-77.9,-11.1C-75.5,-26.6,-67.2,-41.1,-55.4,-49.4C-43.6,-57.8,-28.4,-60,-13.7,-64.1C1.1,-68.2,16.2,-74.2,31.7,-75.4C47.2,-76.6,36.2,-79.1,48.8,-71.3Z;
                    M44.5,-76.3C57,-69.1,65.9,-55.8,72.4,-41.7C78.9,-27.6,83.1,-12.8,82.8,1.9C82.5,16.5,77.7,31,70,43.5C62.3,55.9,51.7,66.4,38.9,72.3C26.1,78.2,11,79.5,-3.8,74.7C-18.6,69.9,-33.2,59,-45.5,47.9C-57.8,36.9,-67.7,25.6,-73,11.5C-78.3,-2.6,-78.9,-19.6,-72.6,-33.4C-66.3,-47.2,-53,-57.8,-39.2,-64.5C-25.3,-71.2,-10.8,-74.1,2.8,-78.5C16.5,-82.9,32,-83.4,44.5,-76.3Z
                  " />
                </path>
              </svg>
            </div>
            {/* Liquid Blob 2 (Indigo) */}
            <div className="absolute top-[35%] right-[5%] w-[550px] h-[550px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}>
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-indigo-500/10 fill-current filter blur-[90px]">
                <path d="M51.2,-79.3C65.4,-72.6,75.4,-57.3,80.7,-41C86.1,-24.8,86.8,-7.6,83.5,8C80.2,23.5,73,37.3,63.1,48.5C53.2,59.7,40.7,68.2,26.5,73.4C12.3,78.6,-3.6,80.5,-19.8,77.5C-36.1,74.5,-52.8,66.6,-64.5,54C-76.3,41.4,-83.2,24.1,-84.9,6.2C-86.6,-11.7,-83.1,-30.2,-73.4,-44C-63.7,-57.8,-47.8,-66.9,-32.4,-72.9C-16.9,-78.9,-1.9,-81.9,13.8,-80.7C29.6,-79.5,37,-74,51.2,-79.3Z" transform="translate(100 100)">
                  <animate attributeName="d" dur="18s" repeatCount="indefinite" values="
                    M51.2,-79.3C65.4,-72.6,75.4,-57.3,80.7,-41C86.1,-24.8,86.8,-7.6,83.5,8C80.2,23.5,73,37.3,63.1,48.5C53.2,59.7,40.7,68.2,26.5,73.4C12.3,78.6,-3.6,80.5,-19.8,77.5C-36.1,74.5,-52.8,66.6,-64.5,54C-76.3,41.4,-83.2,24.1,-84.9,6.2C-86.6,-11.7,-83.1,-30.2,-73.4,-44C-63.7,-57.8,-47.8,-66.9,-32.4,-72.9C-16.9,-78.9,-1.9,-81.9,13.8,-80.7C29.6,-79.5,37,-74,51.2,-79.3Z;
                    M42,-72C56,-65,66.3,-50.7,73,-35.1C79.7,-19.5,82.8,-2.6,79.5,12.7C76.2,28,66.5,41.8,55.1,51.9C43.7,62,30.6,68.5,16.4,71.7C2.2,74.9,-13,74.8,-27.2,70.5C-41.4,66.2,-54.6,57.7,-64.9,45.8C-75.2,33.9,-82.6,18.7,-83.9,2.8C-85.2,-13.1,-80.4,-29.6,-71.4,-42.6C-62.4,-55.6,-49.2,-65.1,-34.8,-71.4C-20.4,-77.7,-4.8,-80.8,1.4,-83C7.6,-85.2,28,-79,42,-72Z;
                    M51.2,-79.3C65.4,-72.6,75.4,-57.3,80.7,-41C86.1,-24.8,86.8,-7.6,83.5,8C80.2,23.5,73,37.3,63.1,48.5C53.2,59.7,40.7,68.2,26.5,73.4C12.3,78.6,-3.6,80.5,-19.8,77.5C-36.1,74.5,-52.8,66.6,-64.5,54C-76.3,41.4,-83.2,24.1,-84.9,6.2C-86.6,-11.7,-83.1,-30.2,-73.4,-44C-63.7,-57.8,-47.8,-66.9,-32.4,-72.9C-16.9,-78.9,-1.9,-81.9,13.8,-80.7C29.6,-79.5,37,-74,51.2,-79.3Z
                  " />
                </path>
              </svg>
            </div>
            {/* Liquid Blob 3 (Greenish/Mint) */}
            <div className="absolute top-[20%] right-[35%] w-[420px] h-[420px] animate-pulse" style={{ animationDuration: '14s', animationDelay: '1s' }}>
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#16a34a]/5 fill-current filter blur-[75px]">
                <path d="M43.7,-74.6C56.6,-69.1,67.1,-56.9,73.2,-42.6C79.3,-28.3,80.9,-11.8,79.2,3.8C77.4,19.4,72.3,34,63.7,45.3C55.1,56.5,43,64.3,29.9,69.5C16.8,74.7,2.8,77.3,-11.8,75C-26.4,72.7,-41.6,65.6,-53.4,55C-65.1,44.5,-73.4,30.5,-77.2,14.9C-81,-0.6,-80.3,-17.8,-73.8,-31.4C-67.4,-45,-55.1,-55.1,-41.7,-60.3C-28.3,-65.5,-14.2,-65.9,0.9,-67.4C15.9,-68.9,30.9,-80.2,43.7,-74.6Z" transform="translate(100 100)">
                  <animate attributeName="d" dur="20s" repeatCount="indefinite" values="
                    M43.7,-74.6C56.6,-69.1,67.1,-56.9,73.2,-42.6C79.3,-28.3,80.9,-11.8,79.2,3.8C77.4,19.4,72.3,34,63.7,45.3C55.1,56.5,43,64.3,29.9,69.5C16.8,74.7,2.8,77.3,-11.8,75C-26.4,72.7,-41.6,65.6,-53.4,55C-65.1,44.5,-73.4,30.5,-77.2,14.9C-81,-0.6,-80.3,-17.8,-73.8,-31.4C-67.4,-45,-55.1,-55.1,-41.7,-60.3C-28.3,-65.5,-14.2,-65.9,0.9,-67.4C15.9,-68.9,30.9,-80.2,43.7,-74.6Z;
                    M35.6,-62.4C46.8,-57.8,56.7,-48,63.1,-35.6C69.5,-23.2,72.5,-8.3,71,5.6C69.5,19.4,63.6,32.3,55.1,43.4C46.6,54.4,35.6,63.7,22.6,67.7C9.6,71.7,-5.4,70.5,-19.7,66C-34,61.5,-47.6,53.8,-57.2,42.5C-66.8,31.2,-72.4,16.4,-73.4,1C-74.4,-14.4,-70.8,-30.3,-61.8,-41.9C-52.8,-53.5,-38.4,-60.8,-24.5,-64.5C-10.6,-68.2,2.8,-68.3,16.2,-67C29.6,-65.7,24.4,-67.1,35.6,-62.4Z;
                    M43.7,-74.6C56.6,-69.1,67.1,-56.9,73.2,-42.6C79.3,-28.3,80.9,-11.8,79.2,3.8C77.4,19.4,72.3,34,63.7,45.3C55.1,56.5,43,64.3,29.9,69.5C16.8,74.7,2.8,77.3,-11.8,75C-26.4,72.7,-41.6,65.6,-53.4,55C-65.1,44.5,-73.4,30.5,-77.2,14.9C-81,-0.6,-80.3,-17.8,-73.8,-31.4C-67.4,-45,-55.1,-55.1,-41.7,-60.3C-28.3,-65.5,-14.2,-65.9,0.9,-67.4C15.9,-68.9,30.9,-80.2,43.7,-74.6Z
                  " />
                </path>
              </svg>
            </div>
          </div>

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
            <h1 className="font-serif-display text-[#1a3d1a] text-[clamp(40px,6.8vw,88px)] leading-[0.95] tracking-tight mb-8 flex flex-wrap justify-center py-2 select-none">
              {["India's", "First", "AI", "Business", "Brain"].map((word, idx) => (
                <span key={idx} className="inline-block overflow-hidden mr-[0.25em]">
                  <motion.span 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, delay: 0.15 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
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
            </div>            {/* Bottom 3 Mockup Panels (reveal from bottom using single black gradient) */}
            <div className="hidden lg:flex items-end justify-center w-full max-w-5xl mx-auto mt-6 gap-4">
              {/* Left Panel */}
              <div
                className="flex-1 bg-gradient-to-b from-slate-950 to-zinc-950 border border-slate-800/80 rounded-t-3xl p-6 h-48 relative overflow-hidden shadow-sm animate-photo-reveal delay-800"
              >
                {/* Subtle dark glow orb */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
                <div className="text-left flex flex-col justify-between h-full relative z-10">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Assessment</span>
                    <h3 className="text-sm font-bold text-white mt-1 leading-snug">Start your personalized path to automation.</h3>
                    
                    <button 
                      onClick={(e) => handleActionClick(e, '/select-plan')}
                      className="text-xs text-indigo-400 font-semibold underline hover:text-indigo-300 transition-colors mt-2 block"
                    >
                      Personal Business Assessment →
                    </button>
                  </div>
                  
                  {/* Avatar stack */}
                  <div className="flex items-center -space-x-2 mt-4">
                    {["A", "B", "C", "D"].map((n, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-slate-800 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-slate-700">
                        {n}
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-slate-700">
                      +
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Panel (tallest) */}
              <div
                className="flex-[1.2] bg-gradient-to-b from-slate-950 to-zinc-950 border border-slate-800 rounded-t-3xl p-6 h-56 relative overflow-hidden shadow-xl text-left animate-photo-reveal delay-600"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">Core AI Agentforce</span>
                    <span className="text-[9px] text-slate-400 font-bold">Active</span>
                  </div>

                  {/* Carousel Content */}
                  <div className="relative h-20 w-full overflow-hidden mt-2">
                    {carouselCards.map((card, idx) => {
                      const Icon = card.icon
                      const isActive = activeCarousel === idx
                      return (
                        <div
                          key={idx}
                          className={`absolute inset-0 flex items-start gap-3.5 transition-all duration-500 transform ${
                            isActive 
                              ? 'opacity-100 translate-y-0' 
                              : 'opacity-0 translate-y-4 pointer-events-none'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: card.color }}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white leading-none">{card.title}</h4>
                            <p className="text-xs text-slate-300 mt-1 leading-snug">{card.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Indicators and Button */}
                  <div className="flex items-center justify-between mt-auto">
                    {/* Dots indicator */}
                    <div className="flex gap-1.5 w-24">
                      {carouselCards.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`h-1 rounded-full flex-1 transition-all ${
                            activeCarousel === idx ? 'bg-white' : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>

                    <button 
                      onClick={(e) => handleActionClick(e, '/chat')}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Launch Agent <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div
                className="flex-1 bg-gradient-to-b from-slate-950 to-zinc-950 border border-slate-800 rounded-t-3xl p-6 h-48 relative overflow-hidden shadow-sm animate-photo-reveal delay-900"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
                <div className="text-left flex flex-col justify-between h-full relative z-10">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">SaaS Validation</span>
                      <h3 className="text-2xl font-black text-white mt-1">14K+</h3>
                      <p className="text-[11px] text-slate-300 font-medium leading-normal mt-1.5">Active Indian companies trust VyaparAI to auto-pilot operations.</p>
                    </div>

                    {/* Small product card mockup on the right side of Panel 3 */}
                    <div className="w-20 h-16 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2 flex flex-col justify-between shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <div className="flex justify-between items-center">
                        <span className="text-[7px] text-emerald-400 font-extrabold uppercase tracking-wider">Active</span>
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[7px] text-emerald-400 font-black">✓</div>
                      </div>
                      <div className="flex items-end gap-1 h-6 pt-1">
                        <div className="bg-emerald-500/30 rounded-[1px] w-full h-[40%]" />
                        <div className="bg-emerald-500/40 rounded-[1px] w-full h-[65%]" />
                        <div className="bg-emerald-500/60 rounded-[1px] w-full h-[80%]" />
                        <div className="bg-emerald-500 rounded-[1px] w-full h-full animate-pulse" />
                      </div>
                    </div>
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
        <motion.section 
          id="customers" 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="py-24 bg-slate-900 text-white relative overflow-hidden"
        >
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
                <motion.div 
                  key={i} 
                  whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}
                  className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-slate-600 transition-colors duration-300 cursor-pointer"
                >
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
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Pricing */}
        {/* Pricing */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="py-24 bg-white border-t border-slate-100 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-16">Enterprise power, SMB pricing.</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left items-stretch">
              
              {/* Basic Tier */}
              <motion.div 
                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer"
              >
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
              </motion.div>

              {/* Intermediate Tier */}
              <motion.div 
                whileHover={{ y: -16, scale: 1.03, boxShadow: '0 25px 30px -5px rgba(59, 130, 246, 0.2)' }}
                className="p-8 rounded-3xl bg-white border-2 border-blue-500 shadow-xl relative flex flex-col transform md:-translate-y-4 cursor-pointer"
              >
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
              </motion.div>

              {/* Advance Tier */}
              <motion.div 
                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer"
              >
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
              </motion.div>

            </div>
          </div>
        </motion.section>
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

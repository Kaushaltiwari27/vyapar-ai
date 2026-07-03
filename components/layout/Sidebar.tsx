'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from "@/lib/client"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { LogOut, Home, Users, TrendingUp, FileText, MessageCircle, Package, Truck, ClipboardList, ShieldCheck, Smartphone, Settings, X, Lock, Building2 } from "lucide-react"

import { usePlan } from '@/lib/hooks/usePlan'

type NavItem = { href: string; icon: React.ElementType; label: string; feature: any; badge?: string };

const crmItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', feature: 'dashboard' },
  { href: '/customers', icon: Users, label: 'Customers', feature: 'customers' },
  { href: '/deals', icon: TrendingUp, label: 'Deals', feature: 'deals' },
  { href: '/quotations', icon: FileText, label: 'Quotations', feature: 'invoices' },
  { href: '/invoices', icon: FileText, label: 'Invoices', feature: 'invoices' },
  { href: '/inventory', icon: Package, label: 'Inventory', feature: 'inventory' },
  { href: '/vendors', icon: Truck, label: 'Vendors', feature: 'vendors' },
  { href: '/purchase-orders', icon: ClipboardList, label: 'Purchase Orders', feature: 'purchaseOrders' },
];

const hrmsItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', feature: 'dashboard' },
  { href: '/employees', icon: Users, label: 'Employees', feature: 'employees' },
  { href: '/attendance', icon: ClipboardList, label: 'Attendance', feature: 'attendance' },
  { href: '/leaves', icon: FileText, label: 'Leaves', feature: 'leaves' },
  { href: '/payroll', icon: FileText, label: 'Payroll', feature: 'payroll' },
  { href: '/compliance', icon: ShieldCheck, label: 'Compliance', feature: 'compliance' },
];

const commonItems: NavItem[] = [
  { href: '/whatsapp', icon: Smartphone, label: 'WhatsApp OS', feature: 'whatsapp', badge: 'NEW' },
  { href: '/chat', icon: MessageCircle, label: 'AI Chat', feature: 'aiChat', badge: 'AI' },
];

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [businessName, setBusinessName] = useState("Loading...")
  const [activeApp, setActiveApp] = useState<'crm' | 'hrms'>('crm')
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  const { can, isTrial, daysLeft, plan } = usePlan()

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev)
    window.addEventListener('toggle-sidebar', handleToggle)
    return () => window.removeEventListener('toggle-sidebar', handleToggle)
  }, [])

  useEffect(() => {
    const savedApp = localStorage.getItem('vyapar_active_app') as 'crm' | 'hrms'
    if (savedApp) setActiveApp(savedApp)

    const handleStorageChange = () => {
      const updatedApp = localStorage.getItem('vyapar_active_app') as 'crm' | 'hrms'
      if (updatedApp && updatedApp !== activeApp) setActiveApp(updatedApp)
    }
    window.addEventListener('storage', handleStorageChange)
    
    const interval = setInterval(() => {
      const currentApp = localStorage.getItem('vyapar_active_app') as 'crm' | 'hrms';
      if (currentApp && currentApp !== activeApp) setActiveApp(currentApp);
    }, 1000);

    async function loadBusiness() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('businesses(name)')
        .eq('id', user.id)
        .single()
      
      const bus = data?.businesses as unknown as { name?: string }
      if (bus?.name) {
        setBusinessName(bus.name)
      }
    }
    loadBusiness()

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [supabase, activeApp])

  const toggleApp = (app: 'crm' | 'hrms') => {
    setActiveApp(app)
    localStorage.setItem('vyapar_active_app', app)
    window.dispatchEvent(new Event('storage'))
    if (pathname !== '/dashboard') {
      router.push('/dashboard')
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
    } else {
      router.push("/login")
      router.refresh()
    }
  }

  const baseItems = activeApp === 'crm' ? crmItems : hrmsItems;
  const currentItems = [...baseItems, ...commonItems].filter(item => {
    if (item.feature === 'whatsapp' && plan === 'starter') {
      return false
    }
    return true
  });

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed left-0 top-0 z-50 h-screen w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] flex flex-col transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center group">
            <Image 
              src="/logo.png" 
              alt="VyaparAI" 
              width={140} 
              height={40} 
              className="opacity-90 transition-opacity group-hover:opacity-100 object-contain"
              priority
            />
          </Link>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* App Switcher */}
        <div className="p-4 border-b border-[var(--sidebar-border)]">
          <div className="bg-slate-100/50 p-1 rounded-xl flex gap-1 relative border border-slate-200 shadow-inner">
            <button
              onClick={() => toggleApp('crm')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all z-10 ${
                activeApp === 'crm' 
                  ? 'text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              CRM
            </button>
            <button
              onClick={() => toggleApp('hrms')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all z-10 ${
                activeApp === 'hrms' 
                  ? 'text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              HRMS
            </button>
            <div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-slate-200 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
              style={{ transform: `translateX(${activeApp === 'crm' ? '0' : '100%'})`, left: '4px' }}
            />
          </div>
        </div>

        {isTrial && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="text-xs font-bold text-blue-600 mb-1">TRIAL ACTIVE</div>
            <div className="text-sm font-semibold text-slate-700">{daysLeft} days remaining</div>
            <Link href="/subscribe" className="mt-2 block text-center text-[11px] font-bold bg-blue-600 text-white rounded-lg py-1.5 hover:bg-blue-700 transition-colors">
              Upgrade Now
            </Link>
          </div>
        )}

        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {currentItems.map((item, index) => {
              const allowed = can(item.feature);
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <motion.div
                  key={`${activeApp}-${item.href}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Link
                    href={allowed ? item.href : `/subscribe`}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                      isActive && allowed
                        ? 'text-[var(--sidebar-text-active)] bg-[var(--sidebar-item-active)]' 
                        : 'text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-[var(--sidebar-item-active)]'
                    } ${!allowed ? 'opacity-60' : ''}`}
                    onClick={(e) => {
                      if (!allowed) {
                        e.preventDefault()
                        router.push('/subscribe')
                      }
                    }}
                  >
                    {isActive && allowed && (
                      <motion.div 
                        layoutId={`sidebar-active-indicator-${activeApp}`}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full" 
                        style={{ background: 'var(--sidebar-accent-bar)' }}
                      />
                    )}
                    <Icon className={`w-4 h-4 ${isActive && allowed ? "text-[var(--sidebar-text-active)]" : "opacity-70 group-hover:opacity-100 transition-opacity"}`} />
                    {item.label}
                    {!allowed && <Lock className="w-3.5 h-3.5 ml-auto text-slate-400" />}
                    {allowed && item.badge && (
                      <span className="ml-auto bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-[var(--sidebar-border)] bg-slate-50/80">
          <div className="flex items-center justify-between bg-[var(--sidebar-bg)] rounded-lg p-3 border border-[var(--sidebar-border)] premium-shadow">
            <div className="truncate pr-2">
              <p className="text-[10px] font-bold text-[var(--sidebar-text)] uppercase tracking-widest mb-0.5 flex items-center gap-1">
                {plan} plan
              </p>
              <p className="text-sm font-semibold text-[var(--sidebar-text-active)] truncate">{businessName}</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  )
}

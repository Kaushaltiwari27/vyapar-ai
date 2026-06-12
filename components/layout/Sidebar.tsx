'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from "@/lib/client"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { LogOut, Home, Users, TrendingUp, FileText, MessageCircle, Package, Truck, ClipboardList, ShieldCheck, Smartphone, Settings } from "lucide-react"

type NavItem = { href: string; icon: React.ElementType; label: string; badge?: string };

const crmItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/deals', icon: TrendingUp, label: 'Deals' },
  { href: '/invoices', icon: FileText, label: 'Invoices' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/vendors', icon: Truck, label: 'Vendors' },
  { href: '/purchase-orders', icon: ClipboardList, label: 'POs' },
]

const hrmsItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/employees', icon: Users, label: 'Employees' },
  { href: '/attendance', icon: ClipboardList, label: 'Attendance' },
  { href: '/leaves', icon: FileText, label: 'Leaves' },
  { href: '/payroll', icon: FileText, label: 'Payroll' },
  { href: '/compliance', icon: ShieldCheck, label: 'Compliance' },
]

const commonItems: NavItem[] = [
  { href: '/whatsapp', icon: Smartphone, label: 'WhatsApp OS', badge: 'NEW' },
  { href: '/chat', icon: MessageCircle, label: 'AI Chat', badge: 'AI' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [businessName, setBusinessName] = useState("Loading...")
  const [activeApp, setActiveApp] = useState<'crm' | 'hrms'>('crm')

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

  const currentItems = [...(activeApp === 'crm' ? crmItems : hrmsItems), ...commonItems];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] flex flex-col transition-colors duration-200">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center group w-full">
          <Image 
            src="/logo.png" 
            alt="VyaparAI" 
            width={140} 
            height={40} 
            className="opacity-90 transition-opacity group-hover:opacity-100 object-contain"
            priority
          />
        </Link>
      </div>

      {/* App Switcher */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex p-1 bg-muted rounded-lg shadow-sm border border-border/50 relative">
          <button
            onClick={() => toggleApp('crm')}
            className={`relative flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors z-10 ${
              activeApp === 'crm' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            CRM
          </button>
          <button
            onClick={() => toggleApp('hrms')}
            className={`relative flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors z-10 ${
              activeApp === 'hrms' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            HRMS
          </button>
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-md shadow-sm z-0"
            initial={false}
            animate={{ 
              x: activeApp === 'crm' ? 0 : '100%',
              left: activeApp === 'crm' ? '4px' : '0px'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {currentItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                    isActive 
                      ? 'text-[var(--sidebar-text-active)] bg-[var(--sidebar-item-active)]' 
                      : 'text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-active)] hover:bg-[var(--sidebar-item-active)]'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 rounded-r-full" 
                      style={{ background: 'var(--sidebar-accent-bar)' }}
                    />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? "text-[var(--sidebar-text-active)]" : "opacity-70 group-hover:opacity-100 transition-opacity"}`} />
                  {item.label}
                  {item.badge && (
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

      {/* User Footer */}
      <div className="p-4 border-t border-[var(--sidebar-border)] bg-slate-50/80">
        <div className="flex items-center justify-between bg-[var(--sidebar-bg)] rounded-lg p-3 border border-[var(--sidebar-border)] premium-shadow">
          <div className="truncate pr-2">
            <p className="text-[10px] font-bold text-[var(--sidebar-text)] uppercase tracking-widest mb-0.5">Business</p>
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
  )
}

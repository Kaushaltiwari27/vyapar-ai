'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { createClient } from "@/lib/client"
import { toast } from "react-hot-toast"
import { LogOut, Home, Users, TrendingUp, FileText, MessageCircle, Package, Truck, ClipboardList, ShieldCheck } from "lucide-react"

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/deals', icon: TrendingUp, label: 'Deals' },
  { href: '/invoices', icon: FileText, label: 'Invoices' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/vendors', icon: Truck, label: 'Vendors' },
  { href: '/purchase-orders', icon: ClipboardList, label: 'POs' },
  { href: '/employees', icon: Users, label: 'Employees' },
  { href: '/attendance', icon: ClipboardList, label: 'Attendance' },
  { href: '/leaves', icon: FileText, label: 'Leaves' },
  { href: '/payroll', icon: FileText, label: 'Payroll' },
  { href: '/compliance', icon: ShieldCheck, label: 'Compliance' },
  { href: '/chat', icon: MessageCircle, label: 'AI Chat', badge: 'AI' },
]

export function Sidebar() {
  const sidebarRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [businessName, setBusinessName] = useState("Loading...")

  useEffect(() => {
    // GSAP stagger animation on mount
    gsap.fromTo(
      '.nav-item',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.2 }
    )
    gsap.fromTo(
      '.sidebar-logo',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
    )
    
    // Fetch business name
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
  }, [supabase])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
    } else {
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <aside ref={sidebarRef} className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#0A0A14] border-r border-[rgba(255,255,255,0.06)] flex flex-col transition-transform shadow-2xl">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-[rgba(255,255,255,0.06)] sidebar-logo">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300">
            <span className="text-white font-extrabold text-lg">V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-white tracking-tight leading-none">VyaparAI</span>
            <span className="text-[10px] text-[#8B5CF6] font-medium tracking-widest uppercase mt-1">Business Brain</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? 'text-[#ffffff] bg-[rgba(79,70,229,0.15)]' 
                  : 'text-[rgba(255,255,255,0.55)] hover:text-[#ffffff] hover:bg-[rgba(255,255,255,0.05)]'
              }`}
              onMouseEnter={e => {
                if (!isActive) {
                  gsap.to(e.currentTarget, { x: 4, duration: 0.2, ease: 'power2.out' })
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  gsap.to(e.currentTarget, { x: 0, duration: 0.2, ease: 'power2.out' })
                }
              }}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#4F46E5] rounded-r-full shadow-[0_0_10px_#4F46E5]" />
              )}
              <Icon className={`w-4 h-4 ${isActive ? "text-[#8B5CF6]" : "opacity-70"}`} />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-[rgba(79,70,229,0.2)] text-[#8B5CF6] text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider border border-[rgba(79,70,229,0.3)]">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Business name at bottom */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between bg-[rgba(255,255,255,0.03)] rounded-xl p-3 border border-[rgba(255,255,255,0.05)]">
          <div className="truncate pr-2">
            <p className="text-[10px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-0.5">Workspace</p>
            <p className="text-sm font-bold text-white truncate">{businessName}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-[rgba(255,255,255,0.5)] hover:text-rose-400 hover:bg-[rgba(244,63,94,0.1)] rounded-lg transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

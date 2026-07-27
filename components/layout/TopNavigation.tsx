'use client'
 
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { createClient } from "@/lib/client"
import Image from "next/image"
import NotificationBell from './NotificationBell'
import ProfileDropdown from './ProfileDropdown'

export function TopNavigation() {
  const [userInitials, setUserInitials] = useState("V")
  const supabase = createClient()
  const [pageTitle, setPageTitle] = useState('Dashboard')
  
  const [userName, setUserName] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [plan, setPlan] = useState("trial")
  const [businessId, setBusinessId] = useState("")

  // Get dynamic page title based on URL (simple mapping)
  const getPageTitle = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      if (path === '/dashboard') return 'Dashboard'
      if (path.startsWith('/customers')) return 'Customers'
      if (path.startsWith('/deals')) return 'Deals'
      if (path.startsWith('/invoices')) return 'Invoices'
      if (path.startsWith('/inventory')) return 'Inventory'
      if (path.startsWith('/vendors')) return 'Vendors'
      if (path.startsWith('/purchase-orders')) return 'Purchase Orders'
      if (path.startsWith('/employees')) return 'Employees'
      if (path.startsWith('/attendance')) return 'Attendance'
      if (path.startsWith('/leaves')) return 'Leaves'
      if (path.startsWith('/payroll')) return 'Payroll'
      if (path.startsWith('/compliance')) return 'Compliance'
      if (path.startsWith('/chat')) return 'AI Chat'
    }
    return 'Dashboard'
  }

  useEffect(() => {
    setPageTitle(getPageTitle())
  }, [])

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data } = await supabase
        .from('profiles')
        .select('full_name, plan, business_id, businesses(name)')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setUserName(data.full_name || "User")
        setPlan(data.plan || "trial")
        setBusinessId(data.business_id || "")
        
        const bus = data.businesses as any
        if (bus?.name) {
          setBusinessName(bus.name)
        }

        if (data.full_name) {
          const names = data.full_name.split(' ')
          const initials = names.length > 1 
            ? `${names[0][0]}${names[names.length-1][0]}` 
            : data.full_name.substring(0, 2)
          setUserInitials(initials.toUpperCase())
        }
      }
    }
    loadUser()
  }, [supabase])

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-4 bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Mobile Hamburger */}
        <button 
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
          onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Small Logo for Mobile/Topbar */}
        <div className="block lg:hidden">
          <Image src="/logo.png" alt="VyaparAI" width={32} height={32} className="object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-slate-500 font-medium">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <NotificationBell businessId={businessId} />

        {/* Profile Dropdown */}
        <ProfileDropdown userName={userName} businessName={businessName} plan={plan} />
      </div>
    </header>
  )
}

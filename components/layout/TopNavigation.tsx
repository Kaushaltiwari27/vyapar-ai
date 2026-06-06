'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from "@/lib/client"

export function TopNavigation() {
  const [userInitials, setUserInitials] = useState("V")
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      
      if (data?.full_name) {
        const names = data.full_name.split(' ')
        const initials = names.length > 1 
          ? `${names[0][0]}${names[names.length-1][0]}` 
          : data.full_name.substring(0, 2)
        setUserInitials(initials.toUpperCase())
      }
    }
    loadUser()
  }, [supabase])

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

  const [pageTitle, setPageTitle] = useState('Dashboard')

  useEffect(() => {
    setPageTitle(getPageTitle())
  }, [])

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-[rgba(255,255,255,0.7)] backdrop-blur-xl border-b border-[rgba(0,0,0,0.06)]">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{pageTitle}</h1>
        <p className="text-sm text-slate-500 font-medium">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative p-2.5 rounded-full hover:bg-[rgba(0,0,0,0.04)] text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-bold shadow-[0_4px_10px_rgba(79,70,229,0.3)] cursor-pointer hover:scale-105 transition-transform">
          {userInitials}
        </div>
      </div>
    </header>
  )
}

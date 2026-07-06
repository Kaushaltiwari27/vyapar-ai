'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Settings, CreditCard, HelpCircle, LogOut } from 'lucide-react'
import Link from 'next/link'

interface ProfileDropdownProps {
  userName: string
  businessName: string
  plan: string
}

export default function ProfileDropdown({ userName, businessName, plan }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = userName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const planColors: Record<string, string> = {
    trial: '#BA7517',
    starter: '#1D9E75',
    growth: '#2563EB',
    business: '#7C3AED'
  }

  const planNames: Record<string, string> = {
    trial: '14-Day Trial',
    starter: 'Basic',
    growth: 'Intermediate',
    business: 'Advance'
  }

  const planColor = planColors[plan] || '#6B7280'
  const planDisplayName = planNames[plan] || plan

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-md hover:shadow-lg transition-all border border-white/20"
        aria-label="Profile menu"
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{businessName}</p>
            <div className="mt-2">
              <span
                className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-block"
                style={{
                  backgroundColor: `${planColor}15`,
                  color: planColor
                }}
              >
                {planDisplayName}
              </span>
            </div>
          </div>

          {/* Menu items */}
          {[
            { icon: User, label: 'Profile', href: '/settings' },
            { icon: Settings, label: 'Settings', href: '/settings' },
            { icon: CreditCard, label: 'Billing & Plan', href: '/subscribe' },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          <hr className="border-slate-100 my-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50/50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}

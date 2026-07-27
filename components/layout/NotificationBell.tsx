'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Calendar, FileText, AlertTriangle, Check } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'leave' | 'invoice' | 'stock' | 'deal' | 'compliance'
  title: string
  body: string
  read: boolean
  created_at: string
  action_href?: string
}

export default function NotificationBell({ businessId }: { businessId: string }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (businessId) {
      loadNotifications()
    }
  }, [businessId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function loadNotifications() {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const notifs: Notification[] = []

    try {
      // 1. Pending leave requests
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('id, employees(full_name), leave_type_name, from_date, days, created_at')
        .eq('business_id', businessId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3)

      leaves?.forEach((l: any) => {
        notifs.push({
          id: `leave-${l.id}`,
          type: 'leave',
          title: 'Leave Request Pending',
          body: `${l.employees?.full_name || 'Employee'} requested ${l.days} days of ${l.leave_type_name || 'leave'}`,
          read: false,
          created_at: l.created_at,
          action_href: '/leaves'
        })
      })

      // 2. Overdue invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, customer_name, total_amount, due_date, created_at')
        .eq('business_id', businessId)
        .in('status', ['sent', 'overdue'])
        .lt('due_date', today)
        .limit(3)

      invoices?.forEach((inv: any) => {
        const days = Math.max(1, Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000))
        notifs.push({
          id: `inv-${inv.id}`,
          type: 'invoice',
          title: 'Invoice Overdue',
          body: `${inv.customer_name} — ₹${inv.total_amount?.toLocaleString('en-IN')} (${days} days overdue)`,
          read: false,
          created_at: inv.created_at,
          action_href: '/invoices'
        })
      })

      // 3. Low stock (safely fetched and filtered in JS)
      const { data: products } = await supabase
        .from('products')
        .select('id, name, current_stock, reorder_level, updated_at')
        .eq('business_id', businessId)

      if (products) {
        const lowStockProducts = products.filter(p => p.current_stock <= p.reorder_level)
        lowStockProducts.slice(0, 2).forEach(p => {
          notifs.push({
            id: `stock-${p.id}`,
            type: 'stock',
            title: 'Low Stock Alert',
            body: `${p.name} — only ${p.current_stock} units remaining`,
            read: false,
            created_at: p.updated_at || new Date().toISOString(),
            action_href: '/inventory'
          })
        })
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }

    // Sort by date descending
    notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setNotifications(notifs.slice(0, 8))
  }

  const unread = notifications.filter(n => !n.read).length

  const typeIcon: Record<string, any> = {
    leave: Calendar,
    invoice: FileText,
    stock: AlertTriangle,
    deal: FileText,
    compliance: AlertTriangle
  }

  const typeColor: Record<string, string> = {
    leave: '#7C3AED', // Purple
    invoice: '#E24B4A', // Red
    stock: '#D97706', // Amber
    deal: '#2563EB', // Blue
    compliance: '#10B981' // Emerald
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen(!open)
          loadNotifications()
        }}
        className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center justify-center relative cursor-pointer shadow-sm hover:shadow-md"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[420px] overflow-y-auto"
        >
          <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-800">Notifications</span>
            {unread > 0 && (
              <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                {unread} new
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                <span className="text-2xl mb-2">🎉</span>
                <p className="text-sm font-bold text-slate-700">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No pending actions.</p>
              </div>
            ) : (
              notifications.map(n => {
                const Icon = typeIcon[n.type] || Bell
                const iconColor = typeColor[n.type] || '#6B7280'

                return (
                  <Link
                    key={n.id}
                    href={n.action_href || '#'}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors items-start"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>

                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    )}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

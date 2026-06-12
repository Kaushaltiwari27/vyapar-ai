'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowRight, Home, Users, TrendingUp, FileText, Smartphone, ShieldCheck, Truck, Package } from 'lucide-react'

const productsMenu = [
  { name: 'Vyapar CRM', icon: TrendingUp, href: '/signup', description: 'Close more deals faster with AI.' },
  { name: 'Vyapar HRMS', icon: Users, href: '/signup', description: 'Automate payroll and attendance.' },
  { name: 'Smart Invoicing', icon: FileText, href: '/signup', description: 'Generate GST-compliant invoices.' },
  { name: 'WhatsApp OS', icon: Smartphone, href: '/signup', description: 'Engage customers directly on WhatsApp.', badge: 'NEW' },
  { name: 'Inventory', icon: Package, href: '/signup', description: 'Track stock across multiple warehouses.' },
  { name: 'Vendors', icon: Truck, href: '/signup', description: 'Manage POs and supplier relationships.' },
]

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm py-3' : 'bg-white/50 backdrop-blur-md border-b border-transparent py-5'}`}>
      <div className="w-full flex justify-between items-center px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-10">
          <Link href="/">
            <Image 
              src="/logo.png" 
              alt="VyaparAI" 
              width={160} 
              height={45} 
              className="object-contain"
              priority
            />
          </Link>
          
          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('products')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-primary transition-colors py-2">
                Products <ChevronDown className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {activeDropdown === 'products' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 w-[600px] bg-white rounded-2xl shadow-xl border border-slate-100 p-6 grid grid-cols-2 gap-6"
                  >
                    {productsMenu.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link key={item.name} href={item.href} className="flex items-start gap-4 group">
                          <div className="p-3 rounded-xl bg-slate-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                              {item.badge && <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="#solutions" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
              Solutions
            </Link>
            <Link href="#customers" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
              Customer Success
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="hidden sm:block text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors">
            Log In
          </Link>
          <Link 
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(37,99,235,0.35)]"
            style={{ background: 'var(--grad-button)' }}
          >
            Try for Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  )
}

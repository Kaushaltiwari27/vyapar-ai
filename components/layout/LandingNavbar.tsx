import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { ChevronDown, ArrowRight, Home, Users, TrendingUp, FileText, Smartphone, ShieldCheck, Truck, Package, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PlanSelectModal from '@/components/auth/PlanSelectModal'

const productsMenu = [
  { name: 'Vyapar CRM', icon: TrendingUp, href: '/customers', description: 'Close more deals faster with AI.' },
  { name: 'Vyapar HRMS', icon: Users, href: '/employees', description: 'Automate payroll and attendance.' },
  { name: 'Smart Invoicing', icon: FileText, href: '/invoices', description: 'Generate GST-compliant invoices.' },
  { name: 'WhatsApp OS', icon: Smartphone, href: '/whatsapp', description: 'Engage customers directly on WhatsApp.', badge: 'NEW' },
  { name: 'Inventory', icon: Package, href: '/inventory', description: 'Track stock across multiple warehouses.' },
  { name: 'Vendors', icon: Truck, href: '/vendors', description: 'Manage POs and supplier relationships.' },
]

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [redirectPath, setRedirectPath] = useState('/dashboard')

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user)
    })

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [supabase])

  const handleNavClick = (e: React.MouseEvent<any>, href: string) => {
    if (user) {
      return
    }
    e.preventDefault()
    setRedirectPath(href)
    setIsPlanModalOpen(true)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 z-[60] origin-left"
        style={{ scaleX }}
      />
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
                          <Link 
                            key={item.name} 
                            href={item.href} 
                            onClick={(e) => handleNavClick(e, item.href)}
                            className="flex items-start gap-4 group"
                          >
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

          <div className="hidden lg:flex items-center gap-6">
            {user ? (
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
                style={{ background: 'var(--grad-button)' }}
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <button 
                  onClick={(e) => handleNavClick(e, '/dashboard')}
                  className="text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors"
                >
                  Log In
                </button>
                <button 
                  onClick={(e) => handleNavClick(e, '/dashboard')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(37,99,235,0.35)]"
                  style={{ background: 'var(--grad-button)' }}
                >
                  Try for Free <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                <div className="font-bold text-slate-900 mb-2">Products</div>
                <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-slate-100">
                  {productsMenu.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href} 
                        onClick={(e) => handleNavClick(e, item.href)} 
                        className="flex items-center gap-3"
                      >
                        <Icon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
                <hr className="border-slate-100 my-2" />
                <Link href="#solutions" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-slate-900 py-2">Solutions</Link>
                <Link href="#customers" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-slate-900 py-2">Customer Success</Link>
                
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-100">
                  {user ? (
                    <Link 
                      href="/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center py-3 rounded-xl font-bold text-white shadow-lg"
                      style={{ background: 'var(--grad-button)' }}
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => handleNavClick(e, '/dashboard')}
                        className="text-center py-3 rounded-xl font-bold text-slate-700 bg-slate-50 border border-slate-200"
                      >
                        Log In
                      </button>
                      <button 
                        onClick={(e) => handleNavClick(e, '/dashboard')}
                        className="text-center py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 animate-pulse"
                        style={{ background: 'var(--grad-button)' }}
                      >
                        Start Free Trial
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Plan Selection Modal */}
      <PlanSelectModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        redirectPath={redirectPath}
      />
    </>
  )
}

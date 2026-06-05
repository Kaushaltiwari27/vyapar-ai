"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Search, Bell, HelpCircle, Grid, LogOut, Check, Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [businessName, setBusinessName] = useState("Loading...");
  const [userInitials, setUserInitials] = useState("?");
  
  // App Selection State
  const [activeApp, setActiveApp] = useState<'crm' | 'hrms' | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showAppLauncher, setShowAppLauncher] = useState(false);

  useEffect(() => {
    // Load preferred app from storage
    const savedApp = localStorage.getItem('vyapar_active_app') as 'crm' | 'hrms' | null;
    if (savedApp) {
      setActiveApp(savedApp);
    }
    setIsReady(true);

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, businesses(name)')
        .eq('id', user.id)
        .single();
      
      if (data) {
        const bus = data.businesses as unknown as { name?: string };
        setBusinessName(bus?.name || "Business");
        if (data.full_name) {
          const names = data.full_name.split(' ');
          const initials = names.length > 1 
            ? `${names[0][0]}${names[names.length-1][0]}` 
            : data.full_name.substring(0, 2);
          setUserInitials(initials.toUpperCase());
        }
      }
    }
    loadUser();
  }, [supabase]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      localStorage.removeItem('vyapar_active_app'); // Reset preference on logout
      router.push("/login");
      router.refresh();
    }
  };

  const selectApp = (app: 'crm' | 'hrms') => {
    setActiveApp(app);
    localStorage.setItem('vyapar_active_app', app);
    setShowAppLauncher(false);
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  };

  const crmTabs = [
    { name: "Home", href: "/dashboard" },
    { name: "Customers", href: "/customers" },
    { name: "Deals", href: "/deals" },
    { name: "Invoices", href: "/invoices" },
    { name: "Inventory", href: "/inventory" },
    { name: "Vendors", href: "/vendors" },
    { name: "Purchase Orders", href: "/purchase-orders" },
    { name: "AI Chat", href: "/chat" },
  ];

  const hrmsTabs = [
    { name: "Home", href: "/dashboard" },
    { name: "Employees", href: "/employees" },
    { name: "Attendance", href: "/attendance" },
    { name: "Leaves", href: "/leaves" },
  ];

  const currentTabs = activeApp === 'hrms' ? hrmsTabs : crmTabs;

  if (!isReady) return null;

  return (
    <>
      {/* INITIAL ONBOARDING MODAL (If no app selected) */}
      {!activeApp && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Welcome to VyaparAI</h2>
            <p className="text-slate-600 text-center mb-8">What would you like to focus on today? You can always switch later.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <button 
                onClick={() => selectApp('crm')}
                className="flex flex-col items-center p-8 border-2 border-slate-200 rounded-xl hover:border-[#0176D3] hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-16 h-16 bg-[#0176D3]/10 text-[#0176D3] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Vyapar CRM</h3>
                <p className="text-sm text-slate-500 text-center">Manage customers, invoices, inventory, and sales.</p>
              </button>
              
              <button 
                onClick={() => selectApp('hrms')}
                className="flex flex-col items-center p-8 border-2 border-slate-200 rounded-xl hover:border-[#0176D3] hover:bg-blue-50/50 transition-all group"
              >
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Vyapar HRMS</h3>
                <p className="text-sm text-slate-500 text-center">Manage employees, track attendance, and leaves.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP NAVIGATION */}
      <div className="flex flex-col w-full z-40 sticky top-0 shadow-sm print:hidden">
        
        {/* Global Header (Salesforce Blue) */}
        <header className="h-12 bg-[#0176D3] flex items-center justify-between px-4">
           {/* App Launcher & Search */}
           <div className="flex items-center gap-4 flex-1">
             
             {/* APP LAUNCHER BUTTON */}
             <div className="relative">
               <button 
                 onClick={() => setShowAppLauncher(!showAppLauncher)}
                 className="text-white hover:bg-white/10 p-1.5 rounded transition-colors"
                 title="App Launcher"
               >
                 <Grid className="w-5 h-5" />
               </button>
               
               {/* APP LAUNCHER DROPDOWN */}
               {showAppLauncher && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setShowAppLauncher(false)} />
                   <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded shadow-xl border border-slate-200 z-50 p-2 animate-in fade-in slide-in-from-top-2">
                     <div className="px-3 py-2 border-b border-slate-100 mb-2">
                       <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">App Launcher</h4>
                     </div>
                     <button 
                       onClick={() => selectApp('crm')}
                       className={`w-full flex items-center justify-between px-3 py-3 rounded hover:bg-slate-50 transition-colors ${activeApp === 'crm' ? 'bg-blue-50/50' : ''}`}
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-[#0176D3]/10 text-[#0176D3] rounded flex items-center justify-center"><Building2 className="w-4 h-4" /></div>
                         <div className="text-left">
                           <div className="text-sm font-bold text-slate-900">Vyapar CRM</div>
                           <div className="text-xs text-slate-500">Sales & Invoicing</div>
                         </div>
                       </div>
                       {activeApp === 'crm' && <Check className="w-4 h-4 text-[#0176D3]" />}
                     </button>
                     
                     <button 
                       onClick={() => selectApp('hrms')}
                       className={`w-full flex items-center justify-between px-3 py-3 rounded hover:bg-slate-50 transition-colors ${activeApp === 'hrms' ? 'bg-blue-50/50' : ''}`}
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded flex items-center justify-center"><Users className="w-4 h-4" /></div>
                         <div className="text-left">
                           <div className="text-sm font-bold text-slate-900">Vyapar HRMS</div>
                           <div className="text-xs text-slate-500">Employee Management</div>
                         </div>
                       </div>
                       {activeApp === 'hrms' && <Check className="w-4 h-4 text-[#0176D3]" />}
                     </button>
                   </div>
                 </>
               )}
             </div>

             <div className="flex items-center gap-2">
               <span className="text-white font-bold text-lg hidden sm:block tracking-wide">
                 VyaparAI <span className="font-normal opacity-80 text-sm ml-1">{activeApp === 'hrms' ? 'HRMS' : 'CRM'}</span>
               </span>
             </div>
             
             <div className="max-w-md w-full ml-4 hidden md:block">
               <div className="relative group">
                  <Search className="w-4 h-4 absolute left-3 top-2 text-slate-500 group-focus-within:text-[#0176D3]" />
                  <input 
                    type="text" 
                    placeholder="Search VyaparAI and more..." 
                    className="w-full h-8 pl-9 pr-4 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-white border-transparent transition-all shadow-inner" 
                  />
               </div>
             </div>
           </div>
           
           {/* Profile & Actions */}
           <div className="flex items-center gap-1">
             <button className="text-white hover:bg-white/10 p-1.5 rounded transition-colors hidden sm:block">
               <HelpCircle className="w-5 h-5" />
             </button>
             <button className="text-white hover:bg-white/10 p-1.5 rounded transition-colors hidden sm:block">
               <Bell className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-3 ml-2 pl-2 border-l border-blue-400/30">
               <div className="text-white text-xs font-semibold hidden lg:block opacity-90">
                 {businessName}
               </div>
               <div className="h-8 w-8 rounded-full bg-[#1B96FF] text-white font-bold flex items-center justify-center text-xs border-2 border-[#0176D3] shadow-sm cursor-pointer hover:bg-blue-400 transition-colors">
                 {userInitials}
               </div>
               <button onClick={handleLogout} className="text-white hover:bg-white/10 p-1.5 rounded transition-colors" title="Logout">
                 <LogOut className="w-4 h-4" />
               </button>
             </div>
           </div>
        </header>

        {/* Navigation Tabs (White) */}
        <nav className="h-12 bg-white border-b border-slate-200 flex items-center px-4 overflow-x-auto no-scrollbar shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <ul className="flex h-full min-w-max">
            {currentTabs.map((item) => {
              // Precise active state handling
              const isActive = item.href === '/dashboard' 
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
                
              return (
                <li key={item.name} className="h-full">
                  <Link
                    href={item.href}
                    className={`flex items-center h-full px-4 text-[13px] font-semibold border-b-[3px] transition-all whitespace-nowrap ${
                      isActive 
                        ? "border-[#0176D3] text-[#0176D3] bg-[#f3f2f2]/50" 
                        : "border-transparent text-slate-600 hover:text-[#0176D3] hover:bg-[#f3f2f2]"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}

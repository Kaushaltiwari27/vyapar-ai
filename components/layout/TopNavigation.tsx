"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Search, Bell, HelpCircle, Grid, LogOut } from "lucide-react";

export function TopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [businessName, setBusinessName] = useState("Loading...");
  const [userInitials, setUserInitials] = useState("?");

  useEffect(() => {
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
      router.push("/login");
      router.refresh();
    }
  };

  const navItems = [
    { name: "Home", href: "/dashboard" },
    { name: "Customers", href: "/customers" },
    { name: "Deals", href: "/deals" },
    { name: "Invoices", href: "/invoices" },
    { name: "Inventory", href: "/inventory" },
    { name: "Vendors", href: "/vendors" },
    { name: "Purchase Orders", href: "/purchase-orders" },
    { name: "Employees", href: "/employees" },
    { name: "Attendance", href: "/attendance" },
    { name: "Leaves", href: "/leaves" },
    { name: "AI Chat", href: "/chat" },
  ];

  return (
    <div className="flex flex-col w-full z-40 sticky top-0 shadow-sm print:hidden">
      {/* Global Header (Salesforce Blue) */}
      <header className="h-12 bg-[#0176D3] flex items-center justify-between px-4">
         {/* App Launcher & Search */}
         <div className="flex items-center gap-4 flex-1">
           <button className="text-white hover:bg-white/10 p-1.5 rounded transition-colors">
             <Grid className="w-5 h-5" />
           </button>
           <span className="text-white font-bold text-lg hidden sm:block tracking-wide">VyaparAI</span>
           
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
          {navItems.map((item) => {
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
  );
}

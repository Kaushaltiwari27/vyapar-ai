"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Home, Users, TrendingUp, FileText, MessageCircle, LogOut, Package, Truck, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [businessName, setBusinessName] = useState("Loading...");

  useEffect(() => {
    async function loadBusiness() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('businesses(name)')
        .eq('id', user.id)
        .single();
      
      const bus = data?.businesses as unknown as { name?: string };
      if (bus?.name) {
        setBusinessName(bus.name);
      }
    }
    loadBusiness();
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
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Deals", href: "/deals", icon: TrendingUp },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Vendors", href: "/vendors", icon: Truck },
    { name: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList },
    { name: "AI Chat", href: "/chat", icon: MessageCircle, badge: "NEW" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform shadow-2xl">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">Vyapar<span className="text-indigo-400">AI</span></span>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? "bg-indigo-500/10 text-indigo-400 shadow-sm border border-indigo-500/20" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              {item.name}
              {item.badge && (
                <span className="ml-auto bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Business Name */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center justify-between bg-slate-900 rounded-xl p-3 border border-slate-800">
          <div className="truncate pr-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Workspace</p>
            <p className="text-sm font-bold text-slate-200 truncate">{businessName}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

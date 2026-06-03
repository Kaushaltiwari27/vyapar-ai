"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Home, Users, TrendingUp, FileText, MessageCircle, LogOut } from "lucide-react";
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
    { name: "AI Chat", href: "/chat", icon: MessageCircle, badge: "NEW" },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-slate-200 bg-white flex flex-col transition-transform">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">VyaparAI</span>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              {item.name}
              {item.badge && (
                <span className="ml-auto bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Business Name */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Your Business</p>
            <p className="text-sm font-medium text-slate-900 truncate">{businessName}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

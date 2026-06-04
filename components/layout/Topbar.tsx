"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";

const getPageTitle = (pathname: string) => {
  if (pathname === '/dashboard') return "Dashboard Overview";
  if (pathname.startsWith('/customers')) return "Customers";
  if (pathname.startsWith('/deals')) return "Sales Pipeline";
  if (pathname.startsWith('/invoices/new')) return "Create Invoice";
  if (pathname.startsWith('/invoices')) return "Invoices";
  if (pathname.startsWith('/chat')) return "Vyapaar Mitra (AI Chat)";
  return "VyaparAI";
};

export function Topbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const supabase = createClient();
  const [userInitials, setUserInitials] = useState("?");
  const [businessName, setBusinessName] = useState("Loading...");

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

  return (
    <header className="h-20 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 z-30 sticky top-0 shadow-sm shadow-slate-100/50">
      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
      
      <div className="flex items-center gap-5">
        <div className="text-sm font-bold text-slate-600 hidden sm:block bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          {businessName}
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-indigo-200 ring-2 ring-white cursor-pointer hover:shadow-lg transition-all">
          {userInitials}
        </div>
      </div>
    </header>
  );
}

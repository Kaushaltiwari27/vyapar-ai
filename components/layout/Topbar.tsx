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
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-30 sticky top-0">
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-slate-700 hidden sm:block">
          {businessName}
        </div>
        <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-inner border border-indigo-200">
          {userInitials}
        </div>
      </div>
    </header>
  );
}

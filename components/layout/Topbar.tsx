"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import NotificationBell from "./NotificationBell";
import ProfileDropdown from "./ProfileDropdown";

const getPageTitle = (pathname: string) => {
  if (pathname === '/dashboard') return "Dashboard";
  if (pathname.startsWith('/customers')) return "Customers";
  if (pathname.startsWith('/deals')) return "Deals Pipeline";
  if (pathname.startsWith('/invoices')) return "Invoices";
  if (pathname.startsWith('/inventory')) return "Inventory";
  if (pathname.startsWith('/vendors')) return "Vendors";
  if (pathname.startsWith('/purchase-orders')) return "Purchase Orders";
  if (pathname.startsWith('/employees')) return "Employees";
  if (pathname.startsWith('/attendance')) return "Attendance";
  if (pathname.startsWith('/leaves')) return "Leave Management";
  if (pathname.startsWith('/payroll')) return "Payroll";
  if (pathname.startsWith('/compliance')) return "Compliance";
  if (pathname.startsWith('/whatsapp')) return "WhatsApp OS";
  if (pathname.startsWith('/chat')) return "AI Chat";
  if (pathname.startsWith('/settings')) return "Settings";
  return "VyaparAI";
};

export function Topbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const supabase = createClient();
  const [userName, setUserName] = useState("");
  const [businessName, setBusinessName] = useState("Loading...");
  const [businessId, setBusinessId] = useState("");
  const [plan, setPlan] = useState("trial");

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, plan, business_id, businesses(name)')
        .eq('id', user.id)
        .single();
      
      if (data) {
        const bus = data.businesses as unknown as { name?: string };
        setBusinessName(bus?.name || "Business");
        setBusinessId(data.business_id || "");
        setUserName(data.full_name || "User");
        setPlan(data.plan || "trial");
      }
    }
    loadUser();
  }, [supabase]);

  return (
    <header className="h-20 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl flex items-center justify-between px-8 z-30 sticky top-0 shadow-sm shadow-slate-100/50">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-[10px] font-semibold text-slate-400 mt-0.5 hidden md:block">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      
      <div className="flex items-center gap-5">
        <div className="text-sm font-bold text-slate-600 hidden sm:block bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          {businessName}
        </div>
        
        {businessId && <NotificationBell businessId={businessId} />}
        
        <ProfileDropdown userName={userName} businessName={businessName} plan={plan} />
      </div>
    </header>
  );
}

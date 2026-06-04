import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 print:bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="pl-60 print:pl-0 flex flex-col min-h-screen">
        <div className="print:hidden">
          <Topbar />
        </div>
        <main className="flex-1 overflow-x-hidden print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}

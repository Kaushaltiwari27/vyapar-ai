import { TopNavigation } from "@/components/layout/TopNavigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--page-bg)] print:bg-white flex relative">
      {/* Sidebar added here */}
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 lg:ml-64 overflow-x-hidden print:ml-0 print:overflow-visible transition-all duration-300">
        <TopNavigation />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

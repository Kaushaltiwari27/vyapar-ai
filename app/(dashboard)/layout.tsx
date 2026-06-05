import { TopNavigation } from "@/components/layout/TopNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background print:bg-white font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <TopNavigation />
      <main className="flex-1 overflow-x-hidden print:overflow-visible">
        {children}
      </main>
    </div>
  );
}

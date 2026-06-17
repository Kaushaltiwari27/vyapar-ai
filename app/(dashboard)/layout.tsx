import { TopNavigation } from "@/components/layout/TopNavigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlanProvider } from "@/components/providers/PlanProvider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status, trial_ends_at, business_id')
    .eq('id', user.id)
    .single()

  if (!profile?.plan) redirect('/select-plan')

  const expired = profile.subscription_status !== 'active' && 
    profile.trial_ends_at && new Date(profile.trial_ends_at) < new Date()
  if (expired || profile.subscription_status === 'expired') redirect('/subscribe')

  let currentPlan = profile.plan;

  return (
    <PlanProvider initialPlan={currentPlan}>
      <div className="min-h-screen bg-[var(--page-bg)] print:bg-white flex relative">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-0 lg:ml-64 overflow-x-hidden print:ml-0 print:overflow-visible transition-all duration-300">
          <TopNavigation />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </PlanProvider>
  );
}

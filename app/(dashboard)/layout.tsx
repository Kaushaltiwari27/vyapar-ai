import { TopNavigation } from "@/components/layout/TopNavigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single()

  if (profile?.business_id) {
    const { data: business } = await supabase
      .from('businesses')
      .select('subscription_status, trial_ends_at')
      .eq('id', profile.business_id)
      .single()

    if (business) {
      if (business.subscription_status === 'expired') {
        redirect('/upgrade')
      } else if (business.subscription_status === 'trialing' && business.trial_ends_at) {
        const trialEnd = new Date(business.trial_ends_at)
        if (trialEnd < new Date()) {
          // Trial has expired
          await supabase
            .from('businesses')
            .update({ subscription_status: 'expired' })
            .eq('id', profile.business_id)
          
          redirect('/upgrade')
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg)] print:bg-white flex relative">
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

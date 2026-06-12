"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import { hasFeature, getDaysLeft, PLANS, type Plan, type SubscriptionStatus } from '@/lib/plans';

type PlanContextType = {
  plan: Plan;
  status: SubscriptionStatus;
  daysLeft: number;
  isTrial: boolean;
  isActive: boolean;
  planConfig: typeof PLANS['trial'];
  can: (feature: keyof typeof PLANS['starter']['features']) => boolean;
};

const PlanContext = createContext<PlanContextType | null>(null);

export function PlanProvider({ 
  children, 
  initialBusiness 
}: { 
  children: ReactNode, 
  initialBusiness?: { plan: string, subscription_status: string, trial_ends_at: string } 
}) {
  const [business, setBusiness] = useState(initialBusiness);
  const supabase = createClient();

  useEffect(() => {
    if (!initialBusiness) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        supabase.from('profiles').select('business_id').eq('id', user.id).single().then(({ data }) => {
          if (data?.business_id) {
             supabase.from('businesses').select('plan, subscription_status, trial_ends_at').eq('id', data.business_id).single().then(({ data: bizData }) => {
               if (bizData) setBusiness(bizData as any);
             });
          }
        });
      });
    }
  }, [initialBusiness, supabase]);

  const plan = (business?.plan || 'trial') as Plan;
  const status = (business?.subscription_status || 'trial') as SubscriptionStatus;
  const daysLeft = business?.trial_ends_at ? getDaysLeft(business.trial_ends_at) : 14;
  const isTrial = status === 'trial';
  const isActive = status === 'active';

  const value = {
    plan,
    status,
    daysLeft,
    isTrial,
    isActive,
    planConfig: PLANS[plan] || PLANS['trial'],
    can: (feature: keyof typeof PLANS['starter']['features']) => hasFeature(plan, status, feature)
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    // Fallback if used outside provider (shouldn't happen, but just in case)
    return {
      plan: 'trial' as Plan,
      status: 'trial' as SubscriptionStatus,
      daysLeft: 14,
      isTrial: true,
      isActive: false,
      planConfig: PLANS['trial'],
      can: (feature: string) => true
    };
  }
  return context;
}

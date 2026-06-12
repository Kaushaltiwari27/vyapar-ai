"use client";

import { usePlan } from '@/lib/hooks/usePlan';
import UpgradePrompt from '@/components/ui/UpgradePrompt';
import { PLANS } from '@/lib/plans';

export function PlanGuard({ 
  children, 
  feature 
}: { 
  children: React.ReactNode, 
  feature: keyof typeof PLANS['starter']['features']
}) {
  const { can } = usePlan();

  if (can(feature)) {
    return <>{children}</>;
  }

  return <UpgradePrompt feature={feature} requiredPlan="Growth ya usse upar waale" />;
}

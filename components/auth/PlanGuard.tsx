"use client";

import { usePlan } from '@/lib/hooks/usePlan';
import LockedFeature from '@/components/ui/LockedFeature';
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

  // Determine minimum required plan for the locked feature
  let requiredPlan: 'starter' | 'growth' | 'business' = 'growth';
  if (PLANS.starter.features[feature]) {
    requiredPlan = 'starter';
  } else if (PLANS.growth.features[feature]) {
    requiredPlan = 'growth';
  } else {
    requiredPlan = 'business';
  }

  const featureNames: Record<string, string> = {
    customers: 'Customer Database',
    deals: 'Sales Pipeline',
    invoices: 'Invoice Generation',
    aiChat: 'Vyapaar Mitra (AI Chat)',
    inventory: 'Inventory & Stock Management',
    vendors: 'Vendor Directory',
    purchaseOrders: 'Purchase Orders',
    employees: 'Employee Directory',
    attendance: 'Attendance Tracker',
    leaves: 'Leave Management',
    payroll: 'Payroll Calculator',
    compliance: 'HR Compliance Documents',
    whatsapp: 'WhatsApp OS Automation',
    gstFiling: 'GST Report Filing'
  };

  const displayName = featureNames[feature] || feature;

  return <LockedFeature feature={displayName} requiredPlan={requiredPlan} />;
}

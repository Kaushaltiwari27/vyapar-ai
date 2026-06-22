export type Plan = 'trial' | 'starter' | 'growth' | 'business'
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled'

export interface PlanConfig {
  name: string
  price: number
  priceDisplay: string
  description: string
  maxCustomers: number | null
  maxInvoicesPerMonth: number | null
  maxAiMessagesPerDay: number | null
  features: {
    dashboard: boolean
    customers: boolean
    deals: boolean
    invoices: boolean
    aiChat: boolean
    inventory: boolean
    vendors: boolean
    purchaseOrders: boolean
    employees: boolean
    attendance: boolean
    leaves: boolean
    payroll: boolean
    compliance: boolean
    whatsapp: boolean
    gstFiling: boolean
  }
  razorpayPlanId: string
}

export const PLANS: Record<Plan, PlanConfig> = {
  trial: {
    name: 'Free Trial',
    price: 0,
    priceDisplay: 'Free 14 days',
    description: 'Sab features try karo',
    maxCustomers: null,
    maxInvoicesPerMonth: null,
    maxAiMessagesPerDay: null,
    features: {
      dashboard: true, customers: true, deals: true, invoices: true,
      aiChat: true, inventory: true, vendors: true, purchaseOrders: true,
      employees: true, attendance: true, leaves: true, payroll: true,
      compliance: true, whatsapp: true, gstFiling: true
    },
    razorpayPlanId: ''
  },
  starter: {
    name: 'Basic',
    price: 999,
    priceDisplay: '₹999/month',
    description: 'Solo founders ke liye',
    maxCustomers: 50,
    maxInvoicesPerMonth: 20,
    maxAiMessagesPerDay: 50,
    features: {
      dashboard: true, customers: true, deals: true, invoices: true,
      aiChat: true, inventory: false, vendors: false, purchaseOrders: false,
      employees: true, attendance: true, leaves: true, payroll: false,
      compliance: false, whatsapp: false, gstFiling: false
    },
    razorpayPlanId: process.env.RAZORPAY_PLAN_STARTER || ''
  },
  growth: {
    name: 'Intermediate',
    price: 2499,
    priceDisplay: '₹2,499/month',
    description: '10-50 employee businesses',
    maxCustomers: null,
    maxInvoicesPerMonth: null,
    maxAiMessagesPerDay: null,
    features: {
      dashboard: true, customers: true, deals: true, invoices: true,
      aiChat: true, inventory: true, vendors: true, purchaseOrders: true,
      employees: true, attendance: true, leaves: true, payroll: false,
      compliance: false, whatsapp: false, gstFiling: true
    },
    razorpayPlanId: process.env.RAZORPAY_PLAN_GROWTH || ''
  },
  business: {
    name: 'Advance',
    price: 4999,
    priceDisplay: '₹4,999/month',
    description: 'Full enterprise stack',
    maxCustomers: null,
    maxInvoicesPerMonth: null,
    maxAiMessagesPerDay: null,
    features: {
      dashboard: true, customers: true, deals: true, invoices: true,
      aiChat: true, inventory: true, vendors: true, purchaseOrders: true,
      employees: true, attendance: true, leaves: true, payroll: true,
      compliance: true, whatsapp: true, gstFiling: true
    },
    razorpayPlanId: process.env.RAZORPAY_PLAN_BUSINESS || ''
  }
}

export function hasFeature(plan: Plan, status: SubscriptionStatus, feature: keyof PlanConfig['features']): boolean {
  if (status === 'expired') return false
  // Return feature availability based on selected plan
  return PLANS[plan]?.features[feature] ?? false
}

export function getDaysLeft(trialEndsAt: string): number {
  return Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
}

export function isTrialExpired(business: any): boolean {
  if (business.subscription_status === 'active') return false
  if (business.subscription_status === 'trial') {
    return new Date(business.trial_ends_at) < new Date()
  }
  return business.subscription_status === 'expired'
}

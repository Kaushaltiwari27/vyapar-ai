/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function numberToWords(amount: number): string {
  const num = Math.floor(amount);
  if (num === 0) return 'Zero Only';
  
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const numStr = num.toString();
  if (numStr.length > 9) return 'Amount too large';
  
  const n = ('000000000' + numStr).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  
  const getWords = (digits: string) => {
    const d = parseInt(digits, 10);
    if (d === 0) return '';
    if (d < 20) return a[d] + ' ';
    return b[parseInt(digits[0], 10)] + (digits[1] === '0' ? ' ' : ' ' + a[parseInt(digits[1], 10)] + ' ');
  };

  let str = '';
  str += parseInt(n[1], 10) !== 0 ? getWords(n[1]) + 'Crore ' : '';
  str += parseInt(n[2], 10) !== 0 ? getWords(n[2]) + 'Lakh ' : '';
  str += parseInt(n[3], 10) !== 0 ? getWords(n[3]) + 'Thousand ' : '';
  str += parseInt(n[4], 10) !== 0 ? getWords(n[4]) + 'Hundred ' : '';
  str += parseInt(n[5], 10) !== 0 ? ((str !== '') ? 'and ' : '') + getWords(n[5]) : '';
  
  return str.replace(/\s+/g, ' ').trim() + ' Only';
}

// Auto-generate PO number
export async function generatePONumber(supabase: any, businessId: string): Promise<string> {
  const { count } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
  return `PO-${String((count || 0) + 1).padStart(4, '0')}`;
}

// Stock status helper
export function getStockStatus(current: number, reorder: number): 'ok' | 'low' | 'out' {
  if (current === 0) return 'out'
  if (current <= reorder) return 'low'
  return 'ok'
}

// Stock badge color
export function getStockBadgeStyle(status: 'ok' | 'low' | 'out') {
  const styles = {
    ok: 'bg-green-50 text-green-700 border-green-200',
    low: 'bg-amber-50 text-amber-700 border-amber-200',
    out: 'bg-red-50 text-red-700 border-red-200'
  }
  return styles[status]
}

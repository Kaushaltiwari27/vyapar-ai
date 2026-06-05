export interface PayrollInput {
  basicSalary: number;
  hra: number;
  otherAllowances: number;
  workingDays: number;      // standard working days in month (default 26)
  presentDays: number;      // actual days present (from attendance)
  leaveDays: number;        // paid leave days taken
  lopDays: number;          // loss of pay days
  pfApplicable: boolean;
  esicApplicable: boolean;
  pan?: string;
}

export interface PayrollOutput {
  grossSalary: number;
  effectiveGross: number;   // after LOP deduction
  lopDeduction: number;
  pfEmployee: number;       // 12% of basic (max basic ₹15,000 for PF = ₹1,800)
  pfEmployer: number;       // 12% of basic
  esicEmployee: number;     // 0.75% of gross (only if gross <= ₹21,000)
  esicEmployer: number;     // 3.25% of gross
  tds: number;              // simplified: 10% of basic if no PAN, else 0 for < ₹3L annual
  totalDeductions: number;
  netPay: number;
  ctcMonthly: number;       // gross + employer PF + employer ESIC
}

export function calculatePayroll(input: PayrollInput): PayrollOutput {
  const gross = (input.basicSalary || 0) + (input.hra || 0) + (input.otherAllowances || 0);

  // LOP calculation (proportional deduction)
  const perDaySalary = input.workingDays > 0 ? gross / input.workingDays : 0;
  const lopDeduction = Math.round(perDaySalary * (input.lopDays || 0));
  const effectiveGross = Math.max(0, gross - lopDeduction);

  // PF — 12% of basic (capped at ₹15,000 basic = max ₹1,800)
  const pfBase = Math.min((input.basicSalary || 0), 15000);
  const pfEmployee = input.pfApplicable ? Math.round(pfBase * 0.12) : 0;
  const pfEmployer = input.pfApplicable ? Math.round(pfBase * 0.12) : 0;

  // ESIC — only if effectiveGross <= ₹21,000/month
  const esicApplicable = input.esicApplicable && effectiveGross <= 21000;
  const esicEmployee = esicApplicable ? Math.round(effectiveGross * 0.0075) : 0;
  const esicEmployer = esicApplicable ? Math.round(effectiveGross * 0.0325) : 0;

  // TDS — simplified: 20% if no PAN (Section 206AA), else 5% slab for > 3L
  const annualBasic = (input.basicSalary || 0) * 12;
  const tds = !input.pan
    ? Math.round(effectiveGross * 0.20)   // 20% if no PAN
    : annualBasic > 300000
    ? Math.round((annualBasic - 300000) * 0.05 / 12)  // 5% slab
    : 0;

  const totalDeductions = pfEmployee + esicEmployee + tds;
  const netPay = effectiveGross - totalDeductions;
  const ctcMonthly = effectiveGross + pfEmployer + esicEmployer;

  return {
    grossSalary: gross,
    effectiveGross,
    lopDeduction,
    pfEmployee, 
    pfEmployer,
    esicEmployee, 
    esicEmployer,
    tds,
    totalDeductions,
    netPay,
    ctcMonthly
  };
}

// Generate compliance due dates for a given month/year
export function generateComplianceDates(month: number, year: number) {
  // PF due: 15th of next month
  // ESIC due: 15th of next month
  // TDS due: 7th of next month
  // GSTR-1 due: 11th of next month (monthly filer)
  // GSTR-3B due: 20th of next month
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const pad = (n: number) => String(n).padStart(2, '0');

  return [
    { type: 'PF', title: `PF Deposit — ${getMonthName(month)} ${year}`, due: `${nextYear}-${pad(nextMonth)}-15` },
    { type: 'ESIC', title: `ESIC Deposit — ${getMonthName(month)} ${year}`, due: `${nextYear}-${pad(nextMonth)}-15` },
    { type: 'TDS', title: `TDS Deposit — ${getMonthName(month)} ${year}`, due: `${nextYear}-${pad(nextMonth)}-07` },
    { type: 'GST', title: `GSTR-1 Filing — ${getMonthName(month)} ${year}`, due: `${nextYear}-${pad(nextMonth)}-11` },
    { type: 'GST', title: `GSTR-3B Filing — ${getMonthName(month)} ${year}`, due: `${nextYear}-${pad(nextMonth)}-20` },
  ];
}

export function getMonthName(m: number) {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1];
}

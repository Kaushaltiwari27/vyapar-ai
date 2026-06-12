import React from 'react';
import { PayrollDetail, Business } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { getMonthName } from '@/lib/payroll';
import { ToWords } from 'to-words';
import Image from 'next/image';

interface PayslipDocumentProps {
  business: Business;
  payroll: PayrollDetail;
}

const toWords = new ToWords({
  localeCode: 'en-IN',
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
  }
});

export const PayslipDocument: React.FC<PayslipDocumentProps> = ({ business, payroll }) => {
  const ctcMonthly = payroll.gross_salary + payroll.pf_employer + payroll.esic_employer;
  const netPayWords = toWords.convert(payroll.net_pay);

  return (
    <div className="bg-white w-full max-w-[800px] mx-auto p-8 border border-slate-200 text-slate-800 text-sm font-sans" id={`payslip-${payroll.id}`}>
      {/* Print Specific CSS is handled in a global stylesheet or a wrapper, 
          but we ensure this div is what gets printed cleanly */}
          
      {/* Header */}
      <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-widest text-[var(--primary-brand)]">{business.name}</h1>
        {business.address && <p className="text-xs text-slate-500 mt-1">{business.address}, {business.city}, {business.state}</p>}
        <h2 className="text-lg font-bold mt-4 uppercase tracking-wider bg-slate-100 inline-block px-4 py-1 border border-slate-300">
          Payslip for {getMonthName(payroll.month)} {payroll.year}
        </h2>
      </div>

      {/* Employee Details */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <table className="w-full text-xs">
            <tbody>
              <tr><td className="py-1 text-slate-500 w-32">Employee Name:</td><td className="py-1 font-bold">{payroll.employee_name}</td></tr>
              <tr><td className="py-1 text-slate-500">Employee Code:</td><td className="py-1 font-bold">{payroll.employee_code || 'N/A'}</td></tr>
              <tr><td className="py-1 text-slate-500">Designation:</td><td className="py-1 font-bold">{payroll.designation || 'N/A'}</td></tr>
              <tr><td className="py-1 text-slate-500">Department:</td><td className="py-1 font-bold">{payroll.department || 'N/A'}</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <table className="w-full text-xs">
            <tbody>
              <tr><td className="py-1 text-slate-500 w-32">Bank A/C:</td><td className="py-1 font-bold">{payroll.bank_account || 'N/A'}</td></tr>
              <tr><td className="py-1 text-slate-500">PAN Number:</td><td className="py-1 font-bold">{payroll.pan_number || 'N/A'}</td></tr>
              <tr><td className="py-1 text-slate-500">Working Days:</td><td className="py-1 font-bold">{payroll.working_days}</td></tr>
              <tr><td className="py-1 text-slate-500">Present Days:</td><td className="py-1 font-bold">{payroll.present_days}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="grid grid-cols-2 gap-0 border-2 border-slate-800 mb-8">
        {/* Earnings */}
        <div className="border-r-2 border-slate-800">
          <div className="bg-slate-100 font-bold p-2 text-center border-b-2 border-slate-800 uppercase tracking-wider">Earnings</div>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3">Basic Salary</td>
                <td className="py-2 px-3 text-right font-medium">{formatCurrency(payroll.basic_salary)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3">House Rent Allowance (HRA)</td>
                <td className="py-2 px-3 text-right font-medium">{formatCurrency(payroll.hra)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3">Other Allowances</td>
                <td className="py-2 px-3 text-right font-medium">{formatCurrency(payroll.other_allowances)}</td>
              </tr>
              {payroll.lop_deduction > 0 && (
                <tr className="border-b border-slate-200 text-rose-600">
                  <td className="py-2 px-3">Less: Loss of Pay (LOP)</td>
                  <td className="py-2 px-3 text-right font-medium">-{formatCurrency(payroll.lop_deduction)}</td>
                </tr>
              )}
              {/* Fill empty space */}
              <tr className="h-16"><td colSpan={2}></td></tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-800">
                <td className="py-3 px-3 uppercase tracking-wider">Gross Earnings</td>
                <td className="py-3 px-3 text-right">{formatCurrency(payroll.gross_salary - payroll.lop_deduction)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Deductions */}
        <div>
          <div className="bg-slate-100 font-bold p-2 text-center border-b-2 border-slate-800 uppercase tracking-wider">Deductions</div>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3">Provident Fund (PF)</td>
                <td className="py-2 px-3 text-right font-medium">{formatCurrency(payroll.pf_employee)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3">ESIC</td>
                <td className="py-2 px-3 text-right font-medium">{formatCurrency(payroll.esic_employee)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3">Tax Deducted at Source (TDS)</td>
                <td className="py-2 px-3 text-right font-medium">{formatCurrency(payroll.tds)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 px-3">Other Deductions</td>
                <td className="py-2 px-3 text-right font-medium">{formatCurrency(payroll.other_deductions)}</td>
              </tr>
              {/* Fill empty space */}
              <tr className="h-16"><td colSpan={2}></td></tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-800 text-rose-700">
                <td className="py-3 px-3 uppercase tracking-wider">Total Deductions</td>
                <td className="py-3 px-3 text-right">{formatCurrency(payroll.total_deductions)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Net Pay */}
      <div className="border-2 border-[var(--primary-brand)] bg-blue-50 p-6 text-center mb-8">
        <h3 className="text-xl font-bold uppercase tracking-wider text-[var(--primary-brand)] mb-1">Net Pay: {formatCurrency(payroll.net_pay)}</h3>
        <p className="text-sm text-slate-700 font-semibold italic">{netPayWords}</p>
      </div>

      {/* Footer Info */}
      <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 border-t border-slate-200 pt-6">
        <div>
          <p className="font-bold text-slate-700 mb-1">Employer Contributions (Not deducted from pay):</p>
          <p>Employer PF: {formatCurrency(payroll.pf_employer)}</p>
          <p>Employer ESIC: {formatCurrency(payroll.esic_employer)}</p>
          <p className="mt-1 font-bold text-slate-700">Monthly CTC: {formatCurrency(ctcMonthly)}</p>
        </div>
        <div className="text-right flex flex-col justify-end items-end">
          <p className="italic mb-2">This is a computer-generated payslip. No signature is required.</p>
          <div className="flex items-center gap-2 mt-2">
            <span>Powered by</span>
            <Image src="/logo.png" alt="VyaparAI" width={80} height={20} className="object-contain opacity-50 grayscale" />
          </div>
        </div>
      </div>
    </div>
  );
};

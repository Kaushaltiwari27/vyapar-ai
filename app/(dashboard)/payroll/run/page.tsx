"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/client";
import { Employee } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { calculatePayroll, PayrollInput, PayrollOutput, generateComplianceDates, getMonthName } from "@/lib/payroll";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, CheckCircle, Calculator, Info, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface EmployeePayrollData extends Employee {
  payrollInput: PayrollInput;
  payrollOutput: PayrollOutput;
}

export default function RunPayrollPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeesData, setEmployeesData] = useState<EmployeePayrollData[]>([]);
  const [businessId, setBusinessId] = useState("");
  
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const workingDays = 26; // Default standard

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
      if (!profile?.business_id) return;
      setBusinessId(profile.business_id);
      
      // Check if already processed
      const { data: existingRun } = await supabase
        .from('payroll_runs')
        .select('id, status')
        .eq('business_id', profile.business_id)
        .eq('month', month)
        .eq('year', year)
        .single();
        
      if (existingRun && existingRun.status === 'processed') {
        toast.error('Payroll for this month is already processed.');
        router.push('/payroll');
        return;
      }

      // Fetch Active Employees
      const { data: emps } = await supabase
        .from('employees')
        .select('*')
        .eq('business_id', profile.business_id)
        .eq('status', 'active');
        
      if (!emps || emps.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch Attendance for current month
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`; // Approx
      const { data: attendance } = await supabase
        .from('attendance')
        .select('employee_id, status, date')
        .eq('business_id', profile.business_id)
        .gte('date', startDate)
        .lte('date', endDate);

      const enrichedEmps = (emps as Employee[]).map(emp => {
        const empAtt = attendance?.filter(a => a.employee_id === emp.id) || [];
        const presentDays = empAtt.filter(a => ['present', 'half_day'].includes(a.status)).length;
        const leaveDays = empAtt.filter(a => a.status === 'on_leave').length;
        const lopDays = empAtt.filter(a => a.status === 'absent').length;

        const input: PayrollInput = {
          basicSalary: Number(emp.basic_salary) || 0,
          hra: Number(emp.hra) || 0,
          otherAllowances: Number(emp.other_allowances) || 0,
          workingDays,
          presentDays,
          leaveDays,
          lopDays,
          pfApplicable: emp.pf_applicable ?? true,
          esicApplicable: emp.esic_applicable ?? true,
          pan: emp.pan_number || undefined
        };

        return {
          ...emp,
          payrollInput: input,
          payrollOutput: calculatePayroll(input)
        };
      });

      setEmployeesData(enrichedEmps);
      setLoading(false);
    }
    init();
  }, [supabase, month, year, router]);

  const handleLopChange = (empId: string, newLop: number) => {
    setEmployeesData(prev => prev.map(emp => {
      if (emp.id !== empId) return emp;
      const updatedInput = { ...emp.payrollInput, lopDays: newLop };
      return {
        ...emp,
        payrollInput: updatedInput,
        payrollOutput: calculatePayroll(updatedInput)
      };
    }));
  };

  const totals = useMemo(() => {
    return employeesData.reduce((acc, emp) => ({
      gross: acc.gross + emp.payrollOutput.grossSalary,
      pf: acc.pf + emp.payrollOutput.pfEmployee + emp.payrollOutput.pfEmployer,
      esic: acc.esic + emp.payrollOutput.esicEmployee + emp.payrollOutput.esicEmployer,
      tds: acc.tds + emp.payrollOutput.tds,
      netPay: acc.netPay + emp.payrollOutput.netPay,
      ctc: acc.ctc + emp.payrollOutput.ctcMonthly
    }), { gross: 0, pf: 0, esic: 0, tds: 0, netPay: 0, ctc: 0 });
  }, [employeesData]);

  const handleSave = async (status: 'draft' | 'processed') => {
    if (employeesData.length === 0) return;
    setSaving(true);
    
    try {
      const { data: run, error: runError } = await supabase
        .from('payroll_runs')
        .upsert({
          business_id: businessId,
          month,
          year,
          status,
          total_gross: totals.gross,
          total_pf_employee: employeesData.reduce((sum, e) => sum + e.payrollOutput.pfEmployee, 0),
          total_pf_employer: employeesData.reduce((sum, e) => sum + e.payrollOutput.pfEmployer, 0),
          total_esic_employee: employeesData.reduce((sum, e) => sum + e.payrollOutput.esicEmployee, 0),
          total_esic_employer: employeesData.reduce((sum, e) => sum + e.payrollOutput.esicEmployer, 0),
          total_tds: totals.tds,
          total_deductions: employeesData.reduce((sum, e) => sum + e.payrollOutput.totalDeductions, 0),
          total_net_pay: totals.netPay,
          employee_count: employeesData.length,
          ...(status === 'processed' ? { processed_at: new Date().toISOString(), processed_by: (await supabase.auth.getUser()).data.user?.id } : {})
        }, { onConflict: 'business_id,month,year' })
        .select('id').single();

      if (runError) throw runError;

      const runId = run.id;

      // Delete old details if draft exists
      await supabase.from('payroll_details').delete().eq('payroll_run_id', runId);

      const detailsData = employeesData.map(emp => ({
        business_id: businessId,
        payroll_run_id: runId,
        employee_id: emp.id,
        employee_name: emp.full_name,
        employee_code: emp.employee_code,
        department: emp.department,
        designation: emp.designation,
        month,
        year,
        working_days: emp.payrollInput.workingDays,
        present_days: emp.payrollInput.presentDays,
        leave_days: emp.payrollInput.leaveDays,
        lop_days: emp.payrollInput.lopDays,
        basic_salary: emp.payrollInput.basicSalary,
        hra: emp.payrollInput.hra,
        other_allowances: emp.payrollInput.otherAllowances,
        gross_salary: emp.payrollOutput.grossSalary,
        lop_deduction: emp.payrollOutput.lopDeduction,
        pf_employee: emp.payrollOutput.pfEmployee,
        pf_employer: emp.payrollOutput.pfEmployer,
        esic_employee: emp.payrollOutput.esicEmployee,
        esic_employer: emp.payrollOutput.esicEmployer,
        tds: emp.payrollOutput.tds,
        other_deductions: 0,
        total_deductions: emp.payrollOutput.totalDeductions,
        net_pay: emp.payrollOutput.netPay,
        bank_account: emp.bank_account,
        bank_ifsc: emp.bank_ifsc,
        pan_number: emp.pan_number
      }));

      const { error: detailsError } = await supabase.from('payroll_details').insert(detailsData);
      if (detailsError) throw detailsError;

      // Generate compliances if processed
      if (status === 'processed') {
        const compliances = generateComplianceDates(month, year).map(c => ({
          business_id: businessId,
          compliance_type: c.type,
          title: c.title,
          due_date: c.due,
          month,
          year,
          amount: c.type === 'PF' ? totals.pf : c.type === 'ESIC' ? totals.esic : c.type === 'TDS' ? totals.tds : 0
        }));
        await supabase.from('compliance_calendar').insert(compliances);
        toast.success("Payroll processed successfully! Compliances generated.");
        router.push(`/payroll/${runId}`);
      } else {
        toast.success("Payroll draft saved.");
        router.push('/payroll');
      }

    } catch (err: any) {
      toast.error(err.message || "Failed to save payroll.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading payroll calculation engine...</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/payroll">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Run Payroll</h1>
              <span className="bg-blue-100 text-[#0176D3] text-xs font-bold px-2 py-0.5 rounded uppercase">{getMonthName(month)} {year}</span>
            </div>
            <p className="text-sm text-slate-500">Review attendance, adjust LOP, and finalize payroll.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving} className="bg-white text-slate-700 font-semibold h-10 px-6 rounded-sm border-slate-300">
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={() => handleSave('processed')} disabled={saving} className="bg-[#008a00] hover:bg-green-700 text-white font-semibold h-10 px-6 rounded-sm shadow-sm">
            <CheckCircle className="w-4 h-4 mr-2" /> Finalize Payroll
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 items-start">
        {/* Main Table */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#0176D3]" /> Live Calculation Register
            </h3>
            <span className="text-sm text-slate-500 font-semibold">{employeesData.length} Employees</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-white border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide">Employee</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide bg-slate-50 border-l border-slate-100">Working</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide bg-slate-50">Present</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide bg-amber-50 border-r border-slate-100">LOP</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide">Basic</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide">Gross</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide text-rose-600 bg-rose-50 border-l border-slate-100">PF (Emp)</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide text-rose-600 bg-rose-50">ESIC</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide text-rose-600 bg-rose-50 border-r border-slate-100">TDS</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wide text-right bg-emerald-50 text-emerald-700">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employeesData.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{emp.full_name}</p>
                      <p className="text-slate-500 text-[10px] uppercase">{emp.employee_code || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-3 bg-slate-50/50 border-l border-slate-100 font-medium">{emp.payrollInput.workingDays}</td>
                    <td className="px-4 py-3 bg-slate-50/50 font-medium">{emp.payrollInput.presentDays}</td>
                    <td className="px-4 py-2 bg-amber-50/50 border-r border-slate-100">
                      <Input 
                        type="number" 
                        min="0" 
                        max="31"
                        className="w-16 h-7 text-xs font-bold text-amber-700 border-amber-200 bg-white"
                        value={emp.payrollInput.lopDays}
                        onChange={(e) => handleLopChange(emp.id, parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(emp.payrollInput.basicSalary)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(emp.payrollOutput.grossSalary)}</td>
                    <td className="px-4 py-3 text-rose-600 bg-rose-50/30 border-l border-slate-100">{formatCurrency(emp.payrollOutput.pfEmployee)}</td>
                    <td className="px-4 py-3 text-rose-600 bg-rose-50/30">{formatCurrency(emp.payrollOutput.esicEmployee)}</td>
                    <td className="px-4 py-3 text-rose-600 bg-rose-50/30 border-r border-slate-100">{formatCurrency(emp.payrollOutput.tds)}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-700 bg-emerald-50/30 text-sm">{formatCurrency(emp.payrollOutput.netPay)}</td>
                  </tr>
                ))}
                {employeesData.length === 0 && (
                  <tr><td colSpan={10} className="p-8 text-center text-slate-500 text-sm">No active employees found to process payroll.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-[#0176D3] shadow-md rounded-sm bg-white overflow-hidden">
            <div className="bg-[#0176D3] text-white p-4">
              <h3 className="font-bold text-lg">Payroll Summary</h3>
              <p className="text-xs text-blue-100 opacity-90">Auto-calculated totals</p>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 text-sm">
                <div className="flex justify-between p-4">
                  <span className="text-slate-600 font-medium">Total Gross</span>
                  <span className="font-bold text-slate-900">{formatCurrency(totals.gross)}</span>
                </div>
                <div className="flex justify-between p-4 bg-rose-50/30">
                  <span className="text-slate-600 font-medium flex items-center gap-1"><Info className="w-3 h-3 text-slate-400"/> Total PF (Emp+Empr)</span>
                  <span className="font-bold text-rose-700">{formatCurrency(totals.pf)}</span>
                </div>
                <div className="flex justify-between p-4 bg-rose-50/30">
                  <span className="text-slate-600 font-medium flex items-center gap-1"><Info className="w-3 h-3 text-slate-400"/> Total ESIC</span>
                  <span className="font-bold text-rose-700">{formatCurrency(totals.esic)}</span>
                </div>
                <div className="flex justify-between p-4 bg-rose-50/30">
                  <span className="text-slate-600 font-medium">Total TDS</span>
                  <span className="font-bold text-rose-700">{formatCurrency(totals.tds)}</span>
                </div>
                <div className="flex justify-between p-5 bg-emerald-50 border-t-2 border-emerald-200">
                  <span className="text-emerald-800 font-bold text-base uppercase">Net Payout</span>
                  <span className="font-extrabold text-emerald-700 text-xl">{formatCurrency(totals.netPay)}</span>
                </div>
                <div className="flex justify-between p-4 bg-slate-50">
                  <span className="text-slate-500 font-medium text-xs">Total Company Cost (CTC)</span>
                  <span className="font-bold text-slate-700 text-xs">{formatCurrency(totals.ctc)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm">
            <h4 className="text-amber-800 font-bold text-sm mb-1 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Note</h4>
            <p className="text-xs text-amber-700 leading-relaxed">
              Finalizing this payroll will lock the records and automatically generate statutory compliance deadlines for PF, ESIC, and TDS for next month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

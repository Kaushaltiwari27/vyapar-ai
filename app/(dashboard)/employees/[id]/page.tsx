"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Employee, LeaveBalance, LeaveRequest, Attendance, Deal } from "@/lib/types";
import { EmployeeBadge } from "@/components/hrms/EmployeeBadge";
import { LeaveBalanceBar } from "@/components/hrms/LeaveBalanceBar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone, Mail, Calendar, User, FileText, Target, MapPin, Edit } from "lucide-react";
import Link from "next/link";
import { EmployeeForm } from "@/components/hrms/EmployeeForm";

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<(LeaveBalance & { leave_types: { name: string } })[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'leaves' | 'performance' | 'payslips'>('overview');
  const [formOpen, setFormOpen] = useState(false);
  const [businessId, setBusinessId] = useState("");

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Employee
    const { data: emp } = await supabase
      .from('employees')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (!emp) {
      setLoading(false);
      return;
    }
    
    setEmployee(emp);
    setBusinessId(emp.business_id);

    // 2. Leave Balances
    const currentYear = new Date().getFullYear();
    const { data: balances } = await supabase
      .from('leave_balances')
      .select('*, leave_types(name)')
      .eq('employee_id', emp.id)
      .eq('year', currentYear);
    
    setLeaveBalances((balances as any) || []);

    // 3. Leave History
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', emp.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    setLeaveHistory(leaves || []);

    // 4. Attendance (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: att } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', emp.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    setAttendance(att || []);

    // 5. Deals / Performance
    const { data: empDeals } = await supabase
      .from('deals')
      .select('*')
      .eq('business_id', emp.business_id)
      .ilike('owner_name', `%${emp.full_name.split(' ')[0]}%`)
      .order('created_at', { ascending: false })
      .limit(20);
    
    setDeals(empDeals || []);

    // 6. Payslips
    const { data: empPayslips } = await supabase
      .from('payroll_details')
      .select('*, payroll_runs(status)')
      .eq('employee_id', emp.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(12);

    setPayslips(empPayslips || []);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  if (loading) return <div className="p-8 text-slate-500">Loading profile...</div>;
  if (!employee) return <div className="p-8 text-rose-500">Employee not found.</div>;

  const wonDeals = deals.filter(d => d.stage === 'Won');
  const revenueGenerated = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  
  // Salary Calculation
  const gross = (employee.basic_salary || 0) + (employee.hra || 0) + (employee.other_allowances || 0);
  const pf = employee.pf_applicable ? Math.round((employee.basic_salary || 0) * 0.12) : 0;
  const esic = employee.esic_applicable && gross <= 21000 ? Math.round(gross * 0.0075) : 0;
  const net = gross - pf - esic;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/employees" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Employees
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div 
          className="h-24 w-full"
          style={{ backgroundColor: employee.department ? require('@/lib/utils').getDepartmentColor(employee.department) : '#6B7280' }}
        />
        <div className="px-8 pb-8 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 -mt-16 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              <div 
                className="w-24 h-24 rounded-2xl shadow-xl flex items-center justify-center text-3xl font-extrabold text-white border-4 border-white"
                style={{ backgroundColor: employee.department ? require('@/lib/utils').getDepartmentColor(employee.department) : '#6B7280' }}
              >
                {employee.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="text-center sm:text-left mb-1">
                <h1 className="text-3xl font-extrabold text-slate-900">{employee.full_name}</h1>
                <p className="text-lg font-medium text-slate-500">{employee.designation} • {employee.department}</p>
                {employee.employee_code && (
                  <Badge variant="outline" className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-slate-200">
                    {employee.employee_code}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <Button onClick={() => setFormOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md w-full md:w-auto">
                <Edit className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
              <Phone className="w-4 h-4 text-slate-400" /> {employee.phone}
            </div>
            {employee.email && (
              <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                <Mail className="w-4 h-4 text-slate-400" /> {employee.email}
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
              <Calendar className="w-4 h-4 text-slate-400" /> Joined {formatDate(employee.date_of_joining)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`text-[10px] uppercase font-bold tracking-wider px-2 border-0 ${employee.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {employee.status}
              </Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 text-[10px] uppercase font-bold tracking-wider px-2">
                {employee.employment_type?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {['overview', 'attendance', 'leaves', 'performance', 'payslips'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-3 text-sm font-bold capitalize transition-colors relative whitespace-nowrap ${
              activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Personal Details */}
            <Card className="shadow-sm border-0 ring-1 ring-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <User className="w-5 h-5 text-indigo-500" /> Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <dl className="divide-y divide-slate-100">
                  <div className="px-6 py-4 flex justify-between">
                    <dt className="text-sm font-medium text-slate-500">Date of Birth</dt>
                    <dd className="text-sm font-bold text-slate-900">{formatDate(employee.date_of_birth)}</dd>
                  </div>
                  <div className="px-6 py-4 flex justify-between">
                    <dt className="text-sm font-medium text-slate-500">Gender</dt>
                    <dd className="text-sm font-bold text-slate-900 capitalize">{employee.gender || '-'}</dd>
                  </div>
                  <div className="px-6 py-4">
                    <dt className="text-sm font-medium text-slate-500 flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4" /> Address
                    </dt>
                    <dd className="text-sm font-bold text-slate-900">{employee.address || '-'}</dd>
                    {employee.city && <dd className="text-sm font-medium text-slate-600 mt-0.5">{employee.city}</dd>}
                  </div>
                  <div className="px-6 py-4 bg-rose-50/50">
                    <dt className="text-xs font-extrabold text-rose-800 uppercase tracking-wider mb-2">Emergency Contact</dt>
                    <dd className="text-sm font-bold text-slate-900">{employee.emergency_contact || '-'}</dd>
                    <dd className="text-sm font-medium text-rose-600 mt-1">{employee.emergency_phone || '-'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Salary Breakdown */}
            <div className="space-y-6">
              <Card className="shadow-sm border-0 ring-1 ring-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <FileText className="w-5 h-5 text-indigo-500" /> Salary Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <dl className="divide-y divide-slate-100 text-sm">
                    <div className="px-6 py-3 flex justify-between items-center bg-white">
                      <dt className="font-medium text-slate-500">Basic Salary</dt>
                      <dd className="font-bold text-slate-900">{formatCurrency(employee.basic_salary || 0)}</dd>
                    </div>
                    <div className="px-6 py-3 flex justify-between items-center bg-white">
                      <dt className="font-medium text-slate-500">HRA</dt>
                      <dd className="font-bold text-slate-900">{formatCurrency(employee.hra || 0)}</dd>
                    </div>
                    <div className="px-6 py-3 flex justify-between items-center bg-white">
                      <dt className="font-medium text-slate-500">Other Allowances</dt>
                      <dd className="font-bold text-slate-900">{formatCurrency(employee.other_allowances || 0)}</dd>
                    </div>
                    <div className="px-6 py-4 flex justify-between items-center bg-slate-50 font-bold border-y border-slate-200">
                      <dt className="text-slate-800">Gross Salary</dt>
                      <dd className="text-indigo-700 text-base">{formatCurrency(gross)}</dd>
                    </div>
                    {pf > 0 && (
                      <div className="px-6 py-3 flex justify-between items-center bg-white text-rose-600">
                        <dt className="font-medium">PF Deduction</dt>
                        <dd className="font-bold">-{formatCurrency(pf)}</dd>
                      </div>
                    )}
                    {esic > 0 && (
                      <div className="px-6 py-3 flex justify-between items-center bg-white text-rose-600">
                        <dt className="font-medium">ESIC Deduction</dt>
                        <dd className="font-bold">-{formatCurrency(esic)}</dd>
                      </div>
                    )}
                    <div className="px-6 py-5 flex justify-between items-center bg-indigo-50 border-t border-indigo-100 rounded-b-xl">
                      <dt className="font-extrabold text-indigo-900">Net Take Home</dt>
                      <dd className="font-extrabold text-indigo-600 text-xl">{formatCurrency(net)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card className="shadow-sm border-0 ring-1 ring-slate-200">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Documents & Bank</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-slate-500 font-medium mb-1">PAN Number</span>
                      <span className="font-bold text-slate-900 uppercase">{employee.pan_number || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-medium mb-1">Aadhar Number</span>
                      <span className="font-bold text-slate-900">{employee.aadhar_number || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-medium mb-1">Bank Account</span>
                      <span className="font-bold text-slate-900">{employee.bank_account || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-medium mb-1">IFSC Code</span>
                      <span className="font-bold text-slate-900 uppercase">{employee.bank_ifsc || '-'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-900">Last 30 Days</h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-wrap gap-2">
              {attendance.map((record) => {
                let color = 'bg-slate-100 text-slate-400';
                if (record.status === 'present') color = 'bg-green-100 text-green-700 font-bold border-green-200';
                if (record.status === 'absent') color = 'bg-red-100 text-red-700 font-bold border-red-200';
                if (record.status === 'half_day') color = 'bg-amber-100 text-amber-700 font-bold border-amber-200';
                if (record.status === 'on_leave') color = 'bg-blue-100 text-blue-700 font-bold border-blue-200';
                
                const d = new Date(record.date);
                return (
                  <div key={record.id} className={`w-12 h-14 rounded-lg flex flex-col items-center justify-center border text-sm shadow-sm ${color}`} title={`${record.date}: ${record.status}`}>
                    <span className="text-[10px] uppercase font-bold opacity-70 mb-1">
                      {d.toLocaleString('en-us', { weekday: 'short' })}
                    </span>
                    <span>{d.getDate()}</span>
                  </div>
                );
              })}
              {attendance.length === 0 && <p className="text-slate-500">No attendance records found in the last 30 days.</p>}
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="col-span-1 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Leave Balances ({new Date().getFullYear()})</h3>
              {leaveBalances.length === 0 ? (
                <p className="text-slate-500 text-sm">No leave balances found.</p>
              ) : (
                leaveBalances.map(bal => (
                  <LeaveBalanceBar key={bal.id} balance={bal} leaveTypeName={bal.leave_types?.name || 'Leave'} />
                ))
              )}
            </div>
            <div className="col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Leave History</h3>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Days</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaveHistory.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{req.leave_type_name}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(req.from_date)} {req.from_date !== req.to_date && ` - ${formatDate(req.to_date)}`}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{req.days}</td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className={`text-[10px] uppercase font-bold tracking-wider px-2 border-0 ${
                            req.status === 'approved' ? 'bg-green-50 text-green-700' : 
                            req.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {req.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {leaveHistory.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No leave requests found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm bg-indigo-600 text-white relative overflow-hidden">
                <Target className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-500 opacity-50" />
                <CardContent className="p-6 relative z-10">
                  <p className="text-indigo-200 font-semibold text-sm uppercase tracking-wider mb-2">Total Revenue Generated</p>
                  <div className="text-3xl font-extrabold">{formatCurrency(revenueGenerated)}</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-200">
                <CardContent className="p-6">
                  <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-2">Deals Won</p>
                  <div className="text-3xl font-extrabold text-slate-900">{wonDeals.length}</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-200">
                <CardContent className="p-6">
                  <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-2">Total Deals Assigned</p>
                  <div className="text-3xl font-extrabold text-slate-900">{deals.length}</div>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-8">Recent Deals</h3>
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Deal Title</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deals.map(deal => (
                    <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{deal.title}</td>
                      <td className="px-6 py-4 text-slate-600">{deal.customer_name || '-'}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">{formatCurrency(deal.value)}</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className={`text-[10px] uppercase font-bold tracking-wider px-2 border-0 ${
                          deal.stage === 'Won' ? 'bg-green-50 text-green-700' : 
                          deal.stage === 'Lost' ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {deal.stage}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {deals.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No deals associated with this employee.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payslips' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-lg font-bold text-slate-900">Payslip History</h3>
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Gross Salary</th>
                    <th className="px-6 py-4">Net Pay</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payslips.map(ps => {
                    const monthName = require('@/lib/payroll').getMonthName(ps.month);
                    return (
                      <tr key={ps.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{monthName} {ps.year}</td>
                        <td className="px-6 py-4 text-slate-600">{formatCurrency(ps.gross_salary)}</td>
                        <td className="px-6 py-4 font-extrabold text-[#0176D3]">{formatCurrency(ps.net_pay)}</td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className={`text-[10px] uppercase font-bold tracking-wider px-2 border-0 ${
                            ps.payroll_runs?.status === 'processed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {ps.payroll_runs?.status || 'Draft'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/payroll/${ps.payroll_run_id}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                              <FileText className="w-3 h-3 mr-1" /> View Run
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {payslips.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No payslips generated for this employee yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <EmployeeForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        businessId={businessId} 
        initialData={employee}
        onSuccess={loadData}
      />
    </div>
  );
}

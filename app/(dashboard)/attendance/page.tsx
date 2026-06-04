"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Employee, Attendance } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Calendar, List, Download } from "lucide-react";
import { AttendanceMarker } from "@/components/hrms/AttendanceMarker";
import { AttendanceGrid } from "@/components/hrms/AttendanceGrid";
import toast from "react-hot-toast";

export default function AttendancePage() {
  const supabase = createClient();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState("");
  
  // UI State
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadBaseData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;
    setBusinessId(profile.business_id);
    const bizId = profile.business_id;

    // Fetch active employees
    const { data: emps } = await supabase
      .from('employees')
      .select('*')
      .eq('business_id', bizId)
      .eq('status', 'active')
      .order('full_name');
    
    setEmployees(emps || []);
    setLoading(false);
  };

  const loadMonthlyData = async () => {
    if (!businessId || viewMode !== 'monthly') return;
    
    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${lastDay}`;

    const { data: att } = await supabase
      .from('attendance')
      .select('*')
      .eq('business_id', businessId)
      .gte('date', startDate)
      .lte('date', endDate);
    
    setAttendanceData(att || []);
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    loadMonthlyData();
  }, [selectedMonth, selectedYear, viewMode, businessId]);

  const exportCSV = () => {
    if (attendanceData.length === 0 || employees.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    let csv = "Employee,Department,";
    days.forEach(d => csv += `${d},`);
    csv += "Total Present\n";

    employees.forEach(emp => {
      let row = `"${emp.full_name}","${emp.department || ''}",`;
      let total = 0;
      const empAtt = attendanceData.filter(a => a.employee_id === emp.id);
      
      days.forEach(d => {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const record = empAtt.find(a => a.date === dateStr);
        let status = record?.status || '';
        
        if (status === 'present') total += 1;
        if (status === 'half_day') total += 0.5;

        // Simplify for CSV
        if (status === 'present') row += 'P,';
        else if (status === 'absent') row += 'A,';
        else if (status === 'half_day') row += 'HD,';
        else if (status === 'on_leave') row += 'L,';
        else if (status === 'holiday') row += 'H,';
        else row += '-,';
      });
      row += `${total}\n`;
      csv += row;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${selectedYear}_${selectedMonth}.csv`;
    a.click();
  };

  if (loading) return <div className="p-8 text-slate-500">Loading attendance data...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance</h1>
          <p className="text-slate-500 mt-1">Mark daily attendance or view monthly reports.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode('daily')}
            className={`h-9 px-4 rounded-md transition-all font-semibold ${viewMode === 'daily' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List className="w-4 h-4 mr-2" /> Daily Marking
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode('monthly')}
            className={`h-9 px-4 rounded-md transition-all font-semibold ${viewMode === 'monthly' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Calendar className="w-4 h-4 mr-2" /> Monthly View
          </Button>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-fit">
            <span className="text-sm font-bold text-slate-700">Select Date:</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-indigo-500"
            />
          </div>
          
          <AttendanceMarker 
            businessId={businessId} 
            employees={employees} 
            date={selectedDate} 
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex gap-4">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-indigo-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-indigo-500"
              >
                {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <Button onClick={exportCSV} variant="outline" className="gap-2 font-semibold">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
          
          <AttendanceGrid 
            employees={employees} 
            attendanceData={attendanceData} 
            year={selectedYear} 
            month={selectedMonth} 
          />
        </div>
      )}
    </div>
  );
}

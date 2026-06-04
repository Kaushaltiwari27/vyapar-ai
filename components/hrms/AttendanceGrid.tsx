import { Employee, Attendance } from "@/lib/types";
import { EmployeeBadge } from "./EmployeeBadge";

interface AttendanceGridProps {
  employees: Employee[];
  attendanceData: Attendance[];
  year: number;
  month: number;
}

export function AttendanceGrid({ employees, attendanceData, year, month }: AttendanceGridProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Helper to get color dot based on status
  const getStatusColor = (status: string, isWeekend: boolean) => {
    if (status === 'present') return 'bg-green-500';
    if (status === 'absent') return 'bg-red-500';
    if (status === 'half_day') return 'bg-amber-500';
    if (status === 'on_leave') return 'bg-blue-500';
    if (status === 'holiday') return 'bg-purple-500';
    if (isWeekend) return 'bg-slate-200';
    return 'bg-transparent border border-slate-200';
  };

  const getStatusLetter = (status: string) => {
    if (status === 'present') return 'P';
    if (status === 'absent') return 'A';
    if (status === 'half_day') return 'H';
    if (status === 'on_leave') return 'L';
    if (status === 'holiday') return 'H';
    return '';
  };

  if (employees.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">No employees found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="px-4 py-3 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 min-w-[200px]">Employee</th>
              {days.map(day => {
                const date = new Date(year, month - 1, day);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <th key={day} className={`px-2 py-3 text-center ${isWeekend ? 'bg-slate-100 text-slate-400' : ''}`}>
                    {day}
                  </th>
                );
              })}
              <th className="px-4 py-3 text-center border-l border-slate-200">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map(emp => {
              const empAttendance = attendanceData.filter(a => a.employee_id === emp.id);
              let totalPresent = 0;

              return (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-200">
                    <EmployeeBadge name={emp.full_name} department={emp.department} size="sm" />
                  </td>
                  {days.map(day => {
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const record = empAttendance.find(a => a.date === dateStr);
                    const dateObj = new Date(year, month - 1, day);
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    
                    let status = record?.status || '';
                    if (!status && isWeekend) status = 'weekend';

                    if (status === 'present') totalPresent += 1;
                    if (status === 'half_day') totalPresent += 0.5;

                    return (
                      <td key={day} className={`px-1 py-3 text-center ${isWeekend ? 'bg-slate-50/50' : ''}`} title={`${dateStr}: ${status || 'No record'}`}>
                        <div className="flex justify-center items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ${getStatusColor(status, isWeekend)}`}>
                            {getStatusLetter(status)}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center border-l border-slate-200 font-bold text-slate-700">
                    {totalPresent}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="bg-slate-50 border-t border-slate-200 p-4 flex gap-6 text-xs font-semibold text-slate-600 justify-center flex-wrap">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" /> Present</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" /> Absent</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" /> Half Day</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" /> On Leave</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm" /> Holiday</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200 shadow-sm" /> Weekend</div>
      </div>
    </div>
  );
}

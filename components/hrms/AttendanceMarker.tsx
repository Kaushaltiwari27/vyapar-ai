import { useState, useEffect } from "react";
import { Employee } from "@/lib/types";
import { createClient } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { EmployeeBadge } from "./EmployeeBadge";
import toast from "react-hot-toast";

interface AttendanceMarkerProps {
  businessId: string;
  employees: Employee[];
  date: string;
}

export function AttendanceMarker({ businessId, employees, date }: AttendanceMarkerProps) {
  const [attendance, setAttendance] = useState<Record<string, { status: string; check_in: string; check_out: string; notes: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadAttendance() {
      setIsLoading(true);
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('business_id', businessId)
        .eq('date', date);

      const newAtt: Record<string, any> = {};
      
      // Initialize with defaults for all active employees
      employees.forEach(emp => {
        newAtt[emp.id] = { status: 'present', check_in: '09:00', check_out: '18:00', notes: '' };
      });

      // Override with saved data
      if (data) {
        data.forEach(record => {
          newAtt[record.employee_id] = {
            status: record.status,
            check_in: record.check_in ? record.check_in.substring(0, 5) : '',
            check_out: record.check_out ? record.check_out.substring(0, 5) : '',
            notes: record.notes || ''
          };
        });
      }
      
      setAttendance(newAtt);
      setIsLoading(false);
    }
    loadAttendance();
  }, [businessId, date, employees, supabase]);

  const updateField = (empId: string, field: string, value: string) => {
    setAttendance(prev => ({
      ...prev,
      [empId]: { ...prev[empId], [field]: value }
    }));
  };

  const markAll = (status: string) => {
    const newAtt = { ...attendance };
    Object.keys(newAtt).forEach(key => {
      newAtt[key].status = status;
      if (status === 'absent' || status === 'on_leave' || status === 'holiday') {
        newAtt[key].check_in = '';
        newAtt[key].check_out = '';
      } else if (status === 'present') {
        newAtt[key].check_in = '09:00';
        newAtt[key].check_out = '18:00';
      }
    });
    setAttendance(newAtt);
  };

  const saveAttendance = async () => {
    setIsSaving(true);
    try {
      const recordsToUpsert = Object.keys(attendance).map(empId => ({
        business_id: businessId,
        employee_id: empId,
        date: date,
        status: attendance[empId].status,
        check_in: attendance[empId].check_in || null,
        check_out: attendance[empId].check_out || null,
        notes: attendance[empId].notes || null
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(recordsToUpsert, { onConflict: 'employee_id,date' });

      if (error) throw error;
      toast.success('Attendance saved successfully');
    } catch (e: any) {
      toast.error('Error saving attendance: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading attendance data...</div>;
  if (employees.length === 0) return <div className="p-8 text-center text-slate-500">No active employees found.</div>;

  const counts = {
    present: Object.values(attendance).filter(a => a.status === 'present').length,
    absent: Object.values(attendance).filter(a => a.status === 'absent').length,
    on_leave: Object.values(attendance).filter(a => a.status === 'on_leave').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 font-bold text-sm">
            {counts.present} Present
          </div>
          <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-100 font-bold text-sm">
            {counts.absent} Absent
          </div>
          <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 font-bold text-sm">
            {counts.on_leave} On Leave
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => markAll('present')} className="font-semibold text-slate-700">
            Mark All Present
          </Button>
          <Button onClick={saveAttendance} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-4 py-4 w-40">Status</th>
                <th className="px-4 py-4 w-32">Check In</th>
                <th className="px-4 py-4 w-32">Check Out</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => {
                const att = attendance[emp.id] || { status: 'present', check_in: '', check_out: '', notes: '' };
                const isAbsent = att.status === 'absent' || att.status === 'on_leave' || att.status === 'holiday';
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <EmployeeBadge name={emp.full_name} department={emp.department} size="sm" />
                    </td>
                    <td className="px-4 py-4">
                      <select 
                        value={att.status} 
                        onChange={(e) => updateField(emp.id, 'status', e.target.value)}
                        className={`w-full px-2 py-1.5 rounded-md border text-sm font-semibold outline-none transition-colors ${
                          att.status === 'present' ? 'bg-green-50 border-green-200 text-green-700' :
                          att.status === 'absent' ? 'bg-red-50 border-red-200 text-red-700' :
                          att.status === 'half_day' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                          'bg-blue-50 border-blue-200 text-blue-700'
                        }`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="half_day">Half Day</option>
                        <option value="on_leave">On Leave</option>
                        <option value="holiday">Holiday</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <input 
                        type="time" 
                        value={att.check_in}
                        disabled={isAbsent}
                        onChange={(e) => updateField(emp.id, 'check_in', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-100" 
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input 
                        type="time" 
                        value={att.check_out}
                        disabled={isAbsent}
                        onChange={(e) => updateField(emp.id, 'check_out', e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-sm outline-none focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-100" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        placeholder="Optional notes..."
                        value={att.notes}
                        onChange={(e) => updateField(emp.id, 'notes', e.target.value)}
                        className="w-full px-3 py-1.5 border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded-md text-sm outline-none transition-colors bg-transparent focus:bg-white" 
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { Employee } from "@/lib/types";
import { EmployeeCard } from "./EmployeeCard";
import { useState } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { getDepartmentColor } from "@/lib/utils";

interface DepartmentOrgViewProps {
  employees: Employee[];
}

export function DepartmentOrgView({ employees }: DepartmentOrgViewProps) {
  // Group by department
  const grouped = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(emp);
    return acc;
  }, {} as Record<string, Employee[]>);

  // Initialize all departments as expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.keys(grouped).reduce((acc, dept) => ({ ...acc, [dept]: true }), {})
  );

  const toggleDept = (dept: string) => {
    setExpanded(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  if (employees.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">No employees found matching the filters.</p>
      </div>
    );
  }

  // Sort departments alphabetically, but put 'Unassigned' at the end
  const sortedDepartments = Object.keys(grouped).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {sortedDepartments.map(dept => {
        const color = getDepartmentColor(dept);
        const isExpanded = expanded[dept];
        
        return (
          <div key={dept} className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div 
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
              onClick={() => toggleDept(dept)}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${color}15`, color: color }}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{dept}</h3>
                  <p className="text-sm font-medium text-slate-500">{grouped[dept].length} Employee{grouped[dept].length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-slate-400">
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </div>
            
            {isExpanded && (
              <div className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {grouped[dept].map((emp, idx) => (
                    <div key={emp.id} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
                      <EmployeeCard employee={emp} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

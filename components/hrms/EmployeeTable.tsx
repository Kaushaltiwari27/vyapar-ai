import { Employee } from "@/lib/types";
import { EmployeeBadge } from "./EmployeeBadge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDeactivate: (employee: Employee) => void;
}

export function EmployeeTable({ employees, onEdit, onDeactivate }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-slate-500 font-medium">No employees found matching the filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <EmployeeBadge 
                    name={emp.full_name} 
                    department={emp.department} 
                    designation={emp.designation} 
                    size="md" 
                  />
                  {emp.employee_code && (
                    <div className="text-[10px] text-slate-400 font-bold mt-1 ml-11 uppercase tracking-wider">
                      {emp.employee_code}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-900 font-medium">{emp.phone}</div>
                  {emp.email && <div className="text-slate-500 text-xs">{emp.email}</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-900">{formatDate(emp.date_of_joining)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-600 capitalize">{emp.employment_type?.replace('_', ' ')}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className={`text-[10px] uppercase font-bold tracking-wider px-2 border-0 ${emp.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {emp.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/employees/${emp.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-[#0176D3]">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-[#0176D3]" onClick={() => onEdit(emp)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDeactivate(emp)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

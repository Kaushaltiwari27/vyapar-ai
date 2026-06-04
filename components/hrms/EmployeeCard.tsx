import { Employee } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeBadge } from "./EmployeeBadge";
import { Phone, Mail, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface EmployeeCardProps {
  employee: Employee;
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <Link href={`/employees/${employee.id}`} className="block group">
      <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-100 hover:ring-indigo-200 hover:shadow-md transition-all duration-200 group-hover:-translate-y-1 overflow-hidden h-full">
        <div 
          className="h-1.5 w-full"
          style={{ backgroundColor: employee.department ? require('@/lib/utils').getDepartmentColor(employee.department) : '#6B7280' }}
        />
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <EmployeeBadge 
              name={employee.full_name} 
              department={employee.department} 
              designation={employee.designation} 
              size="lg" 
            />
            <Badge variant="secondary" className={`text-[10px] uppercase font-bold tracking-wider px-2 border-0 ${employee.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {employee.status}
            </Badge>
          </div>
          
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{employee.phone}</span>
            </div>
            {employee.email && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{employee.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined {formatDate(employee.date_of_joining)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

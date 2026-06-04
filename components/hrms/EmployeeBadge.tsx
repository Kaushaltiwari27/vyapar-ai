import { getDepartmentColor } from "@/lib/utils";

interface EmployeeBadgeProps {
  name: string;
  department: string | null;
  designation?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

export function EmployeeBadge({ name, department, designation, size = 'md' }: EmployeeBadgeProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const color = department ? getDepartmentColor(department) : '#6B7280';
  
  const sizeClasses = {
    sm: { avatar: 'w-6 h-6 text-[10px]', text: 'text-xs', subtext: 'text-[10px]' },
    md: { avatar: 'w-8 h-8 text-xs', text: 'text-sm', subtext: 'text-xs' },
    lg: { avatar: 'w-12 h-12 text-lg', text: 'text-base', subtext: 'text-sm' },
  };

  return (
    <div className="flex items-center gap-3">
      <div 
        className={`rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${sizeClasses[size].avatar}`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      <div className="flex flex-col">
        <span className={`font-semibold text-slate-900 ${sizeClasses[size].text}`}>{name}</span>
        {(department || designation) && (
          <span className={`font-medium text-slate-500 ${sizeClasses[size].subtext}`}>
            {designation && `${designation} • `}
            {department}
          </span>
        )}
      </div>
    </div>
  );
}

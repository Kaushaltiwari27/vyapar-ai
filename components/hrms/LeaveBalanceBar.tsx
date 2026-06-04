import { LeaveBalance } from "@/lib/types";

interface LeaveBalanceBarProps {
  balance: LeaveBalance;
  leaveTypeName: string;
}

export function LeaveBalanceBar({ balance, leaveTypeName }: LeaveBalanceBarProps) {
  const percentageUsed = balance.allocated > 0 ? (balance.used / balance.allocated) * 100 : 0;
  const percentageRemaining = 100 - percentageUsed;
  
  const isLow = percentageRemaining <= 20;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-bold text-slate-900">{leaveTypeName}</h4>
        <span className="text-xs font-semibold text-slate-500">
          <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>{balance.balance}</span> / {balance.allocated} left
        </span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
        <div 
          className={`h-full ${isLow ? 'bg-rose-500' : 'bg-indigo-500'} transition-all duration-500`} 
          style={{ width: `${percentageUsed}%` }}
        />
      </div>
      <div className="mt-2 text-xs font-medium text-slate-400 flex justify-between">
        <span>Used: {balance.used}</span>
        <span>Allocated: {balance.allocated}</span>
      </div>
    </div>
  );
}

import { LeaveRequest } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeBadge } from "./EmployeeBadge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeaveRequestCardProps {
  request: LeaveRequest;
  onApprove: (req: LeaveRequest) => void;
  onReject: (req: LeaveRequest) => void;
}

export function LeaveRequestCard({ request, onApprove, onReject }: LeaveRequestCardProps) {
  const daysRequested = Math.floor((new Date().getTime() - new Date(request.created_at).getTime()) / (1000 * 3600 * 24));
  const requestedText = daysRequested === 0 ? 'Today' : `${daysRequested}d ago`;

  return (
    <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-100 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <EmployeeBadge 
            name={request.employees?.full_name || 'Unknown'} 
            department={request.employees?.department || null} 
            size="md" 
          />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            <Clock className="w-3 h-3" />
            {requestedText}
          </div>
        </div>
        
        <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-900">{request.leave_type_name}</span>
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">
              {request.days} Day{request.days > 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="font-medium">
              {formatDate(request.from_date)} 
              {request.from_date !== request.to_date && ` - ${formatDate(request.to_date)}`}
            </span>
          </div>
          
          {request.reason && (
            <p className="text-sm text-slate-600 italic border-l-2 border-slate-200 pl-3 py-1">
              "{request.reason}"
            </p>
          )}
        </div>

        {request.status === 'pending' && (
          <div className="grid grid-cols-2 gap-3 mt-5">
            <Button 
              variant="outline" 
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 gap-2"
              onClick={() => onReject(request)}
            >
              <X className="w-4 h-4" /> Reject
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200 gap-2"
              onClick={() => onApprove(request)}
            >
              <Check className="w-4 h-4" /> Approve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LeaveRequest } from "@/lib/types";
import { createClient } from "@/lib/client";
import toast from "react-hot-toast";

interface LeaveApprovalModalProps {
  request: LeaveRequest | null;
  mode: 'approve' | 'reject' | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  businessId: string;
}

export function LeaveApprovalModal({ request, mode, open, onOpenChange, onSuccess, businessId }: LeaveApprovalModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!request || !mode) return;
    
    if (mode === 'reject' && !reason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
      const approverId = profile?.id;

      if (mode === 'approve') {
        // 1. Update request status
        const { error: reqError } = await supabase
          .from('leave_requests')
          .update({
            status: 'approved',
            approved_by: approverId,
            approved_at: new Date().toISOString(),
            rejection_reason: reason.trim() || null
          })
          .eq('id', request.id);
        
        if (reqError) throw reqError;

        // 2. Update leave balance
        if (request.leave_type_id) {
          const year = new Date(request.from_date).getFullYear();
          const { data: balance, error: balError } = await supabase
            .from('leave_balances')
            .select('used, balance')
            .eq('employee_id', request.employee_id)
            .eq('leave_type_id', request.leave_type_id)
            .eq('year', year)
            .single();

          if (!balError && balance) {
            await supabase
              .from('leave_balances')
              .update({
                used: balance.used + request.days,
                balance: balance.balance - request.days
              })
              .eq('employee_id', request.employee_id)
              .eq('leave_type_id', request.leave_type_id)
              .eq('year', year);
          }
        }

        // 3. Mark attendance as 'on_leave' for the requested dates (excluding weekends)
        const start = new Date(request.from_date);
        const end = new Date(request.to_date);
        const attendanceRecords = [];
        
        while (start <= end) {
          const day = start.getDay();
          if (day !== 0 && day !== 6) { // Not Sunday or Saturday
            const dateStr = start.toISOString().split('T')[0];
            attendanceRecords.push({
              business_id: businessId,
              employee_id: request.employee_id,
              date: dateStr,
              status: 'on_leave',
              notes: `Leave: ${request.leave_type_name}`,
              marked_by: approverId
            });
          }
          start.setDate(start.getDate() + 1);
        }

        if (attendanceRecords.length > 0) {
          await supabase
            .from('attendance')
            .upsert(attendanceRecords, { onConflict: 'employee_id,date' });
        }

        toast.success("Leave approved successfully");
      } else {
        // Reject
        const { error: reqError } = await supabase
          .from('leave_requests')
          .update({
            status: 'rejected',
            approved_by: approverId,
            approved_at: new Date().toISOString(),
            rejection_reason: reason.trim()
          })
          .eq('id', request.id);
        
        if (reqError) throw reqError;
        toast.success("Leave rejected");
      }

      onSuccess();
      onOpenChange(false);
      setReason("");
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!isSubmitting) { onOpenChange(val); setReason(""); } }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className={mode === 'approve' ? 'text-green-700' : 'text-red-700'}>
            {mode === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'approve' 
              ? `You are about to approve ${request?.days} days of ${request?.leave_type_name} for ${request?.employees?.full_name}.`
              : `You are rejecting the leave request from ${request?.employees?.full_name}.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              {mode === 'approve' ? 'Add a note (Optional)' : 'Reason for Rejection (Required)'}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none h-24"
              placeholder={mode === 'approve' ? 'Happy holidays!' : 'e.g. Critical project delivery this week...'}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || (mode === 'reject' && !reason.trim())}
            className={mode === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}
          >
            {isSubmitting ? 'Processing...' : mode === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

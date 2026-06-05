"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { Employee } from "@/lib/types";
import toast from "react-hot-toast";

export function NewLeaveRequestModal({ open, onOpenChange, businessId, onSuccess }: any) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: ""
  });

  useEffect(() => {
    if (open && businessId) {
      // Load active employees
      supabase.from('employees').select('id, full_name').eq('business_id', businessId).eq('status', 'active')
        .then(({ data }) => setEmployees(data || []));
      
      // Load leave types
      supabase.from('leave_types').select('id, name, days_allowed').eq('business_id', businessId)
        .then(({ data }) => setLeaveTypes(data || []));
    }
  }, [open, businessId]);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 0;
    const diffTime = Math.abs(e.getTime() - s.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const days = calculateDays(formData.start_date, formData.end_date);
      if (days <= 0) throw new Error("End date must be after start date");

      const { error } = await supabase.from('leave_requests').insert([{
        business_id: businessId,
        employee_id: formData.employee_id,
        leave_type_id: formData.leave_type_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        days: days,
        reason: formData.reason,
        status: 'approved' // Auto-approve if admin adds it manually
      }]);

      if (error) throw error;
      
      toast.success("Leave request added & approved successfully!");
      setFormData({ employee_id: "", leave_type_id: "", start_date: "", end_date: "", reason: "" });
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Manual Leave Request</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Employee *</label>
              <select required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Leave Type *</label>
              <select required value={formData.leave_type_id} onChange={e => setFormData({...formData, leave_type_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Select Leave Type</option>
                {leaveTypes.map(lt => (
                  <option key={lt.id} value={lt.id}>{lt.name} (Max: {lt.days_allowed})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Start Date *</label>
                <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">End Date *</label>
                <input required type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Reason (Optional)</label>
              <textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2}></textarea>
            </div>
            
            {formData.start_date && formData.end_date && calculateDays(formData.start_date, formData.end_date) > 0 && (
              <p className="text-xs font-bold text-indigo-600 bg-indigo-50 p-2 rounded">
                Total Days: {calculateDays(formData.start_date, formData.end_date)}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              {loading ? "Adding..." : "Add & Approve Leave"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

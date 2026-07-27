"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { LeaveRequest } from "@/lib/types";
import { LeaveRequestCard } from "@/components/hrms/LeaveRequestCard";
import { LeaveApprovalModal } from "@/components/hrms/LeaveApprovalModal";
import { NewLeaveRequestModal } from "@/components/hrms/NewLeaveRequestModal";
import { Clock, CheckCircle2, XCircle, List, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanGuard } from "@/components/auth/PlanGuard";
import EmptyState from "@/components/ui/EmptyState";

export default function LeavesPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState("");
  
  // UI State
  const [activeFilter, setActiveFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [newLeaveModalOpen, setNewLeaveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'reject' | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;
    setBusinessId(profile.business_id);

    const { data } = await supabase
      .from('leave_requests')
      .select('*, employees(full_name, department)')
      .eq('business_id', profile.business_id)
      .order('created_at', { ascending: false });
    
    setRequests(data as any || []);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = (req: LeaveRequest) => {
    setSelectedRequest(req);
    setModalMode('approve');
    setModalOpen(true);
  };

  const handleReject = (req: LeaveRequest) => {
    setSelectedRequest(req);
    setModalMode('reject');
    setModalOpen(true);
  };

  const filteredRequests = requests.filter(r => activeFilter === 'all' || r.status === activeFilter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) return <div className="p-8 text-slate-500">Loading leave requests...</div>;

  return (
    <PlanGuard feature="leaves">
  
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Leave Approvals</h1>
          <p className="text-slate-500 mt-1">Manage employee time off requests.</p>
        </div>
        <Button onClick={() => setNewLeaveModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 gap-2 font-semibold">
          <Plus className="w-4 h-4" /> Add Manual Leave
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-3 text-sm font-bold capitalize transition-colors relative whitespace-nowrap flex items-center gap-2 ${
            activeFilter === 'pending' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Clock className="w-4 h-4" /> Pending
          {pendingCount > 0 && (
            <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold ml-1">
              {pendingCount}
            </span>
          )}
          {activeFilter === 'pending' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveFilter('approved')}
          className={`px-4 py-3 text-sm font-bold capitalize transition-colors relative whitespace-nowrap flex items-center gap-2 ${
            activeFilter === 'approved' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Approved
          {activeFilter === 'approved' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveFilter('rejected')}
          className={`px-4 py-3 text-sm font-bold capitalize transition-colors relative whitespace-nowrap flex items-center gap-2 ${
            activeFilter === 'rejected' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <XCircle className="w-4 h-4" /> Rejected
          {activeFilter === 'rejected' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-3 text-sm font-bold capitalize transition-colors relative whitespace-nowrap flex items-center gap-2 ${
            activeFilter === 'all' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <List className="w-4 h-4" /> All Requests
          {activeFilter === 'all' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
        </button>
      </div>

      {/* Grid / Empty State */}
      {requests.length === 0 ? (
        <EmptyState 
          icon={Calendar}
          title="No Leave Requests Yet"
          description="No leave requests have been submitted by your team yet. Manage employee leave requests and balances here."
          actionLabel="Add Manual Leave"
          onAction={() => setNewLeaveModalOpen(true)}
        />
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-medium text-lg">No {activeFilter !== 'all' ? activeFilter : ''} leave requests found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredRequests.map((req, idx) => (
            <div key={req.id} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both" style={{ animationDelay: `${idx * 50}ms` }}>
              <LeaveRequestCard 
                request={req} 
                onApprove={handleApprove} 
                onReject={handleReject} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      <LeaveApprovalModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        request={selectedRequest} 
        mode={modalMode} 
        onSuccess={loadRequests} 
        businessId={businessId} 
      />

      <NewLeaveRequestModal
        open={newLeaveModalOpen}
        onOpenChange={setNewLeaveModalOpen}
        businessId={businessId}
        onSuccess={loadRequests}
      />
    </div>
  
    </PlanGuard>
  );
}

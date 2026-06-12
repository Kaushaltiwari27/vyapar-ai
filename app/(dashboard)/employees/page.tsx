"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Employee } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Palmtree, Clock, Search, List, Grid, Plus } from "lucide-react";
import { EmployeeTable } from "@/components/hrms/EmployeeTable";
import { DepartmentOrgView } from "@/components/hrms/DepartmentOrgView";
import { EmployeeForm } from "@/components/hrms/EmployeeForm";
import { toast } from "react-hot-toast";

export default function EmployeesPage() {
  const supabase = createClient();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Metrics
  const [presentToday, setPresentToday] = useState(0);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);

  // UI State
  const [viewMode, setViewMode] = useState<'table' | 'org'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  
  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [businessId, setBusinessId] = useState("");

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('business_id').eq('id', user.id).single();
    if (!profile?.business_id) return;
    setBusinessId(profile.business_id);
    const bizId = profile.business_id;

    // 1. Fetch Employees
    const { data: emps } = await supabase
      .from('employees')
      .select('*')
      .eq('business_id', bizId)
      .order('full_name');
    
    setEmployees(emps || []);

    // 2. Fetch Metrics
    const today = new Date().toISOString().split('T')[0];
    
    const [present, leaves, pending] = await Promise.all([
      supabase.from('attendance').select('id', { count: 'exact' }).eq('business_id', bizId).eq('date', today).eq('status', 'present'),
      supabase.from('attendance').select('id', { count: 'exact' }).eq('business_id', bizId).eq('date', today).in('status', ['on_leave', 'half_day']),
      supabase.from('leave_requests').select('id', { count: 'exact' }).eq('business_id', bizId).eq('status', 'pending')
    ]);

    setPresentToday(present.count || 0);
    setOnLeaveToday(leaves.count || 0);
    setPendingLeaves(pending.count || 0);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete ${emp.full_name} and all their data from the database? This action cannot be undone.`)) return;
    
    // Deleting the employee will also delete attendance, leaves, etc., if cascading is set.
    // If cascading is not set, we might need to delete them manually, but Supabase handles relations or fails if restricted.
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', emp.id);

    if (error) {
      toast.error("Failed to delete employee: " + error.message);
    } else {
      toast.success("Employee permanently deleted from database");
      loadData();
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (emp.status === 'inactive') return false;
    const matchesSearch = emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.phone?.includes(searchQuery) ||
                          emp.employee_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter ? emp.department === deptFilter : true;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  if (loading) return <div className="p-8 text-slate-500">Loading HRMS data...</div>;

  return (
    <PlanGuard feature="employees">
  
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Employees</h1>
          <p className="text-slate-500 mt-1">Manage your team, hierarchy, and profiles.</p>
        </div>
        <Button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 gap-2 font-semibold">
          <Plus className="w-4 h-4" /> New Employee
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-100 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-blue-500" />
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-500">Total Employees</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{employees.filter(e => e.status === 'active').length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-100 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-green-500" />
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-500">Present Today</span>
              <UserCheck className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{presentToday}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-100 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-amber-500" />
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-500">On Leave Today</span>
              <Palmtree className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{onLeaveToday}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-100 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-rose-500" />
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-500">Pending Leaves</span>
              <Clock className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{pendingLeaves}</div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <select 
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept as string} value={dept as string}>{dept}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode('table')}
            className={`h-8 px-3 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List className="w-4 h-4 mr-2" /> List
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setViewMode('org')}
            className={`h-8 px-3 rounded-md transition-all ${viewMode === 'org' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Grid className="w-4 h-4 mr-2" /> Org
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {viewMode === 'table' ? (
          <EmployeeTable employees={filteredEmployees} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <DepartmentOrgView employees={filteredEmployees} />
        )}
      </div>

      {/* Slide-out Form */}
      {businessId && (
        <EmployeeForm 
          open={formOpen} 
          onOpenChange={setFormOpen} 
          businessId={businessId} 
          initialData={editingEmployee}
          onSuccess={loadData}
        />
      )}
    </div>
  
    </PlanGuard>
  );
}

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { generateEmployeeCode, calculateSalaryComponents, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { Employee } from "@/lib/types";

const employeeSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email().optional().or(z.literal('')),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  employment_type: z.string().min(1, "Employment type is required"),
  date_of_joining: z.string().min(1, "Date of joining is required"),
  date_of_birth: z.string().optional().or(z.literal('')),
  gender: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  basic_salary: z.coerce.number().min(0).default(0),
  hra: z.coerce.number().min(0).default(0),
  other_allowances: z.coerce.number().min(0).default(0),
  pf_applicable: z.boolean().default(true),
  esic_applicable: z.boolean().default(true),
  status: z.string().default('active'),
  notes: z.string().optional(),
  bank_account: z.string().optional(),
  bank_ifsc: z.string().optional(),
  pan_number: z.string().optional(),
  aadhar_number: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  initialData: Employee | null;
  onSuccess: () => void;
}

export function EmployeeForm({ open, onOpenChange, businessId, initialData, onSuccess }: EmployeeFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'salary' | 'docs'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      status: 'active',
      employment_type: 'full_time',
      pf_applicable: true,
      esic_applicable: true,
      basic_salary: 0,
      hra: 0,
      other_allowances: 0
    }
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        Object.keys(initialData).forEach((key) => {
          if (key in employeeSchema.shape) {
            setValue(key as keyof EmployeeFormData, (initialData as any)[key] || '');
          }
        });
      } else {
        reset({
          status: 'active',
          employment_type: 'full_time',
          pf_applicable: true,
          esic_applicable: true,
          date_of_joining: new Date().toISOString().split('T')[0],
          basic_salary: 0,
          hra: 0,
          other_allowances: 0
        });
      }
      setActiveTab('basic');
    }
  }, [open, initialData, reset, setValue]);

  const basicSalary = watch('basic_salary') || 0;
  const hra = watch('hra') || 0;
  const allowances = watch('other_allowances') || 0;
  const pf = watch('pf_applicable');
  const esic = watch('esic_applicable');

  const salaryCalc = calculateSalaryComponents(basicSalary, hra, allowances, pf, esic);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setIsSubmitting(true);
      
      let empCode = initialData?.employee_code;
      if (!empCode) {
        empCode = await generateEmployeeCode(supabase, businessId);
      }

      const payload = {
        business_id: businessId,
        employee_code: empCode,
        ...data,
      };

      if (initialData) {
        const { error } = await supabase
          .from('employees')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', initialData.id);
        
        if (error) throw error;
        toast.success("Employee updated successfully");
      } else {
        const { data: newEmp, error } = await supabase
          .from('employees')
          .insert([payload])
          .select()
          .single();
        
        if (error) throw error;
        
        // Auto-create leave balances
        const { data: leaveTypes } = await supabase
          .from('leave_types')
          .select('id, days_allowed')
          .eq('business_id', businessId);
          
        if (leaveTypes && leaveTypes.length > 0) {
          const year = new Date().getFullYear();
          const balancesToInsert = leaveTypes.map(lt => ({
            business_id: businessId,
            employee_id: newEmp.id,
            leave_type_id: lt.id,
            year: year,
            allocated: lt.days_allowed,
            balance: lt.days_allowed,
            used: 0
          }));
          await supabase.from('leave_balances').insert(balancesToInsert);
        }
        
        toast.success("Employee created successfully");
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] w-full p-0 flex flex-col bg-slate-50 overflow-hidden border-l border-slate-200 shadow-2xl">
        <div className="p-6 pb-0 bg-white border-b border-slate-100 relative z-10">
          <SheetHeader>
            <SheetTitle className="text-xl font-extrabold text-slate-900 tracking-tight">
              {initialData ? 'Edit Employee' : 'Add New Employee'}
            </SheetTitle>
            <SheetDescription className="text-slate-500 font-medium">
              Enter employee details and salary structure.
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex gap-4 mt-6 border-b border-slate-200">
            {['basic', 'salary', 'docs'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as any)}
                className={`pb-3 text-sm font-bold capitalize transition-colors relative ${activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab === 'docs' ? 'Documents' : tab === 'basic' ? 'Basic Info' : tab}
                {activeTab === tab && (
                  <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {activeTab === 'basic' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
                    <input {...register('full_name')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Ramesh Kumar" />
                    {errors.full_name && <p className="text-xs text-rose-500">{String(errors.full_name.message)}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone *</label>
                    <input {...register('phone')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                    {errors.phone && <p className="text-xs text-rose-500">{String(errors.phone.message)}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
                    <input {...register('email')} type="email" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Department *</label>
                    <select {...register('department')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none">
                      <option value="">Select Dept</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                    {errors.department && <p className="text-xs text-rose-500">{String(errors.department.message)}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Designation *</label>
                    <input {...register('designation')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                    {errors.designation && <p className="text-xs text-rose-500">{String(errors.designation.message)}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Joining Date *</label>
                    <input {...register('date_of_joining')} type="date" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Type</label>
                    <select {...register('employment_type')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none">
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="intern">Intern</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Emergency Contact Name</label>
                    <input {...register('emergency_contact')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                  </div>
                  
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Emergency Phone</label>
                    <input {...register('emergency_phone')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'salary' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Basic Salary (Monthly) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                      <input {...register('basic_salary')} type="number" className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">HRA</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                      <input {...register('hra')} type="number" className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Other Allowances</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                      <input {...register('other_allowances')} type="number" className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 p-4 bg-white border border-slate-200 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('pf_applicable')} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-semibold text-slate-700">PF Applicable</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('esic_applicable')} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm font-semibold text-slate-700">ESIC Applicable</span>
                  </label>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-3 shadow-sm">
                  <h4 className="text-xs font-extrabold text-indigo-800 uppercase tracking-wider">Salary Calculator (Live)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Gross Salary</span>
                      <span className="text-slate-900 font-bold">{formatCurrency(salaryCalc.gross)}</span>
                    </div>
                    {pf && (
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>PF Deduction (Employee 12%)</span>
                        <span className="text-rose-600 font-bold">-{formatCurrency(salaryCalc.pfEmployee)}</span>
                      </div>
                    )}
                    {esic && (
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>ESIC Deduction (0.75%)</span>
                        <span className="text-rose-600 font-bold">-{formatCurrency(salaryCalc.esicEmployee)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-indigo-200/60 flex justify-between items-center">
                      <span className="font-bold text-indigo-900">Net Take Home</span>
                      <span className="text-lg font-extrabold text-indigo-600">{formatCurrency(salaryCalc.netTakeHome)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">PAN Number</label>
                  <input {...register('pan_number')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Aadhar Number</label>
                  <input {...register('aadhar_number')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bank Account Number</label>
                  <input {...register('bank_account')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bank IFSC Code</label>
                  <input {...register('bank_ifsc')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
              </div>
            )}

          </div>

          <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3 z-10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 font-semibold px-6 active:scale-95 transition-all">
              {isSubmitting ? 'Saving...' : 'Save Employee'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

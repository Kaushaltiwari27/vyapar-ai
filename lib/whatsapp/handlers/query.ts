import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
);

export async function handleQuery(businessId: string, question: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Fetch all relevant data in parallel
  const [deals, invoices, customers, inventory, employees, attendance, payroll, compliance] = await Promise.all([
    supabase.from('deals').select('customer_name, value, stage, owner_name, created_at')
      .eq('business_id', businessId).order('created_at', { ascending: false }).limit(30),

    supabase.from('invoices').select('customer_name, total_amount, status, due_date, issue_date')
      .eq('business_id', businessId).order('created_at', { ascending: false }).limit(20),

    supabase.from('customers').select('name, company, total_revenue')
      .eq('business_id', businessId).order('total_revenue', { ascending: false }).limit(10),

    supabase.from('products').select('name, current_stock, reorder_level, selling_price, unit')
      .eq('business_id', businessId).limit(20),

    supabase.from('employees').select('full_name, department, designation, basic_salary, status')
      .eq('business_id', businessId).eq('status', 'active'),

    supabase.from('attendance').select('employees(full_name), status')
      .eq('business_id', businessId).eq('date', today),

    supabase.from('payroll_runs').select('month, year, status, total_gross, total_net_pay, employee_count')
      .eq('business_id', businessId).order('created_at', { ascending: false }).limit(3),

    supabase.from('compliance_calendar').select('compliance_type, title, due_date, amount, status')
      .eq('business_id', businessId).eq('status', 'pending').order('due_date').limit(5)
  ]);

  const wonThisMonth = deals.data?.filter(d =>
    d.stage === 'Won' && d.created_at?.startsWith(`${currentYear}-${String(currentMonth).padStart(2, '0')}`)
  );
  const totalWon = wonThisMonth?.reduce((s, d) => s + (d.value || 0), 0) || 0;

  const context = `
TODAY: ${today} | MONTH: ${currentMonth}/${currentYear}

DEALS (${deals.data?.length}): ${JSON.stringify(deals.data?.slice(0, 15).map(d => ({
  customer: d.customer_name, value: d.value, stage: d.stage, owner: d.owner_name
})))}
WON THIS MONTH: ${wonThisMonth?.length} deals, ₹${totalWon.toLocaleString('en-IN')}

INVOICES: ${JSON.stringify(invoices.data?.slice(0, 10).map(i => ({
  client: i.customer_name, amount: i.total_amount, status: i.status,
  due: i.due_date, overdue: new Date(i.due_date) < new Date() && i.status !== 'paid'
})))}

TOP CUSTOMERS: ${JSON.stringify(customers.data?.slice(0, 5))}

INVENTORY: ${JSON.stringify(inventory.data?.map(p => ({
  name: p.name, stock: `${p.current_stock} ${p.unit}`,
  status: p.current_stock === 0 ? 'OUT' : p.current_stock <= p.reorder_level ? 'LOW' : 'OK'
})))}

EMPLOYEES (${employees.data?.length} active): ${JSON.stringify(employees.data?.map(e => ({ name: e.full_name, dept: e.department, salary: e.basic_salary })))}

PRESENT TODAY: ${attendance.data?.length} — ${JSON.stringify(attendance.data?.filter(a => a.status === 'present').map((a: any) => a.employees?.full_name))}

PAYROLL: ${JSON.stringify(payroll.data)}

COMPLIANCE DUE: ${JSON.stringify(compliance.data?.map(c => ({ type: c.compliance_type, title: c.title, due: c.due_date, amount: c.amount })))}
`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: `Tu VyaparAI ka WhatsApp business assistant hai. Tera naam Vyapaar Mitra hai.
Sirf diye gaye data se jawab do. Kuch invent mat karo.
Hinglish mein jawab do — friendly, short, clear.
WhatsApp format use karo: *bold* for important numbers, emojis sparingly.
Max 5-6 lines. Indian number format (₹1,50,000).
Agar data nahi hai toh honestly bolo.`
    });

    const response = await model.generateContent(`Business data:\n${context}\n\nSawaal: ${question}`);
    return response.response.text();
  } catch (error) {
    console.error("Query handling error:", error);
    return "Maaf karna, abhi main data check nahi kar pa raha. Thodi der me koshish karein.";
  }
}

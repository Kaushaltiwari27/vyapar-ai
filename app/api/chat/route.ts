import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let contextData = "";

    if (user) {
      const { data: profile } = await supabase.from('profiles').select('business_id, full_name, businesses(name)').eq('id', user.id).single();
      
      if (profile?.business_id) {
        // Fetch Deals
        const { data: deals } = await supabase.from('deals').select('title, value, stage, customer_name, expected_close_date').eq('business_id', profile.business_id).order('updated_at', { ascending: false }).limit(30);
        
        // Fetch Pending Invoices
        const { data: invoices } = await supabase.from('invoices').select('invoice_number, customer_name, total_amount, status, due_date').eq('business_id', profile.business_id).in('status', ['sent', 'overdue']);
        
        // Fetch Top Customers
        const { data: customers } = await supabase.from('customers').select('name, company, total_revenue').eq('business_id', profile.business_id).order('total_revenue', { ascending: false }).limit(10);

        // Fetch Inventory
        const { data: inventory } = await supabase
          .from('products')
          .select('name, current_stock, reorder_level, selling_price, unit')
          .eq('business_id', profile.business_id)
          .eq('is_active', true)
          .order('current_stock', { ascending: true })
          .limit(20);

        // Fetch HRMS Data
        const today = new Date().toISOString().split('T')[0];
        const [
          { data: employees },
          { data: attendance },
          { data: pendingLeaves },
          { data: payrollRun },
          { data: complianceDue }
        ] = await Promise.all([
          supabase.from('employees').select('full_name, department, designation, status').eq('business_id', profile.business_id).eq('status', 'active'),
          supabase.from('attendance').select('status').eq('business_id', profile.business_id).eq('date', today),
          supabase.from('leave_requests').select('days, employees(full_name)').eq('business_id', profile.business_id).eq('status', 'pending'),
          supabase.from('payroll_runs').select('month, year, status, total_gross, total_net_pay, employee_count, total_pf_employee, total_tds').eq('business_id', profile.business_id).order('created_at', { ascending: false }).limit(3),
          supabase.from('compliance_calendar').select('compliance_type, title, due_date, amount, status').eq('business_id', profile.business_id).eq('status', 'pending').order('due_date', { ascending: true }).limit(5)
        ]);

        const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
        const leaveCount = attendance?.filter(a => ['on_leave', 'absent', 'half_day'].includes(a.status)).length || 0;

        contextData = `
User Context:
Business Owner: ${profile.full_name}
Business Name: ${(profile.businesses as {name?: string})?.name}

Recent Deals:
${JSON.stringify(deals, null, 2)}

Pending Invoices (Sent/Overdue):
${JSON.stringify(invoices, null, 2)}

Top Customers:
${JSON.stringify(customers, null, 2)}

INVENTORY (low stock first):
${JSON.stringify(inventory?.map(p => ({
  name: p.name,
  stock: `${p.current_stock} ${p.unit}`,
  status: p.current_stock === 0 ? 'OUT OF STOCK' : p.current_stock <= p.reorder_level ? 'LOW STOCK' : 'OK',
  value: p.current_stock * p.selling_price
})), null, 2)}

HRMS SUMMARY:
Total Active Employees: ${employees?.length || 0}
Present Today: ${presentCount}
On Leave/Absent Today: ${leaveCount}
Pending Leave Approvals: ${pendingLeaves?.length || 0}

PAYROLL (last 3 months):
${JSON.stringify(payrollRun?.map(p => ({
  period: p.month + "/" + p.year,
  status: p.status,
  employees: p.employee_count,
  gross: p.total_gross,
  netPay: p.total_net_pay,
  pf: p.total_pf_employee,
  tds: p.total_tds
})), null, 2)}

COMPLIANCE DEADLINES (upcoming):
${JSON.stringify(complianceDue?.map(c => ({
  type: c.compliance_type,
  title: c.title,
  dueDate: c.due_date,
  amount: c.amount,
  daysLeft: Math.ceil((new Date(c.due_date).getTime() - Date.now()) / 86400000)
})), null, 2)}
        `;
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "paste_your_gemini_api_key_here") {
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode("API key abhi add nahi hua. .env.local mein GEMINI_API_KEY daalo."));
          controller.close();
        },
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/plain' } });
    }


    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `Tu VyaparAI ka AI assistant hai. Tera naam Vyapaar Mitra hai. Indian SMB owner ke business data ke sawaalon ka jawaab de. Hinglish mein baat kar (Hindi + English mix). Data se hi jawaab do. Short aur clear rakh — max 4 lines. Amounts Indian format mein (₹1,50,000). Friendly aur helpful tone.

Aapke paas current business data hai:
${contextData}`;

    const prompt = `${systemPrompt}\n\nUser Question: ${message}`;
    
    const result = await model.generateContentStream(prompt);

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
        } catch (e) {
          console.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain" },
    });

  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

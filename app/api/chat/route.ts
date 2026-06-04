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

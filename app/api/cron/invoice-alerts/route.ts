import { createClient } from '@supabase/supabase-js'
import { sendText } from '@/lib/whatsapp/client'

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const today = new Date().toISOString().split('T')[0]

  const { data: settings } = await supabase
    .from('whatsapp_settings').select('business_id, owner_phone')
    .eq('is_active', true).eq('invoice_alerts', true)

  for (const s of settings || []) {
    const { data: overdueInv } = await supabase
      .from('invoices').select('id, customer_name, total_amount, due_date')
      .eq('business_id', s.business_id)
      .in('status', ['sent', 'overdue'])
      .lt('due_date', today)
      .limit(5)

    if (overdueInv?.length) {
      let msg = `⚠️ *Overdue Invoice Alert*\n\n`
      overdueInv.forEach(inv => {
        const days = Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000)
        msg += `• ${inv.customer_name} — ₹${inv.total_amount?.toLocaleString('en-IN')} _(${days} din overdue)_\n`
      })
      msg += `\nReminder bhejun? *Haan* ya *Nahi* likho`

      // Create pending approval for first invoice
      await supabase.from('pending_approvals').insert({
        business_id: s.business_id,
        owner_phone: s.owner_phone,
        action_type: 'send_invoice_reminder',
        entity_id: overdueInv[0].id,
        entity_name: overdueInv[0].customer_name,
        amount: overdueInv[0].total_amount,
        message: msg
      })
      await sendText(s.owner_phone, msg)
    }
  }
  return new Response('Invoice alerts sent', { status: 200 })
}

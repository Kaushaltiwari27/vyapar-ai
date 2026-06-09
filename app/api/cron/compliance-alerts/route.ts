import { createClient } from '@supabase/supabase-js'
import { sendText } from '@/lib/whatsapp/client'

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const today = new Date().toISOString().split('T')[0]
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const in1day = new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0]

  const { data: settings } = await supabase
    .from('whatsapp_settings').select('business_id, owner_phone')
    .eq('is_active', true).eq('compliance_alerts', true)

  for (const s of settings || []) {
    const { data: deadlines } = await supabase
      .from('compliance_calendar').select('compliance_type, title, due_date, amount')
      .eq('business_id', s.business_id).eq('status', 'pending')
      .gte('due_date', today).lte('due_date', in7days)
      .order('due_date')

    if (deadlines?.length) {
      let msg = `⚖️ *Compliance Deadlines*\n\n`
      deadlines.forEach(c => {
        const daysLeft = Math.ceil((new Date(c.due_date).getTime() - Date.now()) / 86400000)
        const emoji = daysLeft <= 1 ? '🔴' : daysLeft <= 3 ? '🟡' : '🟢'
        msg += `${emoji} *${c.title}*\n   Due: ${new Date(c.due_date).toLocaleDateString('en-IN')}`
        if (c.amount) msg += ` | ₹${c.amount.toLocaleString('en-IN')}`
        msg += '\n'
      })
      await sendText(s.owner_phone, msg)
    }
  }
  return new Response('Compliance alerts sent', { status: 200 })
}

import { createClient } from '@supabase/supabase-js'
import { sendText } from '@/lib/whatsapp/client'

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: settings } = await supabase
    .from('whatsapp_settings').select('business_id, owner_phone')
    .eq('is_active', true).eq('low_stock_alerts', true)

  for (const s of settings || []) {
    const { data: lowStock } = await supabase
      .from('products').select('name, current_stock, reorder_level, unit')
      .eq('business_id', s.business_id)
      .filter('current_stock', 'lte', 'reorder_level')
      .gt('reorder_level', 0).limit(5)

    if (lowStock?.length) {
      let msg = `📦 *Low Stock Alert*\n\n`
      lowStock.forEach(p => {
        const emoji = p.current_stock === 0 ? '⛔' : '⚠️'
        msg += `${emoji} *${p.name}* — ${p.current_stock} ${p.unit} bache\n`
      })
      msg += `\nPurchase Order banana chahte ho? *Haan* likho`
      
      // Optionally queue a pending approval for a PO, though we don't have a specific vendor here yet.
      // But we will send the alert anyway.
      await sendText(s.owner_phone, msg)
    }
  }
  return new Response('Stock alerts sent', { status: 200 })
}

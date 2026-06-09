import { createClient } from '@supabase/supabase-js'
import { sendText } from '@/lib/whatsapp/client'
import { generateMorningBriefing } from '@/lib/whatsapp/handlers/briefing'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  const { data: settings } = await supabase
    .from('whatsapp_settings')
    .select('business_id, owner_phone')
    .eq('is_active', true)
    .eq('morning_briefing_enabled', true)

  for (const s of settings || []) {
    try {
      const msg = await generateMorningBriefing(s.business_id)
      await sendText(s.owner_phone, msg)
      await new Promise(r => setTimeout(r, 500))
    } catch (err) { console.error(`Briefing failed for ${s.business_id}:`, err) }
  }
  return new Response(`Briefings sent: ${settings?.length}`, { status: 200 })
}

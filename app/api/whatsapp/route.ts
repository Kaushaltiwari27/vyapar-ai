import { createClient } from '@supabase/supabase-js'
import { classifyIntent } from '@/lib/whatsapp/intent'
import { sendText } from '@/lib/whatsapp/client'
import { handleApproval } from '@/lib/whatsapp/handlers/approval'
import { handleQuery } from '@/lib/whatsapp/handlers/query'
import { generateMorningBriefing } from '@/lib/whatsapp/handlers/briefing'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
)

// META WEBHOOK VERIFICATION
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified ✓')
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// RECEIVE MESSAGES
export async function POST(req: Request) {
  let body
  try { body = await req.json() } catch { return new Response('ok', { status: 200 }) }

  const entry = body.entry?.[0]?.changes?.[0]?.value
  const msg = entry?.messages?.[0]
  if (!msg) return new Response('ok', { status: 200 })

  const fromPhone = msg.from
  const text = msg.type === 'text'
    ? msg.text?.body?.trim()
    : msg.type === 'interactive'
    ? (msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title)
    : ''

  if (!text) return new Response('ok', { status: 200 })

  // Find business by owner phone
  const { data: settings } = await supabase
    .from('whatsapp_settings')
    .select('business_id, is_active')
    .eq('owner_phone', fromPhone)
    .single()

  if (!settings?.is_active) return new Response('ok', { status: 200 })

  const { business_id: bizId } = settings

  // Log incoming message
  await supabase.from('whatsapp_messages').insert({
    business_id: bizId,
    direction: 'incoming',
    from_number: fromPhone,
    content: text,
    wa_message_id: msg.id
  })

  try {
    const intent = await classifyIntent(text)

    let reply = ''

    if (intent.type === 'approval') {
      const isYes = intent.subtype === 'yes'
      reply = await handleApproval(bizId, fromPhone, isYes)
    }
    else if (intent.type === 'briefing') {
      reply = await generateMorningBriefing(bizId)
    }
    else {
      reply = await handleQuery(bizId, text)
    }

    await sendText(fromPhone, reply)

    // Log outgoing
    await supabase.from('whatsapp_messages').insert({
      business_id: bizId,
      direction: 'outgoing',
      to_number: fromPhone,
      content: reply,
      intent_type: intent.type
    })

  } catch (err) {
    console.error('WhatsApp handler error:', err)
    await sendText(fromPhone, '❌ Kuch gadbad ho gayi. Thodi der mein try karo.')
  }

  return new Response('ok', { status: 200 })
}

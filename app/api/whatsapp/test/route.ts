import { sendText } from '@/lib/whatsapp/client'

export async function POST(req: Request) {
  const { phone, message } = await req.json()
  if (!phone || !message) return Response.json({ error: 'phone and message required' }, { status: 400 })
  const result = await sendText(phone, message)
  return Response.json(result)
}

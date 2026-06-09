const BASE_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`
const HEADERS = {
  'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
  'Content-Type': 'application/json'
}

export async function sendText(to: string, text: string) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text, preview_url: false }
    })
  })
  const data = await res.json()
  return data
}

export async function sendButtons(to: string, body: string, buttons: string[]) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: {
          buttons: buttons.slice(0, 3).map((b, i) => ({
            type: 'reply',
            reply: { id: `action_${i}`, title: b.slice(0, 20) }
          }))
        }
      }
    })
  })
  return res.json()
}

export async function sendList(to: string, header: string, body: string, sections: any[]) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: header },
        body: { text: body },
        action: {
          button: 'Dekho',
          sections
        }
      }
    })
  })
  return res.json()
}

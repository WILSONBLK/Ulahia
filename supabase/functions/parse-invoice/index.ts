// Ulahia — Supabase Edge Function: parse-invoice
//
// Reads a photo of a supplier invoice / receipt with Claude vision and returns
// a clean list of line items { name, qty, unitCost } as strict JSON. The
// Anthropic API key is held here as a secret (ANTHROPIC_API_KEY) and NEVER
// reaches the browser.
//
// Deploy (one time, from the Ulahia folder):
//   supabase functions deploy parse-invoice
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Optional: pick a cheaper/faster model
//   supabase secrets set INVOICE_MODEL=claude-haiku-4-5
//
// Selling / retail price is intentionally NOT extracted — invoices only show
// cost. The shop owner sets the sell price in the review screen before saving.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const MODEL = Deno.env.get('INVOICE_MODEL') || 'claude-opus-4-8'

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          qty: { type: 'number' },
          unitCost: { type: 'number' },
        },
        required: ['name', 'qty', 'unitCost'],
      },
    },
  },
  required: ['items'],
}

function systemPrompt(existingNames: string[]): string {
  const known =
    existingNames && existingNames.length
      ? `\n\nProducts already in this shop's inventory (match spelling to these when an item is clearly the same product):\n${existingNames
          .slice(0, 300)
          .map((n) => `- ${n}`)
          .join('\n')}`
      : ''
  return (
    `You read a photo of a supplier invoice, delivery note, or purchase receipt for a small retail shop and extract the line items.\n\n` +
    `Rules:\n` +
    `- Return one entry per distinct product purchased.\n` +
    `- name: the product name only, cleaned up (no item codes, SKUs, or pack notation unless it identifies the product). Use Title Case.\n` +
    `- qty: the number of selling units received, as a plain number.\n` +
    `- unitCost: the cost of ONE unit, as a plain number with no currency symbol. If the sheet shows only a line total, divide the line total by qty.\n` +
    `- Ignore subtotal, tax/VAT, discount, delivery, and grand-total rows — only real products.\n` +
    `- If the image is not a legible invoice, return an empty items list.` +
    known
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return json({ error: 'not_configured' }, 500)
    }

    const { image, existingNames = [] } = await req.json()
    if (!image || typeof image !== 'string') {
      return json({ error: 'no_image' }, 400)
    }

    // Accept a data URL (data:image/jpeg;base64,....) or bare base64.
    const m = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s)
    const mediaType = m ? m[1] : 'image/jpeg'
    const base64 = m ? m[2] : image

    const anthRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system: systemPrompt(existingNames),
        output_config: { format: { type: 'json_schema', schema: SCHEMA } },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64 },
              },
              {
                type: 'text',
                text: 'Extract the purchased line items from this invoice.',
              },
            ],
          },
        ],
      }),
    })

    if (!anthRes.ok) {
      const detail = await anthRes.text()
      console.error('anthropic error', anthRes.status, detail)
      return json({ error: 'vision_failed', status: anthRes.status }, 502)
    }

    const data = await anthRes.json()

    if (data.stop_reason === 'refusal') {
      return json({ error: 'refused' }, 422)
    }

    const textBlock = (data.content || []).find(
      (b: { type: string }) => b.type === 'text',
    )
    let parsed: { items?: unknown }
    try {
      parsed = JSON.parse(textBlock?.text || '{}')
    } catch {
      return json({ error: 'bad_output' }, 502)
    }

    const items = Array.isArray(parsed.items)
      ? parsed.items
          .map((it: { name?: unknown; qty?: unknown; unitCost?: unknown }) => ({
            name: String(it?.name || '').trim(),
            qty: Number(it?.qty) || 0,
            unitCost: Number(it?.unitCost) || 0,
          }))
          .filter((it: { name: string }) => it.name.length > 0)
      : []

    return json({ items }, 200)
  } catch (e) {
    console.error('parse-invoice crash', e)
    return json({ error: 'server_error' }, 500)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  })
}

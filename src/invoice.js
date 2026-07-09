// Ulahia — invoice import helpers (client side)
//
// Turns a photo of a supplier invoice into draft inventory rows the shop owner
// reviews before anything is saved. The actual reading happens server-side in
// the `parse-invoice` Supabase Edge Function (which holds the AI key); this
// file just prepares the image, calls the function, and matches items to
// existing products by name.

import { supabase } from './supabase.js'
import { resizeImage } from './utils.js'

// Compress the photo before upload — keeps it legible for OCR but small enough
// to send on a slow connection.
export function invoiceImageDataUrl(file) {
  return resizeImage(file, 1600, 0.72)
}

// Send the image to the edge function. Resolves to an array of
// { name, qty, unitCost }. Throws an Error whose .code explains the failure so
// the UI can show the right message and fall back to manual entry.
export async function parseInvoice({ dataUrl, existingNames = [] }) {
  if (!supabase) {
    const err = new Error('offline')
    err.code = 'not_configured'
    throw err
  }

  const { data, error } = await supabase.functions.invoke('parse-invoice', {
    body: { image: dataUrl, existingNames },
  })

  if (error) {
    const err = new Error('invoke-failed')
    // A non-2xx from the function surfaces here; try to read its JSON body.
    err.code = 'read_failed'
    try {
      const body = await error.context?.json?.()
      if (body?.error) err.code = body.error
    } catch { /* ignore */ }
    throw err
  }

  if (data?.error) {
    const err = new Error(data.error)
    err.code = data.error
    throw err
  }

  return Array.isArray(data?.items) ? data.items : []
}

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Best-effort name match against existing products. Returns the product or null.
export function matchProduct(name, products) {
  const n = normalize(name)
  if (!n) return null
  // 1. exact normalized match
  let hit = products.find(p => normalize(p.name) === n)
  if (hit) return hit
  // 2. one name contains the other (e.g. "Peak Milk 400g" ⊃ "Peak Milk")
  hit = products.find(p => {
    const pn = normalize(p.name)
    return pn.length > 2 && (pn.includes(n) || n.includes(pn))
  })
  return hit || null
}

import { supabase } from './supabase.js'

const CLOUD_META_KEY = 'ulahia-cloud-meta'
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode() {
  return Array.from({ length: 6 }, () =>
    CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join('')
}

export function getCloudMeta() {
  try {
    const raw = localStorage.getItem(CLOUD_META_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function getOrCreateCloudMeta() {
  const existing = getCloudMeta()
  if (existing?.profileId && existing?.recoveryCode) return existing
  const meta = { profileId: crypto.randomUUID(), recoveryCode: generateCode() }
  localStorage.setItem(CLOUD_META_KEY, JSON.stringify(meta))
  return meta
}

export function setCloudMeta(meta) {
  localStorage.setItem(CLOUD_META_KEY, JSON.stringify(meta))
}

export async function pushState(profileId, recoveryCode, state) {
  if (!supabase) return { ok: false }
  // Don't sync ephemeral fields, and don't sync device-local preferences
  // (PIN, appearance, language) — cloud backup covers shop/business data only.
  const { shop, products, transactions, customers, expenses, withdrawals } = state
  // Product images are stored on-device only — strip them so cloud rows stay small
  const productsForSync = (products || []).map(({ image, ...rest }) => rest)
  const { error } = await supabase.rpc('sync_push_state', {
    p_shop_id: profileId,
    p_recovery_code: recoveryCode,
    p_shop: shop,
    p_products: productsForSync,
    p_customers: customers,
    p_sales: transactions,
    p_expenses: expenses,
    p_withdrawals: withdrawals,
  })
  return { ok: !error, error }
}

export async function pullByCode(code) {
  if (!supabase) return null
  const trimmedCode = code.toUpperCase().trim()

  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('id, name, owner, phone, currency, business_type, updated_at')
    .eq('recovery_code', trimmedCode)
    .single()
  if (shopError || !shop) return null

  const [{ data: products }, { data: customers }, { data: sales }, { data: expenses }, { data: withdrawals }] =
    await Promise.all([
      supabase.from('products').select('*').eq('shop_id', shop.id),
      supabase.from('customers').select('*, payments(*)').eq('shop_id', shop.id),
      supabase.from('sales').select('*, sale_items(*)').eq('shop_id', shop.id).order('time', { ascending: false }),
      supabase.from('expenses').select('*').eq('shop_id', shop.id),
      supabase.from('withdrawals').select('*').eq('shop_id', shop.id),
    ])

  const transactions = (sales || []).map(s => ({
    id: s.id,
    time: s.time,
    items: (s.sale_items || []).map(i => ({
      type: i.type,
      productId: i.product_id,
      name: i.name,
      price: Number(i.price),
      cost: Number(i.cost),
      qty: Number(i.qty),
      subtotal: Number(i.subtotal),
    })),
    total: Number(s.total),
    profit: Number(s.profit),
    mode: s.mode,
    customerId: s.customer_id,
    customerName: s.customer_name,
    customerPhone: s.customer_phone,
    amountPaid: Number(s.amount_paid),
    balance: Number(s.balance),
  }))

  const customersOut = (customers || []).map(c => {
    // totalBalance isn't a stored column (Phase A: derivable) — reconstruct
    // it exactly the way the local reducer maintains it: sum of sale
    // balances minus payments, clamped at zero (store.jsx ADD_PAYMENT).
    const custSales = (sales || []).filter(s => s.customer_id === c.id)
    const custPayments = (c.payments || [])
      .slice()
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .map(p => ({ id: p.id, amount: Number(p.amount), time: p.time, note: p.note }))
    const owed = custSales.reduce((sum, s) => sum + Number(s.balance), 0)
    const paid = custPayments.reduce((sum, p) => sum + p.amount, 0)
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      totalBalance: Math.max(0, owed - paid),
      transactions: custSales.map(s => s.id),
      payments: custPayments,
    }
  })

  const productsOut = (products || []).map(p =>
    p.type === 'flexible'
      ? { id: p.id, type: 'flexible', name: p.name, invested: Number(p.invested) }
      : {
          id: p.id,
          type: 'fixed',
          name: p.name,
          cost: Number(p.cost),
          price: Number(p.price),
          qty: p.qty,
          low: p.low,
          ...(p.barcode ? { barcode: p.barcode } : {}),
        }
  )

  const expensesOut = (expenses || []).map(e => ({
    id: e.id, time: e.time, category: e.category, amount: Number(e.amount), note: e.note,
  }))

  const withdrawalsOut = (withdrawals || []).map(w => ({
    id: w.id, time: w.time, amount: Number(w.amount), note: w.note,
  }))

  return {
    profile_id: shop.id,
    updated_at: shop.updated_at,
    state: {
      shop: {
        name: shop.name,
        owner: shop.owner,
        phone: shop.phone,
        currency: shop.currency,
        businessType: shop.business_type || '',
      },
      products: productsOut,
      transactions,
      customers: customersOut,
      expenses: expensesOut,
      withdrawals: withdrawalsOut,
    },
  }
}

export const isSupabaseEnabled = !!supabase

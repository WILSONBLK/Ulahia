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
  // Don't sync ephemeral fields
  const { cart: _c, view: _v, ...toSave } = state
  const { error } = await supabase.from('shop_data').upsert({
    profile_id: profileId,
    recovery_code: recoveryCode,
    state: toSave,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'profile_id' })
  return { ok: !error, error }
}

export async function pullByCode(code) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('shop_data')
    .select('profile_id, state, updated_at')
    .eq('recovery_code', code.toUpperCase().trim())
    .single()
  if (error || !data) return null
  return data
}

export const isSupabaseEnabled = !!supabase

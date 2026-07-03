// Single source of truth for "has this user ever seen/skipped the guided tour" —
// shared by store.jsx (demo entry) and Onboarding.jsx (tour itself) so the tour
// never re-triggers in one place after being dismissed in the other.
export const TOUR_SEEN_KEY = 'ulahia-ob-done'

// FNV-1a — deterministic, synchronous, good enough for local-only PIN storage
export function hashPin(pin) {
  let h = 0x811c9dc5
  for (const c of String(pin)) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 0x01000193)
    h >>>= 0
  }
  return h.toString(16).padStart(8, '0')
}

export function money(value) {
  return 'NGN ' + Number(value || 0).toLocaleString('en-NG')
}

export function filterByPeriod(records, period, dateField = 'time') {
  const now = new Date()
  if (period === 'today') {
    const today = now.toDateString()
    return records.filter(r => new Date(r[dateField]).toDateString() === today)
  }
  if (period === 'week') {
    const cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000)
    return records.filter(r => new Date(r[dateField]) >= cutoff)
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    return records.filter(r => new Date(r[dateField]) >= start)
  }
  return records
}

export function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.88
  window.speechSynthesis.speak(u)
}

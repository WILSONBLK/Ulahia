// ── Device permissions (web) ─────────────────────────────────────────────────
// The Permissions onboarding screen maps to real browser capabilities. Where a
// native permission exists on the web platform we request it for real; where it
// doesn't (Storage persistence, Sync), we do the closest meaningful thing.
//
// State vocabulary (mirrors the Permissions API): 'granted' | 'denied' |
// 'prompt' (not yet decided) | 'unsupported' (platform can't offer it).

const UNSUPPORTED = 'unsupported'

// ── Notifications ──
export async function queryNotifications() {
  if (!('Notification' in window)) return UNSUPPORTED
  const p = Notification.permission
  return p === 'default' ? 'prompt' : p // 'granted' | 'denied'
}

export async function requestNotifications() {
  if (!('Notification' in window)) return UNSUPPORTED
  try {
    const result = await Notification.requestPermission()
    return result === 'default' ? 'prompt' : result
  } catch {
    return Notification.permission === 'granted' ? 'granted' : 'denied'
  }
}

// ── Camera (barcode scanning + product photos) ──
export async function queryCamera() {
  if (!navigator.mediaDevices?.getUserMedia) return UNSUPPORTED
  if (!navigator.permissions?.query) return 'prompt'
  try {
    const status = await navigator.permissions.query({ name: 'camera' })
    return status.state // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'prompt' // Firefox/Safari don't expose 'camera' to Permissions API
  }
}

export async function requestCamera() {
  if (!navigator.mediaDevices?.getUserMedia) return UNSUPPORTED
  try {
    // Acquire then immediately release — the goal is only to trigger the grant
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    stream.getTracks().forEach(t => t.stop())
    return 'granted'
  } catch (err) {
    // NotAllowedError = user denied; most others = no device / blocked
    return err?.name === 'NotAllowedError' ? 'denied' : 'unsupported'
  }
}

// ── Storage (persist local data so the browser won't evict offline records) ──
export async function queryStorage() {
  if (!navigator.storage?.persisted) return UNSUPPORTED
  try {
    return (await navigator.storage.persisted()) ? 'granted' : 'prompt'
  } catch {
    return 'prompt'
  }
}

export async function requestStorage() {
  if (!navigator.storage?.persist) return UNSUPPORTED
  try {
    const granted = await navigator.storage.persist()
    return granted ? 'granted' : 'denied'
  } catch {
    return 'denied'
  }
}

// ── Sync (app-level cloud backup preference, not a device permission) ──
// Enabled by turning on cloud backup; there is no OS prompt.
export async function querySync() {
  return 'prompt'
}

export async function requestSync() {
  // The caller flips this to 'on'; actual push happens via the existing sync layer.
  return 'on'
}

export const PERMISSION_API = {
  storage:       { query: queryStorage,       request: requestStorage },
  camera:        { query: queryCamera,        request: requestCamera },
  notifications: { query: queryNotifications, request: requestNotifications },
  sync:          { query: querySync,          request: requestSync },
}

// Whether a state means "the user must change it in browser/site settings"
export function isBlocked(state) {
  return state === 'denied'
}

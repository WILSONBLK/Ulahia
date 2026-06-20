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

export function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.88
  window.speechSynthesis.speak(u)
}

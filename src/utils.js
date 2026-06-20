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

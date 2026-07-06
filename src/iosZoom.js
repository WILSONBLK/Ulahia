// iOS Safari zooms in when a small input is focused (helpful — you can see what
// you type) but never zooms back out on its own. This momentarily clamps the
// viewport to scale 1 when you leave a field, snapping the page back, then
// restores pinch-zoom. The focus zoom-in is left untouched.
export function setupIOSZoomReset() {
  const isIOS =
    /iP(hone|ad|od)/.test(navigator.platform || '') ||
    (/Mac/.test(navigator.userAgent) && 'ontouchend' in document) // iPadOS reports as Mac
  if (!isIOS) return

  const vp = document.querySelector('meta[name="viewport"]')
  if (!vp) return

  const BASE = 'width=device-width, initial-scale=1'
  let restoreTimer = null

  function snapBack() {
    // Clamp to 1 → Safari resets the current zoom, then release so the user
    // can still pinch-zoom and the next field can zoom in again.
    vp.setAttribute('content', `${BASE}, maximum-scale=1`)
    clearTimeout(restoreTimer)
    restoreTimer = setTimeout(() => vp.setAttribute('content', BASE), 350)
  }

  document.addEventListener('focusout', e => {
    const el = e.target
    if (!el) return
    const tag = el.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      // Only reset once focus has actually left all fields, not when moving
      // between two inputs (which would fight the next field's zoom-in).
      setTimeout(() => {
        const active = document.activeElement
        const activeTag = active?.tagName
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA' && activeTag !== 'SELECT') {
          snapBack()
        }
      }, 0)
    }
  })

  // Pressing Enter / Go / Done on a single-line field: blur it so the keyboard
  // closes and the snap-back kicks in.
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return
    const el = document.activeElement
    if (el?.tagName === 'INPUT' && el.type !== 'submit' && el.type !== 'button') {
      // Let form submit handlers run first, then blur.
      setTimeout(() => el.blur(), 0)
    }
  })
}

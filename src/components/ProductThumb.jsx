// Product thumbnail — shows the uploaded photo, or a colored tile with the
// product's initial as a graceful fallback. Color is derived from the name so
// it stays stable per product.
const TONES = ['teal', 'orange', 'green', 'purple', 'blue', 'pink']

function toneFor(name = '') {
  let h = 0
  for (const c of name) h = (h + c.charCodeAt(0)) % TONES.length
  return TONES[h]
}

export default function ProductThumb({ product, size = 44 }) {
  const style = { width: size, height: size }
  if (product?.image) {
    return <img className="prod-thumb" style={style} src={product.image} alt="" loading="lazy" />
  }
  const initial = (product?.name || '?').trim().charAt(0).toUpperCase()
  return (
    <span className={`prod-thumb prod-thumb--ph prod-thumb--${toneFor(product?.name)}`} style={style} aria-hidden="true">
      {initial}
    </span>
  )
}

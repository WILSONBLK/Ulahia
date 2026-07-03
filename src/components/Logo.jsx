// Ulahia brand logo — approved identity.
// Market stall: teal roof over colorful shelf blocks (inventory, organization, growth).
// Variants: mark (icon only), boxed (app-icon style), mono (single color for dark surfaces).

const TEAL = '#0F6B63'
const TEAL_LIGHT = '#2FA398'
const TERRACOTTA = '#C24E2A'
const LIME = '#7BC943'

function StallMark({ size, mono }) {
  const c = mono
    ? { roof: 'currentColor', a: 'currentColor', b: 'currentColor', c: 'currentColor', d: 'currentColor' }
    : { roof: TEAL, a: TEAL_LIGHT, b: TERRACOTTA, c: LIME, d: TEAL }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Roof */}
      <path d="M7 25 L32 9 L57 25" stroke={c.roof} strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Shelf blocks — row 1 */}
      <rect x="14" y="32" width="10" height="9" rx="2.5" fill={c.a} />
      <rect x="27" y="32" width="10" height="9" rx="2.5" fill={c.b} />
      <rect x="40" y="32" width="10" height="9" rx="2.5" fill={c.c} />
      {/* Shelf blocks — row 2 (taller: growth) */}
      <rect x="14" y="44" width="10" height="13" rx="2.5" fill={c.c} />
      <rect x="27" y="44" width="10" height="13" rx="2.5" fill={c.d} />
      <rect x="40" y="44" width="10" height="13" rx="2.5" fill={c.b} />
    </svg>
  )
}

// Leaf accent used over the "i" in the wordmark
function Leaf({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13.5 2.5 C8 2.5 4.5 6 4.5 11.5 Q4.5 13 5.5 13.5 C11 13.5 13.5 9 13.5 2.5 Z" fill={LIME} />
      <path d="M5.5 13.5 Q8.5 8.5 12.5 4.5" stroke="#4E8A2A" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// App-icon style: rounded teal square, light roof, colored blocks
export function LogoBoxed({ size = 42 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill={TEAL} />
      <path d="M13 27 L32 14 L51 27" stroke="#E9F4F2" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="18" y="32" width="8" height="8" rx="2" fill={LIME} />
      <rect x="28" y="32" width="8" height="8" rx="2" fill={TERRACOTTA} />
      <rect x="38" y="32" width="8" height="8" rx="2" fill="#E9F4F2" />
      <rect x="18" y="42" width="8" height="10" rx="2" fill="#E9F4F2" />
      <rect x="28" y="42" width="8" height="10" rx="2" fill={LIME} />
      <rect x="38" y="42" width="8" height="10" rx="2" fill={TERRACOTTA} />
    </svg>
  )
}

// Horizontal / stacked lockup: mark + "Ulahia" wordmark (+ leaf) + tagline
export function LogoLockup({ size = 40, stacked = false, tagline = true, mono = false }) {
  return (
    <span className={`logo-lockup${stacked ? ' logo-lockup--stacked' : ''}${mono ? ' logo-lockup--mono' : ''}`}>
      <StallMark size={size} mono={mono} />
      <span className="logo-lockup-text">
        <span className="logo-word" style={{ fontSize: size * 0.62 }}>
          Ulah<span className="logo-word-i">i<span className="logo-leaf"><Leaf size={Math.max(9, size * 0.26)} /></span></span>a
        </span>
        {tagline && <span className="logo-tagline" style={{ fontSize: Math.max(10, size * 0.24) }}>Simple Shop Book</span>}
      </span>
    </span>
  )
}

export default function Logo({ size = 42, mono = false }) {
  return <StallMark size={size} mono={mono} />
}

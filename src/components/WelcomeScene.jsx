// Decorative background scene for the Welcome screen (approved mockup):
// soft hills, faint city skyline, clouds, and a market storefront with
// a teal awning. Purely decorative — hidden from assistive tech.
export default function WelcomeScene() {
  return (
    <svg
      className="la-scene"
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMax slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Clouds */}
      <g fill="#EDEBE3" opacity="0.9">
        <ellipse cx="112" cy="38" rx="26" ry="9" />
        <ellipse cx="130" cy="32" rx="18" ry="8" />
        <ellipse cx="318" cy="22" rx="22" ry="8" />
        <ellipse cx="334" cy="17" rx="14" ry="6" />
      </g>

      {/* City skyline silhouette */}
      <g fill="#DCE4DC" opacity="0.55">
        <rect x="216" y="78" width="18" height="70" />
        <rect x="238" y="60" width="22" height="88" />
        <rect x="264" y="88" width="14" height="60" />
        <rect x="282" y="70" width="20" height="78" />
        <rect x="306" y="95" width="16" height="53" />
        <rect x="243" y="52" width="6" height="10" />
      </g>

      {/* Rolling hills */}
      <path d="M0 122 Q60 88 130 112 T280 118 T400 106 V240 H0 Z" fill="#DEEBD6" />
      <path d="M0 156 Q90 120 190 146 T400 138 V240 H0 Z" fill="#CBE0C4" />

      {/* Foreground sand — sits under the action buttons */}
      <path d="M0 196 Q120 174 240 192 T400 188 V240 H0 Z" fill="#F1EADA" />

      {/* Plants left */}
      <g stroke="#9DBE8F" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" transform="translate(72, 0)">
        <path d="M28 194 Q26 176 14 168" />
        <path d="M28 194 Q30 174 42 164" />
        <path d="M28 194 Q28 178 28 166" />
      </g>

      {/* ── Storefront — anchored right-of-center, rising behind the
           action buttons like the approved mockup ── */}
      <g transform="translate(-16, -40)">
        {/* Boxes beside the shop */}
        <g>
          <rect x="222" y="176" width="26" height="22" rx="2" fill="#C89B6A" />
          <rect x="222" y="176" width="26" height="6" rx="2" fill="#B18052" />
          <rect x="230" y="158" width="21" height="19" rx="2" fill="#D8B084" />
          <rect x="230" y="158" width="21" height="5" rx="2" fill="#C89B6A" />
        </g>

        {/* Shop body */}
        <rect x="256" y="128" width="96" height="76" rx="4" fill="#EFE3CE" />
        {/* Brick base */}
        <rect x="256" y="188" width="96" height="16" fill="#E3CFAE" />
        <g fill="#D8BF98">
          <rect x="262" y="191" width="12" height="4" rx="1" />
          <rect x="280" y="196" width="12" height="4" rx="1" />
          <rect x="300" y="191" width="12" height="4" rx="1" />
          <rect x="322" y="196" width="12" height="4" rx="1" />
          <rect x="336" y="191" width="10" height="4" rx="1" />
        </g>

        {/* Door */}
        <rect x="270" y="152" width="26" height="52" rx="3" fill="#0F6B63" />
        <rect x="274" y="158" width="18" height="16" rx="2" fill="#2FA398" opacity="0.65" />
        <circle cx="291" cy="182" r="1.8" fill="#E9F4F2" />

        {/* Window */}
        <rect x="308" y="154" width="32" height="26" rx="3" fill="#DFF0ED" stroke="#0F6B63" strokeWidth="2" />
        <path d="M324 154v26M308 167h32" stroke="#0F6B63" strokeWidth="1.6" />

        {/* Awning */}
        <path d="M250 128 Q304 112 358 128 L354 142 Q351 148 345 148 L263 148 Q257 148 254 142 Z" fill="#0F6B63" />
        <g fill="#E9F4F2">
          <path d="M263 148 Q268 158 273 148 Z" opacity="0.95" />
          <path d="M283 148 Q288 158 293 148 Z" opacity="0.95" />
          <path d="M303 148 Q308 158 313 148 Z" opacity="0.95" />
          <path d="M323 148 Q328 158 333 148 Z" opacity="0.95" />
          <path d="M343 148 Q346 156 350 147 Z" opacity="0.95" />
        </g>
        <g fill="#E9F4F2" opacity="0.9">
          <path d="M273 148 Q278 158 283 148 Z" fill="#2FA398" />
          <path d="M293 148 Q298 158 303 148 Z" fill="#2FA398" />
          <path d="M313 148 Q318 158 323 148 Z" fill="#2FA398" />
          <path d="M333 148 Q338 158 343 148 Z" fill="#2FA398" />
        </g>

        {/* Potted plant by the door */}
        <g>
          <path d="M368 204 l-2.5-16 h13 l-2.5 16 Z" fill="#C0592F" />
          <g stroke="#4E8A2A" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M372 188 Q368 174 358 170" />
            <path d="M372 188 Q374 172 384 166" />
            <path d="M372 188 Q372 176 371 168" />
          </g>
          <g fill="#7BC943">
            <ellipse cx="357" cy="169" rx="4.5" ry="3" transform="rotate(-28 357 169)" />
            <ellipse cx="385" cy="165" rx="4.5" ry="3" transform="rotate(24 385 165)" />
            <ellipse cx="371" cy="166" rx="4" ry="3" />
          </g>
        </g>
      </g>
    </svg>
  )
}

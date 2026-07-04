import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import { LogoLockup } from './Logo.jsx'
import { CURRENCIES, currencyForCountry } from '../currency.js'
import { PERMISSION_API } from '../permissions.js'
import {
  IconDrive, IconCamera, IconBell, IconCloud, IconLock,
  IconChevron, IconChevronDown, IconCheck, IconStore, IconTag, IconCoin,
  IconCart, IconUsers, IconReports,
} from './icons.jsx'

// ─────────────────────────────────────────────────────────────────────────────
// Permissions — requests real browser capabilities where they exist.
// Storage → persistent storage · Camera → getUserMedia · Notifications →
// Notification API · Sync → app-level cloud backup toggle. All optional: none
// block onboarding, matching an offline-first app that degrades gracefully.
// ─────────────────────────────────────────────────────────────────────────────
const PERMISSION_ROWS = [
  { key: 'storage',       Icon: IconDrive,  titleKey: 'permStorageTitle', descKey: 'permStorageDesc' },
  { key: 'camera',        Icon: IconCamera, titleKey: 'permCameraTitle',  descKey: 'permCameraDesc' },
  { key: 'notifications', Icon: IconBell,   titleKey: 'permNotifTitle',   descKey: 'permNotifDesc' },
  { key: 'sync',          Icon: IconCloud,  titleKey: 'permSyncTitle',    descKey: 'permSyncDesc', optional: true },
]

export function PermissionsScreen({ onContinue, onSkip, stepIndex, stepTotal }) {
  const { state, dispatch } = useStore()
  const t = useLang()
  const [states, setStates] = useState(state.permissions)
  const [busy, setBusy] = useState(null)

  // Query real permission states on mount so the UI reflects reality
  useEffect(() => {
    let alive = true
    ;(async () => {
      const next = { ...states }
      for (const { key } of PERMISSION_ROWS) {
        try { next[key] = await PERMISSION_API[key].query() } catch { /* keep */ }
      }
      if (alive) {
        setStates(next)
        Object.entries(next).forEach(([key, value]) =>
          dispatch({ type: 'SET_PERMISSION', payload: { key, value } })
        )
      }
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleRow(key) {
    const current = states[key]
    if (busy || current === 'unsupported') return
    // Sync is a toggle; others can't be re-prompted once the browser blocks them
    if (key !== 'sync' && (current === 'granted')) return
    if (key !== 'sync' && current === 'denied') return // guidance shown inline

    setBusy(key)
    try {
      let value
      if (key === 'sync') {
        value = states.sync === 'on' ? 'off' : await PERMISSION_API.sync.request()
      } else {
        value = await PERMISSION_API[key].request()
      }
      setStates(s => ({ ...s, [key]: value }))
      dispatch({ type: 'SET_PERMISSION', payload: { key, value } })
    } finally {
      setBusy(null)
    }
  }

  function statusFor(key) {
    const s = states[key]
    if (busy === key) return { label: '…', tone: 'pending', node: <span className="perm-spin" /> }
    if (s === 'granted') return { label: t('permAllowed'), tone: 'ok', node: <IconCheck size={18} /> }
    if (s === 'on') return { label: t('permOn'), tone: 'ok', node: <IconCheck size={18} /> }
    if (s === 'denied') return { label: t('permBlocked'), tone: 'bad', node: <IconChevron size={16} /> }
    if (s === 'unsupported') return { label: t('permUnsupported'), tone: 'muted', node: null }
    return { label: '', tone: 'prompt', node: <IconChevron size={16} /> }
  }

  return (
    <div className="la-login-page">
      <div className="la-login-top">
        <button className="la-back-btn" onClick={onSkip} aria-label={t('permSkip')}>←</button>
        <button className="la-text-link" onClick={onSkip}>{t('permSkip')}</button>
      </div>

      <div className="la-login-body">
        <div className="la-login-brand"><LogoLockup size={44} /></div>
        <h2 className="la-login-title">{t('obPermTitle')}</h2>
        <p className="la-login-sub">{t('obPermSub')}</p>

        <div className="perm-list">
          {PERMISSION_ROWS.map(({ key, Icon, titleKey, descKey }) => {
            const st = statusFor(key)
            const blocked = states[key] === 'denied'
            return (
              <button
                key={key}
                className={`perm-row perm-row--${st.tone}`}
                onClick={() => handleRow(key)}
                disabled={states[key] === 'unsupported'}
                aria-label={t(titleKey)}
              >
                <span className="perm-row-icon"><Icon size={22} /></span>
                <span className="perm-row-text">
                  <strong>{t(titleKey)}</strong>
                  <span>{blocked ? t('permBlockedHint') : t(descKey)}</span>
                </span>
                <span className={`perm-row-status perm-row-status--${st.tone}`}>
                  {st.label && <span className="perm-row-status-label">{st.label}</span>}
                  {st.node}
                </span>
              </button>
            )
          })}
        </div>

        <div className="perm-privacy">
          <span className="perm-privacy-icon"><IconLock size={22} /></span>
          <span>
            <strong>{t('permPrivacyTitle')}</strong><br />
            {t('permPrivacyDesc')}
          </span>
        </div>

        <SetupDots step={stepIndex} total={stepTotal} />
        <button className="button la-primary-btn" onClick={onContinue}>
          {t('permContinueBtn')} →
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Shop — shop name (counter), business type, currency. Prefills shop
// name from signup and defaults currency from the chosen country.
// ─────────────────────────────────────────────────────────────────────────────
const BUSINESS_TYPES = [
  'grocery', 'supermarket', 'pharmacy', 'restaurant', 'fashion',
  'electronics', 'beauty', 'hardware', 'bar', 'other',
]
const BIZ_KEY = { grocery: 'bizGrocery', supermarket: 'bizSupermarket', pharmacy: 'bizPharmacy',
  restaurant: 'bizRestaurant', fashion: 'bizFashion', electronics: 'bizElectronics',
  beauty: 'bizBeauty', hardware: 'bizHardware', bar: 'bizBar', other: 'bizOther' }

const NAME_MAX = 50

export function CreateShopScreen({ initialName = '', countryCode = 'NG', onContinue, onSkip, stepIndex, stepTotal }) {
  const t = useLang()
  const [name, setName] = useState(initialName)
  const [businessType, setBusinessType] = useState('')
  const [currency, setCurrency] = useState(currencyForCountry(countryCode))
  const [error, setError] = useState('')
  const nameRef = useRef(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  function submit(skip) {
    if (skip) { onContinue({ name: initialName || name, businessType, currency }); return }
    if (!name.trim()) { setError(t('csShopNameRequiredErr')); nameRef.current?.focus(); return }
    onContinue({ name: name.trim(), businessType, currency })
  }

  return (
    <div className="la-login-page">
      <div className="la-login-top">
        <button className="la-back-btn" onClick={onSkip} aria-label={t('csSkip')}>←</button>
        <button className="la-text-link" onClick={() => submit(true)}>{t('csSkip')}</button>
      </div>

      <div className="la-login-body">
        <div className="la-login-brand"><LogoLockup size={44} /></div>
        <h2 className="la-login-title">{t('csTitle')}</h2>
        <p className="la-login-sub">{t('csSub')}</p>

        <div className="cs-illustration" aria-hidden="true"><ShopIllustration /></div>

        <div className="la-auth-form">
          <label className="label">
            <span className="cs-label-row">
              {t('csShopNameLabel')}
              <span className="cs-counter">{name.length}/{NAME_MAX}</span>
            </span>
            <span className="la-input-group">
              <span className="la-input-icon"><IconStore size={19} /></span>
              <input
                ref={nameRef}
                className="la-input"
                placeholder={t('csShopNamePlaceholder')}
                value={name}
                maxLength={NAME_MAX}
                onChange={e => { setName(e.target.value); setError('') }}
              />
            </span>
          </label>

          <label className="label">
            {t('csBusinessTypeLabel')}
            <span className="la-input-group la-select-group">
              <span className="la-input-icon"><IconTag size={19} /></span>
              <select
                className={`la-input la-select-input${businessType ? '' : ' is-placeholder'}`}
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
              >
                <option value="" disabled>{t('csBusinessTypePlaceholder')}</option>
                {BUSINESS_TYPES.map(bt => (
                  <option key={bt} value={bt}>{t(BIZ_KEY[bt])}</option>
                ))}
              </select>
              <span className="la-select-caret"><IconChevronDown size={18} /></span>
            </span>
          </label>

          <label className="label">
            {t('csCurrencyLabel')}
            <span className="la-input-group la-select-group">
              <span className="la-input-icon"><IconCoin size={19} /></span>
              <select
                className="la-input la-select-input"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} · {c.name} ({c.code})</option>
                ))}
              </select>
              <span className="la-select-caret"><IconChevronDown size={18} /></span>
            </span>
          </label>

          {error && <p className="la-error">{error}</p>}

          <SetupDots step={stepIndex} total={stepTotal} />
          <button className="button la-primary-btn" onClick={() => submit(false)}>
            {t('csContinueBtn')} →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// You're all set — celebratory confirmation with "what's next" checklist.
// ─────────────────────────────────────────────────────────────────────────────
const NEXT_STEPS = [
  { Icon: IconCart,    titleKey: 'asAddProductsTitle',  descKey: 'asAddProductsDesc' },
  { Icon: IconUsers,   titleKey: 'asAddCustomersTitle', descKey: 'asAddCustomersDesc' },
  { Icon: IconReports, titleKey: 'asFirstSaleTitle',    descKey: 'asFirstSaleDesc' },
]

export function AllSetScreen({ onDashboard }) {
  const t = useLang()
  return (
    <div className="la-login-page la-allset-page">
      <div className="la-login-body la-allset-body">
        <div className="la-login-brand"><LogoLockup size={40} /></div>

        <div className="as-check-wrap">
          <span className="as-confetti" aria-hidden="true">
            {['a','b','c','d','e','f','g','h'].map((k, i) => <i key={k} className={`as-dot as-dot-${i}`} />)}
          </span>
          <span className="as-check"><IconCheck size={40} /></span>
        </div>

        <h2 className="la-login-title as-title">{t('asTitle')} 🎉</h2>
        <p className="la-login-sub">{t('asSub')}</p>

        <div className="as-next-card">
          <strong className="as-next-title">{t('asWhatsNext')}</strong>
          {NEXT_STEPS.map(({ Icon, titleKey, descKey }) => (
            <div className="as-next-row" key={titleKey}>
              <span className="as-next-icon"><Icon size={20} /></span>
              <span className="as-next-text">
                <strong>{t(titleKey)}</strong>
                <span>{t(descKey)}</span>
              </span>
            </div>
          ))}
        </div>

        <button className="button la-primary-btn" onClick={onDashboard}>
          {t('asGoDashboardBtn')} →
        </button>
      </div>
    </div>
  )
}

// ── Shared: progress dots ──
function SetupDots({ step, total }) {
  if (!total) return null
  return (
    <div className="setup-dots" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`setup-dot${i === step ? ' setup-dot--active' : ''}`} />
      ))}
    </div>
  )
}

// ── Small storefront illustration for the Create Shop screen ──
function ShopIllustration() {
  return (
    <svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg" width="180" height="118">
      <ellipse cx="100" cy="118" rx="78" ry="10" fill="#EDEBE3" />
      <circle cx="100" cy="60" r="52" fill="#EEF4EC" />
      {/* boxes */}
      <rect x="128" y="86" width="26" height="22" rx="2" fill="#C89B6A" />
      <rect x="128" y="86" width="26" height="6" rx="2" fill="#B18052" />
      <rect x="136" y="70" width="20" height="18" rx="2" fill="#D8B084" />
      {/* plant */}
      <path d="M52 108 l-2-14 h11 l-2 14Z" fill="#C0592F" />
      <g stroke="#4E8A2A" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M55.5 94 Q52 82 43 79" />
        <path d="M55.5 94 Q58 80 67 76" />
        <path d="M55.5 94 Q55.5 84 55 77" />
      </g>
      <g fill="#7BC943">
        <ellipse cx="42" cy="78" rx="4.5" ry="3" transform="rotate(-28 42 78)" />
        <ellipse cx="68" cy="75" rx="4.5" ry="3" transform="rotate(24 68 75)" />
      </g>
      {/* shop body */}
      <rect x="66" y="52" width="74" height="56" rx="4" fill="#EFE3CE" />
      <rect x="66" y="96" width="74" height="12" fill="#E3CFAE" />
      {/* door */}
      <rect x="80" y="66" width="22" height="42" rx="3" fill="#0F6B63" />
      <rect x="84" y="71" width="14" height="13" rx="2" fill="#2FA398" opacity="0.6" />
      {/* window */}
      <rect x="110" y="68" width="24" height="20" rx="3" fill="#DFF0ED" stroke="#0F6B63" strokeWidth="2" />
      <path d="M122 68v20M110 78h24" stroke="#0F6B63" strokeWidth="1.5" />
      {/* awning */}
      <path d="M60 52 Q100 38 146 52 L142 64 Q139 69 133 69 L73 69 Q67 69 64 64Z" fill="#0F6B63" />
      <g fill="#E9F4F2">
        <path d="M73 69 Q78 78 83 69Z" /><path d="M93 69 Q98 78 103 69Z" />
        <path d="M113 69 Q118 78 123 69Z" /><path d="M133 69 Q136 77 140 68Z" />
      </g>
      <g fill="#2FA398">
        <path d="M83 69 Q88 78 93 69Z" /><path d="M103 69 Q108 78 113 69Z" />
        <path d="M123 69 Q128 78 133 69Z" />
      </g>
    </svg>
  )
}

import { useState } from 'react'
import { useStore } from '../store.jsx'
import { getCloudMeta } from '../sync.js'
import { hashPin } from '../utils.js'
import { useLang } from '../useLang.js'
import { LogoLockup } from './Logo.jsx'
import { IconLock, IconEye, IconEyeOff, IconShield } from './icons.jsx'

// Shown on app open when the owner has set a password (device credential).
// Unlocks with the password, or with the recovery code as fallback.
export default function LockScreen({ onUnlock }) {
  const { state } = useStore()
  const t = useLang()
  const [mode, setMode] = useState('password') // 'password' | 'code'
  const [value, setValue] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  const isCode = mode === 'code'

  function submit(e) {
    e?.preventDefault()
    if (isCode) {
      const meta = getCloudMeta()
      if (meta?.recoveryCode && value.trim().toUpperCase() === meta.recoveryCode) { onUnlock(); return }
      setError(t('laNoAccountFoundErr'))
    } else {
      if (hashPin(value) === state.auth?.passwordHash) { onUnlock(); return }
      setError(t('laUnlockWrongErr'))
    }
    setValue('')
  }

  return (
    <div className="la-login-page la-lock-screen">
      <div className="la-login-body">
        <div className="la-login-brand">
          <LogoLockup size={56} stacked />
        </div>

        <h2 className="la-login-title">{t('laUnlockTitle')} 👋</h2>
        <p className="la-login-sub">
          {state.shop.name ? `${state.shop.name} · ` : ''}{t('laUnlockSub')}
        </p>

        <form className="la-auth-form" onSubmit={submit}>
          <label className="label">
            {isCode ? t('laRecoveryCodeLabel') : t('laPasswordLabel')}
            <span className="la-input-group">
              <span className="la-input-icon"><IconLock size={19} /></span>
              <input
                className={`la-input${isCode ? ' la-code-input' : ''}`}
                type={show ? 'text' : 'password'}
                placeholder={isCode ? t('laRecoveryCodePlaceholder') : t('laPasswordLabel')}
                value={value}
                maxLength={isCode ? 6 : undefined}
                autoComplete="off"
                autoFocus
                onChange={e => { setValue(isCode ? e.target.value.toUpperCase() : e.target.value); setError('') }}
              />
              <button
                type="button"
                className="la-input-btn"
                aria-label={show ? 'Hide' : 'Show'}
                onClick={() => setShow(s => !s)}
              >
                {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </span>
          </label>

          {error && <p className="la-error">{error}</p>}

          <button className="button la-primary-btn" type="submit">
            {t('laUnlockBtn')}
          </button>

          <button
            type="button"
            className="la-ghost-btn"
            onClick={() => { setMode(isCode ? 'password' : 'code'); setValue(''); setError('') }}
          >
            <IconShield size={18} /> {isCode ? t('laUnlockUsePassword') : t('laUnlockUseCode')}
          </button>
        </form>
      </div>
    </div>
  )
}

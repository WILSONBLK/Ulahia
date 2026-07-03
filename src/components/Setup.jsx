import { useState } from 'react'
import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'
import Logo from './Logo.jsx'
import { getOrCreateCloudMeta, setCloudMeta, pullByCode, isSupabaseEnabled } from '../sync.js'

export default function Setup() {
  const { state, dispatch } = useStore()
  const t = useLang()
  const [step, setStep] = useState('form') // 'form' | 'code' | 'restore'
  const [pending, setPending] = useState(null)
  const [recoveryCode, setRecoveryCode] = useState('')
  const [restoreCode, setRestoreCode] = useState('')
  const [restoreError, setRestoreError] = useState('')
  const [restoreLoading, setRestoreLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const shop = {
      name: data.get('shop').trim(),
      owner: data.get('owner').trim(),
      phone: data.get('phone').trim(),
    }
    const meta = getOrCreateCloudMeta()
    setRecoveryCode(meta.recoveryCode)
    setPending(shop)
    setStep('code')
  }

  function confirm() {
    dispatch({ type: 'COMPLETE_SETUP', payload: pending })
  }

  async function handleRestore() {
    if (restoreCode.trim().length !== 6) {
      setRestoreError(t('enterSixCharCode'))
      return
    }
    setRestoreLoading(true)
    setRestoreError('')
    const result = await pullByCode(restoreCode)
    setRestoreLoading(false)
    if (!result) {
      setRestoreError(t('codeNotFound'))
      return
    }
    setCloudMeta({ profileId: result.profile_id, recoveryCode: restoreCode.toUpperCase().trim() })
    dispatch({ type: 'IMPORT_STATE', payload: { ...result.state, setupDone: true } })
  }

  // ── Show recovery code before entering app ───────────────────────────────
  if (step === 'code') {
    return (
      <div className="setup-page">
        <div className="setup-card">
          <div className="setup-logo">
            <Logo size={52} />
            <div><strong>Ulahia</strong><span>{t('tagline')}</span></div>
          </div>

          <h1 className="setup-title" style={{ marginBottom: 8 }}>{t('yourBackupCodeTitle')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', margin: '0 0 20px', lineHeight: 1.55 }}>
            {isSupabaseEnabled ? t('cloudSyncDesc') : t('writeDownSafeDesc')}
          </p>

          <div style={{
            background: 'var(--bg)',
            border: '2px dashed var(--green)',
            borderRadius: 12,
            padding: '16px 24px',
            textAlign: 'center',
            letterSpacing: '0.3em',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--green)',
            margin: '0 0 8px',
          }}>
            {recoveryCode}
          </div>
          <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem', margin: '0 0 24px' }}>
            {t('findCodeSettingsHint')}
          </p>

          <button className="button setup-submit" onClick={confirm}>
            {t('gotItStartSelling')}
          </button>
        </div>
      </div>
    )
  }

  // ── Restore from backup code ─────────────────────────────────────────────
  if (step === 'restore') {
    return (
      <div className="setup-page">
        <div className="setup-card">
          <div className="setup-logo">
            <Logo size={52} />
            <div><strong>Ulahia</strong><span>{t('tagline')}</span></div>
          </div>

          <h1 className="setup-title" style={{ marginBottom: 8 }}>{t('restoreYourDataTitle')}</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', margin: '0 0 20px', lineHeight: 1.55 }}>
            {t('restoreDataDesc')}
          </p>

          <label className="label" style={{ marginBottom: 16 }}>
            {t('backupCodeLabel')}
            <input
              className="field"
              placeholder={t('backupCodePlaceholder')}
              value={restoreCode}
              onChange={e => { setRestoreCode(e.target.value.toUpperCase()); setRestoreError('') }}
              maxLength={6}
              autoFocus
              style={{ letterSpacing: '0.2em', fontSize: '1.2rem', textTransform: 'uppercase' }}
            />
          </label>

          {restoreError && (
            <p style={{ color: 'var(--red)', fontSize: '0.88rem', margin: '0 0 12px', fontWeight: 700 }}>
              {restoreError}
            </p>
          )}

          <button className="button setup-submit" onClick={handleRestore} disabled={restoreLoading}>
            {restoreLoading ? t('restoringBtn') : t('restoreMyDataBtn')}
          </button>

          <button
            className="button light"
            style={{ marginTop: 12, width: '100%' }}
            onClick={() => { setStep('form'); setRestoreError(''); setRestoreCode('') }}
          >
            {t('backToSetupBtn')}
          </button>
        </div>
      </div>
    )
  }

  // ── Initial setup form ───────────────────────────────────────────────────
  return (
    <div className="setup-page">
      <div className="setup-lang">
        <select
          className="select"
          aria-label="Language"
          value={state.language}
          style={{ minHeight: 40, fontSize: '0.9rem' }}
          onChange={e => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
        >
          <option value="pidgin">Pidgin</option>
          <option value="en">English</option>
          <option value="yo">Yoruba</option>
          <option value="ig">Igbo</option>
          <option value="ha">Hausa</option>
        </select>
      </div>

      <div className="setup-card">
        <div className="setup-logo">
          <Logo size={52} />
          <div>
            <strong>Ulahia</strong>
            <span>{t('tagline')}</span>
          </div>
        </div>

        <h1 className="setup-title">{t('setupShopTitle')}</h1>
        <p className="setup-sub">{t('setupShopSub')}</p>

        <form onSubmit={handleSubmit} className="setup-form">
          <label className="label">
            {t('setupShopNameLabel')}
            <input className="field" name="shop" placeholder={t('shopNamePlaceholderSetup')} autoFocus required />
          </label>
          <label className="label">
            {t('setupYourNameLabel')}
            <input className="field" name="owner" placeholder={t('ownerPlaceholderSetup')} required />
          </label>
          <label className="label">
            {t('phoneShortLabel')} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>({t('optional')})</span>
            <input className="field" name="phone" placeholder={t('phonePlaceholder')} />
          </label>
          <button className="button setup-submit" type="submit">
            {t('startSellingBtn')}
          </button>
        </form>

        {isSupabaseEnabled && (
          <button
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.88rem', cursor: 'pointer', marginTop: 16, textDecoration: 'underline', padding: 0 }}
            onClick={() => setStep('restore')}
          >
            {t('alreadyUseRestoreLink')}
          </button>
        )}
      </div>
    </div>
  )
}

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
      setRestoreError('Enter your 6-character code.')
      return
    }
    setRestoreLoading(true)
    setRestoreError('')
    const result = await pullByCode(restoreCode)
    setRestoreLoading(false)
    if (!result) {
      setRestoreError('Code not found. Double-check and try again.')
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

          <h1 className="setup-title" style={{ marginBottom: 8 }}>Your Backup Code</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', margin: '0 0 20px', lineHeight: 1.55 }}>
            {isSupabaseEnabled
              ? 'Your data syncs to the cloud automatically. If you ever lose your phone or switch devices, enter this code to get everything back.'
              : 'Write this code down somewhere safe. You can use it to restore your data on another device.'}
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
            You can also find this code anytime in Settings → Cloud Backup.
          </p>

          <button className="button setup-submit" onClick={confirm}>
            Got it — Start selling →
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

          <h1 className="setup-title" style={{ marginBottom: 8 }}>Restore Your Data</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', margin: '0 0 20px', lineHeight: 1.55 }}>
            Enter the 6-character backup code from your old device to restore all your products, sales, and customer records.
          </p>

          <label className="label" style={{ marginBottom: 16 }}>
            Backup code
            <input
              className="field"
              placeholder="e.g. NGOZI7"
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
            {restoreLoading ? 'Restoring…' : 'Restore my data →'}
          </button>

          <button
            className="button light"
            style={{ marginTop: 12, width: '100%' }}
            onClick={() => { setStep('form'); setRestoreError(''); setRestoreCode('') }}
          >
            ← Back to setup
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

        <h1 className="setup-title">Set up your shop</h1>
        <p className="setup-sub">Enter your details to get started. You can change them anytime.</p>

        <form onSubmit={handleSubmit} className="setup-form">
          <label className="label">
            Shop name
            <input className="field" name="shop" placeholder="e.g. Mama Grace Store" autoFocus required />
          </label>
          <label className="label">
            Your name
            <input className="field" name="owner" placeholder="e.g. Grace" required />
          </label>
          <label className="label">
            Phone <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(optional)</span>
            <input className="field" name="phone" placeholder="0803 xxx xxxx" />
          </label>
          <button className="button setup-submit" type="submit">
            Start selling →
          </button>
        </form>

        {isSupabaseEnabled && (
          <button
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.88rem', cursor: 'pointer', marginTop: 16, textDecoration: 'underline', padding: 0 }}
            onClick={() => setStep('restore')}
          >
            Already use Ulahia? Restore from backup code →
          </button>
        )}
      </div>
    </div>
  )
}

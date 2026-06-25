import { useState, useEffect } from 'react'
import { useStore } from '../store.jsx'
import { useToast } from '../toast.jsx'
import { useLang } from '../useLang.js'
import { hashPin } from '../utils.js'
import { getOrCreateCloudMeta, isSupabaseEnabled } from '../sync.js'

export default function Settings() {
  const { state, dispatch, activeProfile, switchProfile } = useStore()
  const showToast = useToast()
  const t = useLang()
  const [form, setForm] = useState({
    name: state.shop.name,
    owner: state.shop.owner,
    phone: state.shop.phone,
  })

  function field(key) {
    return {
      className: 'field',
      value: form[key],
      onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    }
  }

  function save() {
    if (!form.name.trim()) { showToast('Shop name is required.'); return }
    dispatch({ type: 'UPDATE_SHOP', payload: form })
    showToast('Settings saved.')
  }

  function importData(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data.products)) { showToast('Invalid backup file.'); return }
        dispatch({ type: 'IMPORT_STATE', payload: data })
        showToast('Data restored!')
      } catch { showToast('Could not read file.') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function exportData() {
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${state.shop.name || 'ulahia'}-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported.')
  }

  const cloudMeta = isSupabaseEnabled ? getOrCreateCloudMeta() : null
  const isDemo = activeProfile === 'demo'

  function handleSwitch() {
    switchProfile(isDemo ? 'main' : 'demo')
    showToast(isDemo ? 'Switched to your shop.' : 'Switched to Demo.')
  }

  return (
    <div className="screen-content">
      <section className="panel">
        <h3 style={{ margin: '0 0 18px' }}>{t('shopDetails')}</h3>
        <div style={{ display: 'grid', gap: 14 }}>
          <label className="label">
            {t('shopName')}
            <input {...field('name')} placeholder="e.g. Mama Ngozi Store" />
          </label>
          <label className="label">
            {t('yourName')}
            <input {...field('owner')} placeholder="e.g. Ngozi" />
          </label>
          <label className="label">
            {t('phoneNumber')}
            <input {...field('phone')} type="tel" placeholder="0803 000 0000" />
          </label>
          <button className="button" onClick={save}>{t('saveChanges')}</button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>Backup &amp; Export</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 14px' }}>
          Download all your shop data as a JSON file you can keep as a backup.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="button secondary" onClick={exportData}>⬇ Export Data</button>
          <label className="button light" style={{ cursor: 'pointer', minHeight: 42, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
            ⬆ Restore Backup
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
          </label>
        </div>
      </section>

      {cloudMeta && (
        <section className="panel" data-tour="cloud-section" style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 8px' }}>Cloud Backup</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 14px', lineHeight: 1.5 }}>
            Your data syncs automatically every time you make a change. If you switch phones, enter this code on the new device to restore everything.
          </p>
          <div style={{
            background: 'var(--bg)',
            border: '2px dashed var(--green)',
            borderRadius: 10,
            padding: '12px 20px',
            textAlign: 'center',
            letterSpacing: '0.28em',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--green)',
            margin: '0 0 10px',
          }}>
            {cloudMeta.recoveryCode}
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: 0, textAlign: 'center' }}>
            Write this down or screenshot it — it's your key to restore on any device.
          </p>
        </section>
      )}

      <section className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 10px' }}>Accounts</h3>
        <div style={{ marginBottom: 12 }}>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
            background: isDemo ? '#fff3bf' : '#e6f7f1',
            color: isDemo ? '#4d3200' : '#087f5b',
            fontSize: '0.83rem', fontWeight: 700, letterSpacing: '0.02em',
          }}>
            {isDemo ? 'Demo Account' : 'My Shop'}
          </span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 14px' }}>
          {isDemo
            ? 'You are on the Demo account. Your real shop data is saved and untouched.'
            : 'Switch to Demo to explore sample data. Your shop data stays safe.'}
        </p>
        <button className="button light" onClick={handleSwitch}>
          {isDemo ? '→ Switch to My Shop' : '→ Switch to Demo'}
        </button>
      </section>

      <SecuritySection />
    </div>
  )
}

function SecuritySection() {
  const { state, dispatch } = useStore()
  const showToast = useToast()
  const hasPin = !!state.inventoryPin
  const [mode, setMode] = useState('idle') // 'idle' | 'set' | 'change' | 'remove'
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [otpCountdown, setOtpCountdown] = useState('')

  const otp = state.inventoryOtp
  const otpValid = otp && new Date(otp.expiresAt) > new Date()

  useEffect(() => {
    if (!otpValid) { setOtpCountdown(''); return }
    function tick() {
      const secs = Math.max(0, Math.round((new Date(otp.expiresAt) - Date.now()) / 1000))
      if (secs <= 0) { setOtpCountdown('Expired'); return }
      const m = Math.floor(secs / 60)
      const s = secs % 60
      setOtpCountdown(`${m}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [otp, otpValid])

  function resetForm() {
    setMode('idle'); setNewPin(''); setConfirmPin(''); setCurrentPin(''); setPinError('')
  }

  function savePin() {
    if (newPin.length < 4) { setPinError('PIN must be at least 4 digits.'); return }
    if (newPin !== confirmPin) { setPinError('PINs do not match.'); return }
    if (!/^\d+$/.test(newPin)) { setPinError('PIN must be numbers only.'); return }
    dispatch({ type: 'SET_INVENTORY_PIN', payload: hashPin(newPin) })
    showToast('Inventory PIN set.')
    resetForm()
  }

  function changePin() {
    if (!currentPin || hashPin(currentPin) !== state.inventoryPin) {
      setPinError('Current PIN is wrong.'); return
    }
    if (newPin.length < 4) { setPinError('New PIN must be at least 4 digits.'); return }
    if (newPin !== confirmPin) { setPinError('New PINs do not match.'); return }
    if (!/^\d+$/.test(newPin)) { setPinError('PIN must be numbers only.'); return }
    dispatch({ type: 'SET_INVENTORY_PIN', payload: hashPin(newPin) })
    showToast('PIN changed.')
    resetForm()
  }

  function removePin() {
    if (!currentPin || hashPin(currentPin) !== state.inventoryPin) {
      setPinError('Wrong PIN.'); return
    }
    dispatch({ type: 'SET_INVENTORY_PIN', payload: null })
    dispatch({ type: 'CLEAR_INVENTORY_OTP' })
    showToast('Inventory PIN removed.')
    resetForm()
  }

  function generateOtp() {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    dispatch({ type: 'SET_INVENTORY_OTP', payload: { code, expiresAt } })
    showToast('OTP generated. Share it with your staff.')
  }

  const inputStyle = { margin: '6px 0 0' }

  return (
    <section className="panel" style={{ marginTop: 16 }}>
      <h3 style={{ margin: '0 0 6px' }}>Security</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 16px', lineHeight: 1.5 }}>
        Set a PIN to lock inventory changes — adding, editing, restocking. Staff need your PIN or a one-time code (OTP) to proceed.
      </p>

      {/* ── PIN status ── */}
      {mode === 'idle' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: 20,
              background: hasPin ? '#e6f7f1' : '#f1f3f5',
              color: hasPin ? '#087f5b' : 'var(--muted)',
              fontSize: '0.83rem', fontWeight: 700,
            }}>
              {hasPin ? '🔒 PIN Active' : '🔓 No PIN'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!hasPin && (
              <button className="button" onClick={() => setMode('set')}>Set Inventory PIN</button>
            )}
            {hasPin && (
              <>
                <button className="button light" onClick={() => setMode('change')}>Change PIN</button>
                <button className="button light" style={{ color: 'var(--red)' }} onClick={() => setMode('remove')}>Remove PIN</button>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Set PIN form ── */}
      {mode === 'set' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <label className="label">New PIN (numbers only, min 4 digits)
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder="e.g. 1234" value={newPin} onChange={e => { setNewPin(e.target.value); setPinError('') }} maxLength={8} autoFocus />
          </label>
          <label className="label">Confirm PIN
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder="Re-enter PIN" value={confirmPin} onChange={e => { setConfirmPin(e.target.value); setPinError('') }} maxLength={8} />
          </label>
          {pinError && <p style={{ margin: 0, color: 'var(--red)', fontSize: '0.85rem', fontWeight: 700 }}>{pinError}</p>}
          <div className="row">
            <button className="button" onClick={savePin}>Save PIN</button>
            <button className="button light" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Change PIN form ── */}
      {mode === 'change' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <label className="label">Current PIN
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder="Your current PIN" value={currentPin} onChange={e => { setCurrentPin(e.target.value); setPinError('') }} maxLength={8} autoFocus />
          </label>
          <label className="label">New PIN
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder="New PIN" value={newPin} onChange={e => { setNewPin(e.target.value); setPinError('') }} maxLength={8} />
          </label>
          <label className="label">Confirm New PIN
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder="Re-enter new PIN" value={confirmPin} onChange={e => { setConfirmPin(e.target.value); setPinError('') }} maxLength={8} />
          </label>
          {pinError && <p style={{ margin: 0, color: 'var(--red)', fontSize: '0.85rem', fontWeight: 700 }}>{pinError}</p>}
          <div className="row">
            <button className="button" onClick={changePin}>Change PIN</button>
            <button className="button light" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Remove PIN form ── */}
      {mode === 'remove' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <label className="label">Enter current PIN to confirm removal
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder="Your PIN" value={currentPin} onChange={e => { setCurrentPin(e.target.value); setPinError('') }} maxLength={8} autoFocus />
          </label>
          {pinError && <p style={{ margin: 0, color: 'var(--red)', fontSize: '0.85rem', fontWeight: 700 }}>{pinError}</p>}
          <div className="row">
            <button className="button" style={{ background: 'var(--red)' }} onClick={removePin}>Yes, Remove PIN</button>
            <button className="button light" onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── OTP Generator — only visible when PIN is active ── */}
      {hasPin && mode === 'idle' && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <strong style={{ display: 'block', fontSize: '0.92rem', marginBottom: 6 }}>One-Time Code (OTP)</strong>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0 0 12px', lineHeight: 1.5 }}>
            Generate a 6-digit code for your staff. It works once and expires in 5 minutes.
          </p>
          {otpValid ? (
            <div className="otp-display">
              <div className="otp-code">{otp.code}</div>
              <div className="otp-meta">
                <span className="otp-timer">⏱ {otpCountdown}</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Share this code with your staff</span>
              </div>
              <button className="button light" style={{ marginTop: 10 }} onClick={generateOtp}>Generate New Code</button>
            </div>
          ) : (
            <button className="button secondary" onClick={generateOtp}>Generate OTP</button>
          )}
        </div>
      )}
    </section>
  )
}

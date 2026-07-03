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
    if (!form.name.trim()) { showToast(t('shopNameRequired')); return }
    dispatch({ type: 'UPDATE_SHOP', payload: form })
    showToast(t('settingsSaved'))
  }

  function importData(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data.products)) { showToast(t('invalidBackupFile')); return }
        dispatch({ type: 'IMPORT_STATE', payload: data })
        showToast(t('dataRestored'))
      } catch { showToast(t('couldNotReadFile')) }
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
    showToast(t('dataExported'))
  }

  const cloudMeta = isSupabaseEnabled ? getOrCreateCloudMeta() : null
  const isDemo = activeProfile === 'demo'

  function handleSwitch() {
    switchProfile(isDemo ? 'main' : 'demo')
    showToast(isDemo ? t('switchedToShop') : t('switchedToDemo'))
  }

  return (
    <div className="screen-content">
      <section className="panel">
        <h3 style={{ margin: '0 0 18px' }}>{t('shopDetails')}</h3>
        <div style={{ display: 'grid', gap: 14 }}>
          <label className="label">
            {t('shopName')}
            <input {...field('name')} placeholder={t('shopNamePlaceholderSettings')} />
          </label>
          <label className="label">
            {t('yourName')}
            <input {...field('owner')} placeholder={t('ownerNamePlaceholder')} />
          </label>
          <label className="label">
            {t('phoneNumber')}
            <input {...field('phone')} type="tel" placeholder={t('shopPhonePlaceholder')} />
          </label>
          <button className="button" onClick={save}>{t('saveChanges')}</button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 8px' }}>{t('backupExportTitle')}</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 14px' }}>
          {t('backupExportDesc')}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="button secondary" onClick={exportData}>⬇ {t('exportData')}</button>
          <label className="button light" style={{ cursor: 'pointer', minHeight: 42, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
            ⬆ {t('restoreBackupBtn')}
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
          </label>
        </div>
      </section>

      {cloudMeta && (
        <section className="panel" data-tour="cloud-section" style={{ marginTop: 16 }}>
          <h3 style={{ margin: '0 0 8px' }}>{t('cloudBackupTitle')}</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 14px', lineHeight: 1.5 }}>
            {t('cloudBackupDesc')}
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
            {t('writeDownCode')}
          </p>
        </section>
      )}

      <section className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ margin: '0 0 10px' }}>{t('accountsTitle')}</h3>
        <div style={{ marginBottom: 12 }}>
          <span style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 20,
            background: isDemo ? '#fff3bf' : '#e6f7f1',
            color: isDemo ? '#4d3200' : '#0F6B63',
            fontSize: '0.83rem', fontWeight: 700, letterSpacing: '0.02em',
          }}>
            {isDemo ? t('demoAccountBadge') : t('myShopBadge')}
          </span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 14px' }}>
          {isDemo ? t('onDemoDesc') : t('switchToDemoDesc')}
        </p>
        <button className="button light" onClick={handleSwitch}>
          → {isDemo ? t('switchToMyShopBtn') : t('switchToDemoBtn')}
        </button>
      </section>

      <SecuritySection />
    </div>
  )
}

function SecuritySection() {
  const { state, dispatch } = useStore()
  const showToast = useToast()
  const t = useLang()
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
      if (secs <= 0) { setOtpCountdown(t('otpExpiredLabel')); return }
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
    if (newPin.length < 4) { setPinError(t('pinMinDigitsErr')); return }
    if (newPin !== confirmPin) { setPinError(t('pinsNoMatchErr')); return }
    if (!/^\d+$/.test(newPin)) { setPinError(t('pinNumbersOnlyErr')); return }
    dispatch({ type: 'SET_INVENTORY_PIN', payload: hashPin(newPin) })
    showToast(t('pinSetToast'))
    resetForm()
  }

  function changePin() {
    if (!currentPin || hashPin(currentPin) !== state.inventoryPin) {
      setPinError(t('currentPinWrongErr')); return
    }
    if (newPin.length < 4) { setPinError(t('newPinMinDigitsErr')); return }
    if (newPin !== confirmPin) { setPinError(t('newPinsNoMatchErr')); return }
    if (!/^\d+$/.test(newPin)) { setPinError(t('pinNumbersOnlyErr')); return }
    dispatch({ type: 'SET_INVENTORY_PIN', payload: hashPin(newPin) })
    showToast(t('pinChangedToast'))
    resetForm()
  }

  function removePin() {
    if (!currentPin || hashPin(currentPin) !== state.inventoryPin) {
      setPinError(t('wrongPinErr')); return
    }
    dispatch({ type: 'SET_INVENTORY_PIN', payload: null })
    dispatch({ type: 'CLEAR_INVENTORY_OTP' })
    showToast(t('pinRemovedToast'))
    resetForm()
  }

  function generateOtp() {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
    dispatch({ type: 'SET_INVENTORY_OTP', payload: { code, expiresAt } })
    showToast(t('otpGeneratedToast'))
  }

  const inputStyle = { margin: '6px 0 0' }

  return (
    <section className="panel" style={{ marginTop: 16 }}>
      <h3 style={{ margin: '0 0 6px' }}>{t('securityTitle')}</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.88rem', margin: '0 0 16px', lineHeight: 1.5 }}>
        {t('securityDesc')}
      </p>

      {/* ── PIN status ── */}
      {mode === 'idle' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: 20,
              background: hasPin ? '#e6f7f1' : '#f1f3f5',
              color: hasPin ? '#0F6B63' : 'var(--muted)',
              fontSize: '0.83rem', fontWeight: 700,
            }}>
              {hasPin ? `🔒 ${t('pinActiveBadge')}` : `🔓 ${t('noPinBadge')}`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!hasPin && (
              <button className="button" onClick={() => setMode('set')}>{t('setInventoryPinBtn')}</button>
            )}
            {hasPin && (
              <>
                <button className="button light" onClick={() => setMode('change')}>{t('changePinBtn')}</button>
                <button className="button light" style={{ color: 'var(--red)' }} onClick={() => setMode('remove')}>{t('removePinBtn')}</button>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Set PIN form ── */}
      {mode === 'set' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <label className="label">{t('newPinLabel')}
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder={t('newPinPlaceholder')} value={newPin} onChange={e => { setNewPin(e.target.value); setPinError('') }} maxLength={8} autoFocus />
          </label>
          <label className="label">{t('confirmPinLabel')}
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder={t('confirmPinPlaceholder')} value={confirmPin} onChange={e => { setConfirmPin(e.target.value); setPinError('') }} maxLength={8} />
          </label>
          {pinError && <p style={{ margin: 0, color: 'var(--red)', fontSize: '0.85rem', fontWeight: 700 }}>{pinError}</p>}
          <div className="row">
            <button className="button" onClick={savePin}>{t('savePinBtn')}</button>
            <button className="button light" onClick={resetForm}>{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* ── Change PIN form ── */}
      {mode === 'change' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <label className="label">{t('currentPinLabel')}
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder={t('currentPinPlaceholder')} value={currentPin} onChange={e => { setCurrentPin(e.target.value); setPinError('') }} maxLength={8} autoFocus />
          </label>
          <label className="label">{t('newPinLabelShort')}
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder={t('newPinLabelShort')} value={newPin} onChange={e => { setNewPin(e.target.value); setPinError('') }} maxLength={8} />
          </label>
          <label className="label">{t('confirmNewPinLabel')}
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder={t('confirmNewPinPlaceholder')} value={confirmPin} onChange={e => { setConfirmPin(e.target.value); setPinError('') }} maxLength={8} />
          </label>
          {pinError && <p style={{ margin: 0, color: 'var(--red)', fontSize: '0.85rem', fontWeight: 700 }}>{pinError}</p>}
          <div className="row">
            <button className="button" onClick={changePin}>{t('changePinBtn')}</button>
            <button className="button light" onClick={resetForm}>{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* ── Remove PIN form ── */}
      {mode === 'remove' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <label className="label">{t('enterCurrentPinConfirm')}
            <input className="field" type="password" inputMode="numeric" style={inputStyle}
              placeholder={t('yourPinPlaceholder')} value={currentPin} onChange={e => { setCurrentPin(e.target.value); setPinError('') }} maxLength={8} autoFocus />
          </label>
          {pinError && <p style={{ margin: 0, color: 'var(--red)', fontSize: '0.85rem', fontWeight: 700 }}>{pinError}</p>}
          <div className="row">
            <button className="button" style={{ background: 'var(--red)' }} onClick={removePin}>{t('yesRemovePinBtn')}</button>
            <button className="button light" onClick={resetForm}>{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* ── OTP Generator — only visible when PIN is active ── */}
      {hasPin && mode === 'idle' && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <strong style={{ display: 'block', fontSize: '0.92rem', marginBottom: 6 }}>{t('otpTitle')}</strong>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '0 0 12px', lineHeight: 1.5 }}>
            {t('otpDesc')}
          </p>
          {otpValid ? (
            <div className="otp-display">
              <div className="otp-code">{otp.code}</div>
              <div className="otp-meta">
                <span className="otp-timer">⏱ {otpCountdown}</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{t('shareCodeStaff')}</span>
              </div>
              <button className="button light" style={{ marginTop: 10 }} onClick={generateOtp}>{t('generateNewCodeBtn')}</button>
            </div>
          ) : (
            <button className="button secondary" onClick={generateOtp}>{t('generateOtpBtn')}</button>
          )}
        </div>
      )}
    </section>
  )
}

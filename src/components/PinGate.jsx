import { createContext, useContext, useState, useRef, useEffect } from 'react'
import { useStore } from '../store.jsx'
import { hashPin } from '../utils.js'
import { useLang } from '../useLang.js'

const Ctx = createContext(null)

export function PinGateProvider({ children }) {
  const { state, dispatch } = useStore()
  const t = useLang()
  const [show, setShow] = useState(false)
  const [tab, setTab] = useState('pin')
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const callbackRef = useRef(null)
  const attemptsRef = useRef(0)
  const lockUntilRef = useRef(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (show) setTimeout(() => inputRef.current?.focus(), 80)
  }, [show, tab])

  function requirePin(callback) {
    if (!state.inventoryPin) { callback(); return }
    callbackRef.current = callback
    setInput('')
    setError('')
    setTab('pin')
    setShow(true)
  }

  function dismiss() {
    setShow(false)
    setInput('')
    setError('')
  }

  function switchTab(t) {
    setTab(t)
    setInput('')
    setError('')
  }

  function submit(e) {
    e?.preventDefault()
    const now = Date.now()

    if (lockUntilRef.current > now) {
      const mins = Math.ceil((lockUntilRef.current - now) / 60000)
      setError(t('pgTooManyWait', { mins }))
      return
    }

    let valid = false

    if (tab === 'pin') {
      valid = !!state.inventoryPin && hashPin(input) === state.inventoryPin
    } else {
      const otp = state.inventoryOtp
      if (otp && otp.code === input.trim() && new Date(otp.expiresAt) > new Date(now)) {
        valid = true
        dispatch({ type: 'CLEAR_INVENTORY_OTP' })
      }
    }

    if (valid) {
      attemptsRef.current = 0
      setShow(false)
      callbackRef.current?.()
    } else {
      attemptsRef.current += 1
      if (attemptsRef.current >= 3) {
        lockUntilRef.current = now + 5 * 60 * 1000
        attemptsRef.current = 0
        setError(t('pgTooManyLocked'))
      } else {
        const left = 3 - attemptsRef.current
        setError(t('pgWrongCode', { left }))
      }
      setInput('')
    }
  }

  const hasValidOtp = !!state.inventoryOtp && new Date(state.inventoryOtp.expiresAt) > new Date()

  return (
    <Ctx.Provider value={{ requirePin }}>
      {children}
      {show && (
        <div className="pingate-overlay" onClick={e => e.target === e.currentTarget && dismiss()}>
          <div className="pingate-card">
            <p className="pingate-icon">🔒</p>
            <h3 className="pingate-title">{t('pgAuthRequired')}</h3>
            <p className="pingate-sub">{t('pgAuthSub')}</p>

            <div className="pingate-tabs">
              <button
                className={`pingate-tab${tab === 'pin' ? ' is-active' : ''}`}
                onClick={() => switchTab('pin')}
              >{t('pgOwnerPin')}</button>
              {hasValidOtp && (
                <button
                  className={`pingate-tab${tab === 'otp' ? ' is-active' : ''}`}
                  onClick={() => switchTab('otp')}
                >{t('pgUseOtp')}</button>
              )}
            </div>

            <form onSubmit={submit}>
              <input
                ref={inputRef}
                className="field pingate-input"
                type="password"
                inputMode="numeric"
                placeholder={tab === 'pin' ? '• • • • •' : t('pgOtpPlaceholder')}
                value={input}
                onChange={e => { setInput(e.target.value); setError('') }}
                maxLength={tab === 'pin' ? 8 : 6}
                autoComplete="off"
              />
              {error && <p className="pingate-error">{error}</p>}
              <div className="row" style={{ marginTop: 14 }}>
                <button className="button" type="submit">{t('pgConfirm')}</button>
                <button className="button light" type="button" onClick={dismiss}>{t('cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}

export function usePinGate() {
  return useContext(Ctx)
}

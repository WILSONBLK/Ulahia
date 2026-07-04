import { useState, useEffect } from 'react'
import { useStore } from '../store.jsx'
import { getOrCreateCloudMeta, setCloudMeta, pullByCode, isSupabaseEnabled } from '../sync.js'
import { hashPin } from '../utils.js'
import { useLang } from '../useLang.js'
import { LogoLockup } from './Logo.jsx'
import WelcomeScene from './WelcomeScene.jsx'
import DialCodePicker, { COUNTRIES } from './DialCodePicker.jsx'
import { PermissionsScreen, CreateShopScreen, AllSetScreen } from './OnboardingSetup.jsx'
import {
  IconCart, IconReports, IconCloud, IconShield, IconPlay,
  IconPhone, IconLock, IconEye, IconEyeOff, IconX,
  IconUser, IconStore, IconGlobe,
} from './icons.jsx'

const SEEN_KEY = 'ulahia-intro-seen'
const SIGNUP_PROGRESS_KEY = 'ulahia-signup-progress'

// Resume an abandoned signup (closed the app between Create Account and
// You're All Set) instead of losing name/phone/password/shop details.
function loadSignupProgress() {
  try {
    const raw = localStorage.getItem(SIGNUP_PROGRESS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && parsed.pending ? parsed : null
  } catch {
    return null
  }
}

const LANG_CODES = { en: 'EN', pidgin: 'PI', yo: 'YO', ig: 'IG', ha: 'HA' }

function LangChip() {
  const { state, dispatch } = useStore()
  return (
    <select
      className="la-lang-chip"
      aria-label="Language"
      value={state.language}
      onChange={e => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
    >
      {Object.entries(LANG_CODES).map(([value, code]) => (
        <option key={value} value={value}>{code}</option>
      ))}
    </select>
  )
}

// Reusable password field with show/hide toggle
function PasswordField({ label, placeholder, value, onChange, autoComplete = 'new-password' }) {
  const [show, setShow] = useState(false)
  return (
    <label className="label">
      {label}
      <span className="la-input-group">
        <span className="la-input-icon"><IconLock size={19} /></span>
        <input
          className="la-input"
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
        />
        <button
          type="button"
          className="la-input-btn"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow(s => !s)}
        >
          {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      </span>
    </label>
  )
}

function fieldClassName(base, invalid) {
  return `${base}${invalid ? ' is-invalid' : ''}`
}

function isRecoveryCodeValid(value) {
  return /^[A-Z0-9]{6}$/.test(String(value || '').trim().toUpperCase())
}

function sanitizePhone(value, maxLength = 15) {
  return String(value || '').replace(/\D/g, '').slice(0, maxLength)
}

const PHONE_RULES = {
  NG: { min: 10, max: 10 },
  GH: { min: 9, max: 9 },
  BJ: { min: 8, max: 8 },
  TG: { min: 8, max: 8 },
  CM: { min: 9, max: 9 },
  NE: { min: 8, max: 8 },
  CI: { min: 8, max: 8 },
  SN: { min: 9, max: 9 },
  SL: { min: 8, max: 8 },
  LR: { min: 8, max: 8 },
  GM: { min: 7, max: 7 },
  KE: { min: 9, max: 9 },
  TZ: { min: 9, max: 9 },
  UG: { min: 9, max: 9 },
  RW: { min: 9, max: 9 },
  ET: { min: 9, max: 9 },
  ZA: { min: 9, max: 9 },
  EG: { min: 10, max: 10 },
  MA: { min: 9, max: 9 },
  GB: { min: 10, max: 10 },
  US: { min: 10, max: 10 },
  CA: { min: 10, max: 10 },
  FR: { min: 9, max: 9 },
  DE: { min: 5, max: 11 },
  IT: { min: 9, max: 10 },
  ES: { min: 9, max: 9 },
  PT: { min: 9, max: 9 },
  BR: { min: 10, max: 11 },
  IN: { min: 10, max: 10 },
  CN: { min: 11, max: 11 },
  AE: { min: 9, max: 9 },
  SA: { min: 9, max: 9 },
}

function getCountryPhoneRule(countryCode) {
  return PHONE_RULES[countryCode] || { min: 7, max: 15 }
}

function getCountryName(countryCode) {
  return COUNTRIES.find(c => c.code === countryCode)?.name || 'selected country'
}

function formatPhoneLength(rule) {
  return rule.min === rule.max ? String(rule.min) : `${rule.min}-${rule.max}`
}

function validatePhoneForCountry(value, countryCode) {
  const rule = getCountryPhoneRule(countryCode)
  const digits = sanitizePhone(value, rule.max)
  return {
    rule,
    digits,
    valid: digits.length >= rule.min && digits.length <= rule.max,
  }
}

function parseStoredPhone(value) {
  const text = String(value || '').trim()
  if (!text) return { dialDigits: '', localDigits: '' }
  const parts = text.split(/\s+/)
  const firstPartDigits = parts[0].replace(/\D/g, '')
  if (parts.length > 1) {
    return { dialDigits: firstPartDigits, localDigits: parts.slice(1).join('').replace(/\D/g, '') }
  }
  return { dialDigits: '', localDigits: text.replace(/\D/g, '') }
}

function phoneErrorForCountry(countryCode, t) {
  const rule = getCountryPhoneRule(countryCode)
  return t('laPhoneFormatErr', {
    country: getCountryName(countryCode),
    digits: formatPhoneLength(rule),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Welcome — single screen: brand, value props, Get Started / Explore Demo.
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: IconReports, titleKey: 'laFeat1Title', bodyKey: 'laFeat1Sub', tone: 'green' },
  { Icon: IconCart,    titleKey: 'laFeat2Title', bodyKey: 'laFeat2Sub', tone: 'orange' },
  { Icon: IconCloud,   titleKey: 'laFeat3Title', bodyKey: 'laFeat3Sub', tone: 'teal' },
  { Icon: IconShield,  titleKey: 'laFeat4Title', bodyKey: 'laFeat4Sub', tone: 'purple' },
]

function Welcome({ onSignup, onLogin, onDemo }) {
  const t = useLang()
  return (
    <div className="la-welcome">
      <WelcomeScene />

      <div className="la-welcome-scroll">
        <div className="la-welcome-brand">
          <LogoLockup size={46} />
        </div>

        <h1 className="la-welcome-title">{t('laWelcomeTo')}<br />Ulahia</h1>
        <p className="la-welcome-tagline">{t('laTagline2')}</p>
        <p className="la-welcome-body">{t('laWelcomeIntro')}</p>

        <div className="la-welcome-features">
          {FEATURES.map(({ Icon, titleKey, bodyKey, tone }) => (
            <div className="la-feature" key={titleKey}>
              <span className={`la-feature-icon la-feature-icon--${tone}`}><Icon /></span>
              <span className="la-feature-text">
                <strong>{t(titleKey)}</strong>
                <span>{t(bodyKey)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="la-welcome-footer">
        <button className="button la-primary-btn" onClick={onSignup}>{t('laGetStartedBtn')}</button>
        <button className="la-ghost-btn" onClick={onDemo}>
          <IconPlay size={19} /> {t('laExploreDemoBtn')}
        </button>
        <button className="la-text-link" onClick={onLogin}>{t('laLoginChoiceBtn')}</button>
        <div className="la-welcome-dots" aria-hidden="true">
          <span className="la-dot la-dot--active" /><span className="la-dot" /><span className="la-dot" />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Account — approved mockup: icon fields, split phone row,
// password + confirm, terms checkbox gating the primary action.
// ─────────────────────────────────────────────────────────────────────────────
function SignupForm({ onBack, onDone, onLogin }) {
  const t = useLang()
  const [name, setName] = useState('')
  const [country, setCountry] = useState('NG')
  const [dial, setDial] = useState('+234')
  const [phone, setPhone] = useState('')
  const [shopName, setShopName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [touched, setTouched] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const phoneCheck = validatePhoneForCountry(phone, country)

  function updateField(setter, key) {
    return e => {
      setter(e.target.value)
    }
  }

  function touch(key) {
    setTouched(prev => ({ ...prev, [key]: true }))
  }

  const errors = {
    name: !name.trim() ? t('laNameRequiredErr') : '',
    phone: !phone.trim()
      ? t('laPhoneRequiredErr')
      : !phoneCheck.valid
        ? phoneErrorForCountry(country, t)
        : '',
    shopName: !shopName.trim() ? t('laShopNameRequiredErr') : '',
    password: !password ? t('laPasswordRequiredErr') : password.length < 4 ? t('laPasswordShortErr') : '',
    confirm: !confirm ? t('laConfirmPasswordRequiredErr') : password !== confirm ? t('laPasswordMatchErr') : '',
    agreed: agreed ? '' : t('laAgreeRequiredErr'),
  }
  const isValid = !Object.values(errors).some(Boolean)
  const showErrors = submitAttempted || Object.keys(touched).length > 0

  function submit(e) {
    e.preventDefault()
    setSubmitAttempted(true)
    if (!isValid) return
    onDone({
      name: name.trim(),
      shopName: shopName.trim(),
      phone: `${dial} ${phone.trim()}`,
      passwordHash: hashPin(password),
      country,
    })
  }

  return (
    <div className="la-login-page">
      <div className="la-login-top">
        <button className="la-back-btn" onClick={onBack}>← {t('laBackBtn')}</button>
        <LangChip />
      </div>

      <form className="la-login-body" onSubmit={submit} noValidate>
        <div className="la-login-brand">
          <LogoLockup size={44} />
        </div>

        <h2 className="la-login-title">{t('laCreateAccountTitle')}</h2>
        <p className="la-login-sub">{t('laCreateAccountSub')}</p>

        <div className="la-auth-form">
          <label className="label">
            {t('laFullNameLabel')}
            <span className={fieldClassName('la-input-group', showErrors && !!errors.name)}>
              <span className="la-input-icon"><IconUser size={19} /></span>
              <input
                className="la-input"
                placeholder={t('laFullNamePlaceholder')}
                value={name}
                autoComplete="name"
                aria-invalid={showErrors && !!errors.name}
                onBlur={() => touch('name')}
                onChange={updateField(setName, 'name')}
                autoFocus
              />
            </span>
            {showErrors && errors.name && <span className="la-field-error">{errors.name}</span>}
          </label>

          <div className="label">
            {t('laPhoneNumberLabel')}
            <div className="la-phone-row">
              <span className="la-input-group la-dial-box">
                <DialCodePicker
                  value={country}
                  onChange={c => { setCountry(c.code); setDial(c.dial); setPhone(prev => sanitizePhone(prev, getCountryPhoneRule(c.code).max)) }}
                />
                <span className="la-dial-caret" aria-hidden="true">▾</span>
              </span>
              <span className={fieldClassName('la-input-group', showErrors && !!errors.phone)}>
                <span className="la-input-icon"><IconPhone size={19} /></span>
                <input
                  className="la-input"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="803 123 4567"
                  value={phone}
                  autoComplete="tel"
                  aria-invalid={showErrors && !!errors.phone}
                  onBlur={() => touch('phone')}
                  onChange={e => setPhone(sanitizePhone(e.target.value))}
                />
              </span>
            </div>
            {showErrors && errors.phone && <span className="la-field-error">{errors.phone}</span>}
          </div>

          <label className="label">
            {t('shopName')}
            <span className={fieldClassName('la-input-group', showErrors && !!errors.shopName)}>
              <span className="la-input-icon"><IconStore size={19} /></span>
              <input
                className="la-input"
                placeholder={t('shopNamePlaceholderSettings')}
                value={shopName}
                aria-invalid={showErrors && !!errors.shopName}
                onBlur={() => touch('shopName')}
                onChange={updateField(setShopName, 'shopName')}
              />
            </span>
            {showErrors && errors.shopName && <span className="la-field-error">{errors.shopName}</span>}
          </label>

          <PasswordField
            label={t('laPasswordLabel')}
            placeholder={t('laPasswordPlaceholder')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          {showErrors && errors.password && <span className="la-field-error">{errors.password}</span>}

          <PasswordField
            label={t('laConfirmPasswordLabel')}
            placeholder={t('laConfirmPasswordPlaceholder')}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {showErrors && errors.confirm && <span className="la-field-error">{errors.confirm}</span>}

          <label className="la-agree-check">
            <input
              type="checkbox"
              checked={agreed}
              onBlur={() => touch('agreed')}
              onChange={e => setAgreed(e.target.checked)}
            />
            <span>
              {t('laAgreeCheckPrefix')}{' '}
              <a href="/terms.html" target="_blank" rel="noopener">{t('laTermsOfService')}</a>{' '}
              {t('laAndWord')}{' '}
              <a href="/privacy.html" target="_blank" rel="noopener">{t('laPrivacyLink')}</a>
            </span>
          </label>
          {showErrors && errors.agreed && <span className="la-field-error">{errors.agreed}</span>}

          <button
            className="button la-primary-btn"
            type="submit"
            disabled={!isValid}
            style={{ opacity: isValid ? 1 : 0.45 }}
          >
            {t('laCreateAccountBtn')} →
          </button>

          <p className="la-switch-line">
            {t('laHaveAccountQ')} <button type="button" className="la-text-link la-text-link--inline" onClick={onLogin}>{t('laLoginLink')}</button>
          </p>
        </div>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Choose Language — approved mockup: radio list, switches the app live.
// ─────────────────────────────────────────────────────────────────────────────
const LANG_OPTIONS = [
  { value: 'en',     name: 'English',         native: 'English',      tone: 'teal',   globe: true },
  { value: 'pidgin', name: 'Nigerian Pidgin',  native: 'Naija Pidgin', tone: 'purple' },
  { value: 'yo',     name: 'Yorùbá',           native: 'Yorùbá',       tone: 'orange' },
  { value: 'ig',     name: 'Igbo',             native: 'Igbo',         tone: 'green' },
  { value: 'ha',     name: 'Hausa',            native: 'Hausa',        tone: 'blue' },
]

function LanguageSelect({ onDone }) {
  const { state, dispatch } = useStore()
  const t = useLang()

  return (
    <div className="la-login-page">
      <div className="la-login-body">
        <div className="la-login-brand">
          <LogoLockup size={44} />
        </div>

        <h2 className="la-login-title">{t('laChooseLangTitle')}</h2>
        <p className="la-login-sub">{t('laChooseLangSub')}</p>

        <div className="la-lang-list" role="radiogroup" aria-label={t('laChooseLangTitle')}>
          {LANG_OPTIONS.map(({ value, name, native, tone, globe }) => {
            const active = state.language === value
            return (
              <button
                key={value}
                role="radio"
                aria-checked={active}
                className={`la-lang-row${active ? ' is-active' : ''}`}
                onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: value })}
              >
                <span className={`la-lang-avatar la-lang-avatar--${tone}`}>
                  {globe ? <IconGlobe size={22} /> : LANG_CODES[value]}
                </span>
                <span className="la-lang-text">
                  <strong>{name}</strong>
                  <span>{native}</span>
                </span>
                <span className={`la-radio${active ? ' is-checked' : ''}`} aria-hidden="true" />
              </button>
            )
          })}
        </div>

        <div className="la-info-card">
          <span className="la-info-icon"><IconGlobe size={22} /></span>
          <span>
            <strong>{t('laMoreLangsTitle')}</strong><br />
            {t('laMoreLangsSub')}
          </span>
        </div>

        <button className="button la-primary-btn" onClick={onDone}>
          {t('laContinueBtn')} →
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Recovery code display
// ─────────────────────────────────────────────────────────────────────────────
function CodeDisplay({ code, onContinue }) {
  const t = useLang()
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="la-auth-page la-code-page">
      <div className="la-auth-card la-code-card">
        <div className="la-code-icon">✍️</div>
        <h2 className="la-auth-title">{t('laWriteDownTitle')}</h2>
        <p className="la-auth-sub">
          {t('laCodeDescPrefix')} <strong>{t('laCodeDescBold')}</strong>{t('laCodeDescSuffix')}
        </p>
        <div className="la-code-display">
          <span className="la-code-label">{t('laYourCodeLabel')}</span>
          <div className="la-code-value">{code}</div>
        </div>
        <div className="la-code-tips">
          <div className="la-code-tip">📝 {t('laTip1')}</div>
          <div className="la-code-tip">📸 {t('laTip2')}</div>
          <div className="la-code-tip">💾 {t('laTip3')}</div>
        </div>
        <label className="la-confirm-check">
          <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
          <span>{t('laConfirmCheckLabel')}</span>
        </label>
        <button
          className="button la-primary-btn"
          style={{ opacity: confirmed ? 1 : 0.4 }}
          disabled={!confirmed}
          onClick={onContinue}
        >
          ✅ {t('laLetsStartBtn')}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Login — password first (device credential), recovery code as the
// cross-device fallback. "Forgot password?" switches to recovery mode.
// ─────────────────────────────────────────────────────────────────────────────
function LoginForm({ onBack, onSignup }) {
  const { state, dispatch } = useStore()
  const t = useLang()
  const [mode, setMode] = useState('password') // 'password' | 'code'
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('NG')
  const [dial, setDial] = useState('+234')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const digits = s => String(s || '').replace(/\D/g, '')
  const normalizedPhone = digits(phone)
  const passwordValid = password.length >= 1
  const codeNormalized = code.trim().toUpperCase()
  const phoneCheck = validatePhoneForCountry(phone, country)
  const phoneValid = !!phone.trim() && phoneCheck.valid
  const codeValid = isRecoveryCodeValid(codeNormalized)
  const isCode = mode === 'code'

  const fieldErrors = {
    phone: !phone.trim()
      ? t('laPhoneRequiredErr')
      : !phoneValid
        ? phoneErrorForCountry(country, t)
        : '',
    password: !isCode && !password.trim() ? t('laPasswordRequiredErr') : '',
    code: isCode && !code.trim() ? t('laRecoveryCodeRequiredErr') : isCode && !codeValid ? t('laRecoveryCodeFormatErr') : '',
  }
  const formValid = isCode
    ? phoneValid && codeValid
    : phoneValid && passwordValid
  const showErrors = submitAttempted || Object.keys(touched).length > 0

  function touch(key) {
    setTouched(prev => ({ ...prev, [key]: true }))
  }

  function clearCredentialError() {
    setError('')
  }

  function submitPassword() {
    setSubmitAttempted(true)
    if (!formValid) return
    const stored = state.auth?.passwordHash
    const storedPhone = parseStoredPhone(state.shop.phone)
    const selectedDial = dial.replace(/\D/g, '')
    const phoneMatches = storedPhone.localDigits === normalizedPhone && (!storedPhone.dialDigits || storedPhone.dialDigits === selectedDial)
    if (state.setupDone && stored && phoneMatches && hashPin(password) === stored) {
      sessionStorage.setItem('ulahia-unlocked', '1')
      dispatch({ type: 'LOGIN' })
      return
    }
    setError(t('laWrongPasswordErr'))
  }

  async function submitCode() {
    setSubmitAttempted(true)
    if (!formValid) return
    setError('')
    setLoading(true)
    try {
      const result = await pullByCode(codeNormalized)
      if (!result) {
        setError(t('laNoAccountFoundErr'))
        setLoading(false)
        return
      }
      setCloudMeta({ profileId: result.profile_id, recoveryCode: codeNormalized })
      sessionStorage.setItem('ulahia-unlocked', '1')
      dispatch({
        type: 'IMPORT_STATE',
        payload: { ...result.state, setupDone: true, onboardingDone: true, view: 'home' },
      })
    } catch {
      setError(t('laCouldNotConnectErr'))
    }
    setLoading(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    if (isCode) {
      submitCode()
    } else {
      submitPassword()
    }
  }

  return (
    <div className="la-login-page">
      <div className="la-login-top">
        <button className="la-back-btn" onClick={onBack}>← {t('laBackBtn')}</button>
        <LangChip />
      </div>

      <form className="la-login-body" onSubmit={handleSubmit} noValidate>
        <div className="la-login-brand">
          <LogoLockup size={56} stacked />
        </div>

        <h2 className="la-login-title">{t('laWelcomeBackTitle')}</h2>
        <p className="la-login-sub">{t('laLoginSub')}</p>

        <div className="la-auth-form">
          <label className="label">
            {t('laPhoneNumberLabel')}
            <span className={fieldClassName('la-input-group', showErrors && !!fieldErrors.phone)}>
              <span className="la-input-icon"><IconPhone size={19} /></span>
              <DialCodePicker value={country} onChange={c => { setCountry(c.code); setDial(c.dial); setPhone(prev => sanitizePhone(prev, getCountryPhoneRule(c.code).max)); clearCredentialError() }} />
              <input
                className="la-input"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="803 123 4567"
                value={phone}
                aria-invalid={showErrors && !!fieldErrors.phone}
                onBlur={() => touch('phone')}
                onChange={e => { setPhone(sanitizePhone(e.target.value, phoneCheck.rule.max)); clearCredentialError() }}
                autoFocus
              />
              {phone && (
                <button className="la-input-btn" type="button" aria-label="Clear" onClick={() => { setPhone(''); clearCredentialError() }}>
                  <IconX size={18} />
                </button>
              )}
            </span>
            {showErrors && fieldErrors.phone && <span className="la-field-error">{fieldErrors.phone}</span>}
          </label>

          {!isCode ? (
            <>
              <label className="label">
                {t('laPasswordLabel')}
                <span className={fieldClassName('la-input-group', showErrors && !!fieldErrors.password)}>
                  <span className="la-input-icon"><IconLock size={19} /></span>
                  <input
                    className="la-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('laPasswordLabel')}
                    value={password}
                    autoComplete="current-password"
                    aria-invalid={showErrors && !!fieldErrors.password}
                    onBlur={() => touch('password')}
                    onChange={e => { setPassword(e.target.value); clearCredentialError() }}
                  />
                  <button
                    type="button"
                    className="la-input-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(s => !s)}
                  >
                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </span>
                {showErrors && fieldErrors.password && <span className="la-field-error">{fieldErrors.password}</span>}
              </label>
              <p className="la-forgot-line">
                <button type="button" className="la-text-link la-text-link--inline" onClick={() => { setMode('code'); setError(''); setSubmitAttempted(false); setTouched({}) }}>
                  {t('laForgotPasswordQ')}
                </button>
              </p>
            </>
          ) : (
            <>
              <label className="label">
                {t('laRecoveryCodeLabel')}
                <span className={fieldClassName('la-input-group', showErrors && !!fieldErrors.code)}>
                  <span className="la-input-icon"><IconLock size={19} /></span>
                  <input
                    className="la-input la-code-input"
                    type={showCode ? 'text' : 'password'}
                    placeholder={t('laRecoveryCodePlaceholder')}
                    value={code}
                    maxLength={6}
                    autoComplete="off"
                    aria-invalid={showErrors && !!fieldErrors.code}
                    onBlur={() => touch('code')}
                    onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)); clearCredentialError() }}
                  />
                  <button
                    type="button"
                    className="la-input-btn"
                    aria-label={showCode ? 'Hide code' : 'Show code'}
                    onClick={() => setShowCode(s => !s)}
                  >
                    {showCode ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </span>
                {showErrors && fieldErrors.code && <span className="la-field-error">{fieldErrors.code}</span>}
              </label>
              <p className="la-forgot-line la-forgot-line--hint">{t('laRecoveryHint')}</p>
            </>
          )}

          {error && <p className="la-error">{error}</p>}
          {isCode && !isSupabaseEnabled && (
            <p className="la-note">⚠️ {t('laCloudLoginNote')}</p>
          )}

          <button
            className="button la-primary-btn"
            type="submit"
            disabled={loading || !formValid}
            style={{ opacity: loading || !formValid ? 0.45 : 1 }}
          >
            {loading ? `⏳ ${t('laLoadingDataBtn')}` : t('laLogInBtn')}
          </button>

          <div className="la-or-divider" aria-hidden="true">
            <span />{t('laOrDivider')}<span />
          </div>

          <button type="button" className="la-ghost-btn" onClick={() => { setMode(isCode ? 'password' : 'code'); setError(''); setSubmitAttempted(false); setTouched({}) }}>
            <IconShield size={18} /> {isCode ? t('laUsePasswordInstead') : t('laLoginWithCode')}
          </button>

          <p className="la-switch-line">
            {t('laNoAccountQ')} <button type="button" className="la-text-link la-text-link--inline" onClick={onSignup}>{t('laSignUpLink')}</button>
          </p>

          <p className="la-secure-note">
            <span className="la-secure-icon"><IconShield size={20} /></span>
            <span>
              {t('laSecureNote1')}<br />{t('laSecureNote2')}
            </span>
          </p>

          <p className="la-legal-note">
            {t('laAgreePrefix')}{' '}
            <a href="/terms.html" target="_blank" rel="noopener">{t('laTermsLink')}</a>{' '}
            {t('laAndWord')}{' '}
            <a href="/privacy.html" target="_blank" rel="noopener">{t('laPrivacyLink')}</a>.
          </p>
        </div>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — Welcome → Sign up → Choose Language → Code, or Welcome → Log in
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingAuth({ initialPhase = 'welcome' } = {}) {
  const { dispatch, enterDemoTour } = useStore()
  // Only the default first-run entry point can resume an abandoned signup —
  // if a parent explicitly routes here (e.g. initialPhase="login" after
  // logout), that always wins and we don't resume into the middle of a
  // stale signup attempt instead.
  const resumable = initialPhase === 'welcome' ? loadSignupProgress() : null
  const [phase, setPhase] = useState(resumable ? resumable.phase : initialPhase)
  const [pending, setPending] = useState(resumable ? resumable.pending : null)
  const [recoveryCode, setRecoveryCode] = useState(() =>
    resumable ? getOrCreateCloudMeta().recoveryCode : ''
  )

  useEffect(() => {
    if (initialPhase !== 'welcome') setPhase(initialPhase)
  }, [initialPhase])

  // Persist progress at each completed step so closing the app mid-signup
  // doesn't lose it — cleared once COMPLETE_SETUP actually fires.
  useEffect(() => {
    if (pending) {
      localStorage.setItem(SIGNUP_PROGRESS_KEY, JSON.stringify({ phase, pending }))
    }
  }, [phase, pending])

  function goSignup() {
    localStorage.setItem(SEEN_KEY, '1')
    setPhase('signup')
  }

  function goLogin() {
    localStorage.setItem(SEEN_KEY, '1')
    setPhase('login')
  }

  function handleSignupDone({ name, shopName, phone, passwordHash, country }) {
    const meta = getOrCreateCloudMeta()
    setRecoveryCode(meta.recoveryCode)
    setPending({ shop: { name: shopName, owner: name, phone }, passwordHash, country: country || 'NG' })
    setPhase('language')
  }

  function handleShopDone({ name, businessType, currency }) {
    setPending(p => ({ ...p, shop: { ...p.shop, name, businessType, currency } }))
    setPhase('code')
  }

  function handleCodeConfirmed() {
    setPhase('allset')
  }

  function handleGoDashboard() {
    // Fresh signup = already authenticated for this session
    sessionStorage.setItem('ulahia-unlocked', '1')
    localStorage.removeItem(SIGNUP_PROGRESS_KEY)
    dispatch({ type: 'COMPLETE_SETUP', payload: pending })
  }

  // Setup progress dots span: permissions → shop → code → done
  const DOT_TOTAL = 4

  if (phase === 'welcome')  return <Welcome onSignup={goSignup} onLogin={goLogin} onDemo={enterDemoTour} />
  if (phase === 'signup')   return <SignupForm onBack={() => setPhase('welcome')} onDone={handleSignupDone} onLogin={goLogin} />
  if (phase === 'language') return <LanguageSelect onDone={() => setPhase('permissions')} />
  if (phase === 'permissions') return (
    <PermissionsScreen
      stepIndex={0} stepTotal={DOT_TOTAL}
      onContinue={() => setPhase('shop')}
      onSkip={() => setPhase('shop')}
    />
  )
  if (phase === 'shop') return (
    <CreateShopScreen
      stepIndex={1} stepTotal={DOT_TOTAL}
      initialName={pending?.shop?.name || ''}
      countryCode={pending?.country || 'NG'}
      onContinue={handleShopDone}
      onSkip={() => setPhase('permissions')}
    />
  )
  if (phase === 'code')     return <CodeDisplay code={recoveryCode} onContinue={handleCodeConfirmed} />
  if (phase === 'allset')   return <AllSetScreen onDashboard={handleGoDashboard} />
  if (phase === 'login')    return <LoginForm onBack={() => setPhase('welcome')} onSignup={goSignup} />

  return null
}

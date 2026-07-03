import { useState } from 'react'
import { useStore } from '../store.jsx'
import { getOrCreateCloudMeta, setCloudMeta, pullByCode, isSupabaseEnabled } from '../sync.js'
import { hashPin } from '../utils.js'
import { useLang } from '../useLang.js'
import { LogoLockup } from './Logo.jsx'
import WelcomeScene from './WelcomeScene.jsx'
import DialCodePicker from './DialCodePicker.jsx'
import {
  IconCart, IconReports, IconCloud, IconShield, IconPlay,
  IconPhone, IconLock, IconEye, IconEyeOff, IconX,
  IconUser, IconStore, IconGlobe,
} from './icons.jsx'

const SEEN_KEY = 'ulahia-intro-seen'

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
  const [error, setError] = useState('')

  const clearErr = setter => e => { setter(e.target.value); setError('') }

  function submit() {
    if (!name.trim()) { setError(t('laNameRequiredErr')); return }
    if (!phone.trim()) { setError(t('laPhoneRequiredErr')); return }
    if (!shopName.trim()) { setError(t('laShopNameRequiredErr')); return }
    if (password.length < 4) { setError(t('laPasswordShortErr')); return }
    if (password !== confirm) { setError(t('laPasswordMatchErr')); return }
    if (!agreed) { setError(t('laAgreeRequiredErr')); return }
    setError('')
    onDone({
      name: name.trim(),
      shopName: shopName.trim(),
      phone: `${dial} ${phone.trim()}`,
      passwordHash: hashPin(password),
    })
  }

  return (
    <div className="la-login-page">
      <div className="la-login-top">
        <button className="la-back-btn" onClick={onBack}>← {t('laBackBtn')}</button>
        <LangChip />
      </div>

      <div className="la-login-body">
        <div className="la-login-brand">
          <LogoLockup size={44} />
        </div>

        <h2 className="la-login-title">{t('laCreateAccountTitle')}</h2>
        <p className="la-login-sub">{t('laCreateAccountSub')}</p>

        <div className="la-auth-form">
          <label className="label">
            {t('laFullNameLabel')}
            <span className="la-input-group">
              <span className="la-input-icon"><IconUser size={19} /></span>
              <input
                className="la-input"
                placeholder={t('laFullNamePlaceholder')}
                value={name}
                autoComplete="name"
                onChange={clearErr(setName)}
                autoFocus
              />
            </span>
          </label>

          <div className="label">
            {t('laPhoneNumberLabel')}
            <div className="la-phone-row">
              <span className="la-input-group la-dial-box">
                <DialCodePicker
                  value={country}
                  onChange={c => { setCountry(c.code); setDial(c.dial); setError('') }}
                />
                <span className="la-dial-caret" aria-hidden="true">▾</span>
              </span>
              <span className="la-input-group">
                <span className="la-input-icon"><IconPhone size={19} /></span>
                <input
                  className="la-input"
                  type="tel"
                  placeholder="803 123 4567"
                  value={phone}
                  autoComplete="tel"
                  onChange={clearErr(setPhone)}
                />
              </span>
            </div>
          </div>

          <label className="label">
            {t('shopName')}
            <span className="la-input-group">
              <span className="la-input-icon"><IconStore size={19} /></span>
              <input
                className="la-input"
                placeholder={t('shopNamePlaceholderSettings')}
                value={shopName}
                onChange={clearErr(setShopName)}
              />
            </span>
          </label>

          <PasswordField
            label={t('laPasswordLabel')}
            placeholder={t('laPasswordPlaceholder')}
            value={password}
            onChange={clearErr(setPassword)}
          />

          <PasswordField
            label={t('laConfirmPasswordLabel')}
            placeholder={t('laConfirmPasswordPlaceholder')}
            value={confirm}
            onChange={clearErr(setConfirm)}
          />

          <label className="la-agree-check">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => { setAgreed(e.target.checked); setError('') }}
            />
            <span>
              {t('laAgreeCheckPrefix')}{' '}
              <a href="/terms.html" target="_blank" rel="noopener">{t('laTermsOfService')}</a>{' '}
              {t('laAndWord')}{' '}
              <a href="/privacy.html" target="_blank" rel="noopener">{t('laPrivacyLink')}</a>
            </span>
          </label>

          {error && <p className="la-error">{error}</p>}

          <button
            className="button la-primary-btn"
            disabled={!agreed}
            style={{ opacity: agreed ? 1 : 0.45 }}
            onClick={submit}
          >
            {t('laCreateAccountBtn')} →
          </button>

          <p className="la-switch-line">
            {t('laHaveAccountQ')} <button className="la-text-link la-text-link--inline" onClick={onLogin}>{t('laLoginLink')}</button>
          </p>
        </div>
      </div>
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
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const digits = s => String(s || '').replace(/\D/g, '')

  function submitPassword() {
    if (!phone.trim()) { setError(t('laPhoneRequiredErr')); return }
    if (!password) { setError(t('laPasswordShortErr')); return }
    const stored = state.auth?.passwordHash
    const phoneMatches = digits(state.shop.phone).endsWith(digits(phone).slice(-10)) && digits(phone).length >= 7
    if (state.setupDone && stored && phoneMatches && hashPin(password) === stored) {
      sessionStorage.setItem('ulahia-unlocked', '1')
      dispatch({ type: 'SET_VIEW', payload: 'home' })
      return
    }
    setError(t('laWrongPasswordErr'))
  }

  async function submitCode() {
    const trimmed = code.trim().toUpperCase()
    if (!phone.trim()) { setError(t('laPhoneRequiredErr')); return }
    if (!trimmed || trimmed.length !== 6) { setError(t('laRecoveryLengthErr')); return }
    setError('')
    setLoading(true)
    try {
      const result = await pullByCode(trimmed)
      if (!result) {
        setError(t('laNoAccountFoundErr'))
        setLoading(false)
        return
      }
      setCloudMeta({ profileId: result.profile_id, recoveryCode: trimmed })
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

  const isCode = mode === 'code'

  return (
    <div className="la-login-page">
      <div className="la-login-top">
        <button className="la-back-btn" onClick={onBack}>← {t('laBackBtn')}</button>
        <LangChip />
      </div>

      <div className="la-login-body">
        <div className="la-login-brand">
          <LogoLockup size={56} stacked />
        </div>

        <h2 className="la-login-title">{t('laWelcomeBackTitle')}</h2>
        <p className="la-login-sub">{t('laLoginSub')}</p>

        <div className="la-auth-form">
          <label className="label">
            {t('laPhoneNumberLabel')}
            <span className="la-input-group">
              <span className="la-input-icon"><IconPhone size={19} /></span>
              <DialCodePicker value={country} onChange={c => setCountry(c.code)} />
              <input
                className="la-input"
                type="tel"
                placeholder="803 123 4567"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                autoFocus
              />
              {phone && (
                <button className="la-input-btn" aria-label="Clear" onClick={() => setPhone('')}>
                  <IconX size={18} />
                </button>
              )}
            </span>
          </label>

          {!isCode ? (
            <>
              <label className="label">
                {t('laPasswordLabel')}
                <span className="la-input-group">
                  <span className="la-input-icon"><IconLock size={19} /></span>
                  <input
                    className="la-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('laPasswordLabel')}
                    value={password}
                    autoComplete="current-password"
                    onChange={e => { setPassword(e.target.value); setError('') }}
                  />
                  <button
                    className="la-input-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(s => !s)}
                  >
                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </span>
              </label>
              <p className="la-forgot-line">
                <button className="la-text-link la-text-link--inline" onClick={() => { setMode('code'); setError('') }}>
                  {t('laForgotPasswordQ')}
                </button>
              </p>
            </>
          ) : (
            <>
              <label className="label">
                {t('laRecoveryCodeLabel')}
                <span className="la-input-group">
                  <span className="la-input-icon"><IconLock size={19} /></span>
                  <input
                    className="la-input la-code-input"
                    type={showCode ? 'text' : 'password'}
                    placeholder={t('laRecoveryCodePlaceholder')}
                    value={code}
                    maxLength={6}
                    autoComplete="off"
                    onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
                  />
                  <button
                    className="la-input-btn"
                    aria-label={showCode ? 'Hide code' : 'Show code'}
                    onClick={() => setShowCode(s => !s)}
                  >
                    {showCode ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </span>
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
            onClick={isCode ? submitCode : submitPassword}
            disabled={loading}
          >
            {loading ? `⏳ ${t('laLoadingDataBtn')}` : t('laLogInBtn')}
          </button>

          <div className="la-or-divider" aria-hidden="true">
            <span />{t('laOrDivider')}<span />
          </div>

          <button className="la-ghost-btn" onClick={() => { setMode(isCode ? 'password' : 'code'); setError('') }}>
            <IconShield size={18} /> {isCode ? t('laUsePasswordInstead') : t('laLoginWithCode')}
          </button>

          <p className="la-switch-line">
            {t('laNoAccountQ')} <button className="la-text-link la-text-link--inline" onClick={onSignup}>{t('laSignUpLink')}</button>
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
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — Welcome → Sign up → Choose Language → Code, or Welcome → Log in
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingAuth() {
  const { dispatch, enterDemoTour } = useStore()
  const [phase, setPhase] = useState('welcome')
  const [pending, setPending] = useState(null)
  const [recoveryCode, setRecoveryCode] = useState('')

  function goSignup() {
    localStorage.setItem(SEEN_KEY, '1')
    setPhase('signup')
  }

  function goLogin() {
    localStorage.setItem(SEEN_KEY, '1')
    setPhase('login')
  }

  function handleSignupDone({ name, shopName, phone, passwordHash }) {
    const meta = getOrCreateCloudMeta()
    setRecoveryCode(meta.recoveryCode)
    setPending({ shop: { name: shopName, owner: name, phone }, passwordHash })
    setPhase('language')
  }

  function handleCodeConfirmed() {
    // Fresh signup = already authenticated for this session
    sessionStorage.setItem('ulahia-unlocked', '1')
    dispatch({ type: 'COMPLETE_SETUP', payload: pending })
  }

  if (phase === 'welcome')  return <Welcome onSignup={goSignup} onLogin={goLogin} onDemo={enterDemoTour} />
  if (phase === 'signup')   return <SignupForm onBack={() => setPhase('welcome')} onDone={handleSignupDone} onLogin={goLogin} />
  if (phase === 'language') return <LanguageSelect onDone={() => setPhase('code')} />
  if (phase === 'code')     return <CodeDisplay code={recoveryCode} onContinue={handleCodeConfirmed} />
  if (phase === 'login')    return <LoginForm onBack={() => setPhase('welcome')} onSignup={goSignup} />

  return null
}

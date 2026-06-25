import { useState } from 'react'
import { useStore } from '../store.jsx'
import { getOrCreateCloudMeta, setCloudMeta, pullByCode, isSupabaseEnabled } from '../sync.js'
import Logo from './Logo.jsx'

const SEEN_KEY = 'ulahia-intro-seen'

// ─────────────────────────────────────────────────────────────────────────────
// Intro slides — shown only on the very first visit, never again
// ─────────────────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    isLogo: true,
    title: 'Ulahia',
    subtitle: 'Simple Shop Book',
    body: 'Built for small shop owners who want to know their sales, stock, profit, and debts — without stress.',
  },
  {
    icon: '💰',
    title: 'Record Every Sale Fast',
    body: 'Tap a product, pick how the customer paid — cash, transfer, or credit — and you\'re done. Works offline too.',
  },
  {
    icon: '📦',
    title: 'Know Your Stock & Debts',
    body: 'See what is running low before it runs out. Track who owes you and send a WhatsApp reminder in one tap.',
  },
  {
    icon: '📊',
    title: 'See Your Profit Every Day',
    body: 'Today, this week, this month — Ulahia always tells you exactly how much money your shop is making.',
  },
  {
    icon: '🌍',
    title: 'In Your Language',
    body: 'Switch between English, Pidgin, Yoruba, Igbo, and Hausa at any time. Ulahia speaks your language.',
  },
]

function IntroSlides({ onDone }) {
  const [idx, setIdx] = useState(0)
  const slide = SLIDES[idx]
  const isLast = idx === SLIDES.length - 1

  function next() {
    if (isLast) { onDone(); return }
    setIdx(i => i + 1)
  }

  return (
    <div className="la-intro">
      <button className="la-skip-btn" onClick={onDone}>Skip</button>

      <div className="la-intro-slide">
        {slide.isLogo
          ? <div className="la-intro-logo-wrap"><Logo size={88} /></div>
          : <div className="la-intro-icon">{slide.icon}</div>
        }
        <h1 className="la-intro-title">{slide.title}</h1>
        {slide.subtitle && <p className="la-intro-subtitle">{slide.subtitle}</p>}
        <p className="la-intro-body">{slide.body}</p>
      </div>

      <div className="la-intro-footer">
        <div className="la-intro-dots">
          {SLIDES.map((_, i) => (
            <span key={i} className={`la-dot ${i === idx ? 'la-dot--active' : ''}`} />
          ))}
        </div>
        <button className="button la-next-btn" onClick={next}>
          {isLast ? 'Get Started →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth choice — Sign Up vs Log In (shown every visit after first)
// ─────────────────────────────────────────────────────────────────────────────
function AuthChoice({ onSignup, onLogin }) {
  return (
    <div className="la-auth-page la-choice-page">
      <div className="la-auth-card">
        <div className="la-choice-logo">
          <Logo size={56} />
          <div>
            <strong className="la-choice-name">Ulahia</strong>
            <span className="la-choice-tagline">Simple Shop Book</span>
          </div>
        </div>
        <h2 className="la-auth-title">Welcome!</h2>
        <p className="la-auth-sub">Are you new here, or do you already have an account?</p>
        <div className="la-choice-btns">
          <button className="button la-signup-btn" onClick={onSignup}>
            🛍️ I'm New — Sign Up Free
          </button>
          <button className="button light la-login-btn" onClick={onLogin}>
            🔑 I Have an Account — Log In
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sign-up form
// ─────────────────────────────────────────────────────────────────────────────
function SignupForm({ onBack, onDone }) {
  const [name, setName] = useState('')
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  function submit() {
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (!shopName.trim()) { setError('Please enter your shop name.'); return }
    if (!phone.trim()) { setError('Please enter your phone number.'); return }
    setError('')
    onDone({ name, shopName, phone })
  }

  return (
    <div className="la-auth-page">
      <div className="la-auth-card">
        <button className="la-back-btn" onClick={onBack}>← Back</button>
        <div className="la-auth-logo"><Logo size={38} /><strong>Ulahia</strong></div>
        <h2 className="la-auth-title">Create Your Account</h2>
        <p className="la-auth-sub">Fill in your details below. You can change them later in Settings.</p>
        <div className="la-auth-form">
          <label className="label">
            Your Full Name
            <input className="field" placeholder="e.g. Ngozi Eze" value={name}
              onChange={e => { setName(e.target.value); setError('') }} autoFocus />
          </label>
          <label className="label">
            Shop Name
            <input className="field" placeholder="e.g. Mama Ngozi Store" value={shopName}
              onChange={e => { setShopName(e.target.value); setError('') }} />
          </label>
          <label className="label">
            Your Phone Number
            <input className="field" type="tel" placeholder="e.g. 0803 000 0000" value={phone}
              onChange={e => { setPhone(e.target.value); setError('') }} />
          </label>
          {error && <p className="la-error">{error}</p>}
          <button className="button" style={{ width: '100%', minHeight: 58, fontSize: '1.1rem' }} onClick={submit}>
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Recovery code display
// ─────────────────────────────────────────────────────────────────────────────
function CodeDisplay({ code, onContinue }) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="la-auth-page la-code-page">
      <div className="la-auth-card la-code-card">
        <div className="la-code-icon">✍️</div>
        <h2 className="la-auth-title">Write Down Your Code!</h2>
        <p className="la-auth-sub">
          This is your <strong>personal recovery code</strong>. You will need it if you ever switch phones or want to log in on another device.
        </p>
        <div className="la-code-display">
          <span className="la-code-label">Your Recovery Code:</span>
          <div className="la-code-value">{code}</div>
        </div>
        <div className="la-code-tips">
          <div className="la-code-tip">📝 Write it on paper right now</div>
          <div className="la-code-tip">📸 Take a photo of this screen</div>
          <div className="la-code-tip">💾 You can also find it later in Settings</div>
        </div>
        <label className="la-confirm-check">
          <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
          <span>I have saved my recovery code</span>
        </label>
        <button
          className="button"
          style={{ width: '100%', minHeight: 58, fontSize: '1.05rem', marginTop: 8, opacity: confirmed ? 1 : 0.4 }}
          disabled={!confirmed}
          onClick={onContinue}
        >
          ✅ Let's Start — Show Me Around!
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Login form
// ─────────────────────────────────────────────────────────────────────────────
function LoginForm({ onBack }) {
  const { dispatch } = useStore()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    const trimmed = code.trim().toUpperCase()
    if (!phone.trim()) { setError('Please enter your phone number.'); return }
    if (!trimmed || trimmed.length !== 6) { setError('Recovery code must be exactly 6 characters.'); return }
    setError('')
    setLoading(true)
    try {
      const result = await pullByCode(trimmed)
      if (!result) {
        setError('No account found with that code. Check the code and try again.')
        setLoading(false)
        return
      }
      setCloudMeta({ profileId: result.profile_id, recoveryCode: trimmed })
      dispatch({
        type: 'IMPORT_STATE',
        payload: { ...result.state, setupDone: true, onboardingDone: true, view: 'home', cart: [] },
      })
    } catch {
      setError('Could not connect. Check your internet and try again.')
    }
    setLoading(false)
  }

  return (
    <div className="la-auth-page">
      <div className="la-auth-card">
        <button className="la-back-btn" onClick={onBack}>← Back</button>
        <div className="la-auth-logo"><Logo size={38} /><strong>Ulahia</strong></div>
        <h2 className="la-auth-title">Welcome Back! 👋</h2>
        <p className="la-auth-sub">Enter your phone number and the recovery code you saved when you signed up.</p>
        <div className="la-auth-form">
          <label className="label">
            Your Phone Number
            <input className="field" type="tel" placeholder="e.g. 0803 000 0000"
              value={phone} onChange={e => { setPhone(e.target.value); setError('') }} autoFocus />
          </label>
          <label className="label">
            Recovery Code
            <input
              className="field la-code-input"
              placeholder="e.g. ABC123"
              value={code}
              maxLength={6}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
            />
          </label>
          {error && <p className="la-error">{error}</p>}
          {!isSupabaseEnabled && (
            <p className="la-note">⚠️ Cloud login requires internet. Make sure you are connected.</p>
          )}
          <button
            className="button"
            style={{ width: '100%', minHeight: 58, fontSize: '1.1rem' }}
            onClick={submit}
            disabled={loading}
          >
            {loading ? '⏳ Loading your data...' : '→ Log In'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — decides starting phase based on localStorage
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingAuth() {
  const { dispatch } = useStore()
  // After the first visit, skip straight to the auth choice page
  const [phase, setPhase] = useState(
    localStorage.getItem(SEEN_KEY) ? 'auth' : 'intro'
  )
  const [pendingShop, setPendingShop] = useState(null)
  const [recoveryCode, setRecoveryCode] = useState('')

  function finishIntro() {
    localStorage.setItem(SEEN_KEY, '1')
    setPhase('auth')
  }

  function handleSignupDone({ name, shopName, phone }) {
    const meta = getOrCreateCloudMeta()
    setRecoveryCode(meta.recoveryCode)
    setPendingShop({ name: shopName, owner: name, phone })
    setPhase('code')
  }

  function handleCodeConfirmed() {
    dispatch({ type: 'COMPLETE_SETUP', payload: pendingShop })
  }

  if (phase === 'intro')  return <IntroSlides onDone={finishIntro} />
  if (phase === 'auth')   return <AuthChoice onSignup={() => setPhase('signup')} onLogin={() => setPhase('login')} />
  if (phase === 'signup') return <SignupForm onBack={() => setPhase('auth')} onDone={handleSignupDone} />
  if (phase === 'code')   return <CodeDisplay code={recoveryCode} onContinue={handleCodeConfirmed} />
  if (phase === 'login')  return <LoginForm onBack={() => setPhase('auth')} />

  return null
}

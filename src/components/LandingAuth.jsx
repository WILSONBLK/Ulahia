import { useState } from 'react'
import { useStore } from '../store.jsx'
import { getOrCreateCloudMeta, setCloudMeta, pullByCode, isSupabaseEnabled } from '../sync.js'
import Logo from './Logo.jsx'

// ─────────────────────────────────────────────────────────────────────────────
// Landing page
// ─────────────────────────────────────────────────────────────────────────────
function Landing({ onSignup, onLogin }) {
  return (
    <div className="la-landing">
      {/* Hero */}
      <div className="la-hero">
        <div className="la-hero-logo">
          <Logo size={64} />
        </div>
        <h1 className="la-hero-title">Ulahia</h1>
        <p className="la-hero-tagline">Simple Shop Book</p>
        <p className="la-hero-desc">
          For small shop owners who want to know their sales, their stock, their profit, and who owes them — without stress.
        </p>
      </div>

      {/* Features */}
      <div className="la-features">
        <div className="la-feature">
          <span className="la-feature-icon">💰</span>
          <div>
            <strong>Record Every Sale Fast</strong>
            <span>Tap a product, choose payment, done. Works offline too.</span>
          </div>
        </div>
        <div className="la-feature">
          <span className="la-feature-icon">📦</span>
          <div>
            <strong>Know Your Stock</strong>
            <span>See what is running low before it runs out completely.</span>
          </div>
        </div>
        <div className="la-feature">
          <span className="la-feature-icon">👥</span>
          <div>
            <strong>Track Who Owes You</strong>
            <span>Never forget a debt. Send WhatsApp reminders in one tap.</span>
          </div>
        </div>
        <div className="la-feature">
          <span className="la-feature-icon">📊</span>
          <div>
            <strong>See Your Profit Daily</strong>
            <span>Today, this week, this month — always know your numbers.</span>
          </div>
        </div>
        <div className="la-feature">
          <span className="la-feature-icon">🌍</span>
          <div>
            <strong>In Your Language</strong>
            <span>Pidgin, English, Yoruba, Igbo, Hausa — you choose.</span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="la-ctas">
        <button className="button la-signup-btn" onClick={onSignup}>
          🛍️ Sign Up — Start Free
        </button>
        <button className="button light la-login-btn" onClick={onLogin}>
          🔑 Login — I already have an account
        </button>
      </div>

      <p className="la-footer">Free to use · Works on any phone · Your data is private</p>
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
        <div className="la-auth-logo"><Logo size={40} /><strong>Ulahia</strong></div>
        <h2 className="la-auth-title">Create Your Account</h2>
        <p className="la-auth-sub">Fill in your details below. You can change them later.</p>

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

      // Update cloud meta so future syncs go to the correct Supabase record
      setCloudMeta({ profileId: result.profile_id, recoveryCode: trimmed })

      // Load the full state — returning users skip onboarding
      dispatch({
        type: 'IMPORT_STATE',
        payload: { ...result.state, setupDone: true, onboardingDone: true, view: 'home', cart: [] },
      })
    } catch {
      setError('Could not connect to the internet. Check your connection and try again.')
    }
    setLoading(false)
  }

  return (
    <div className="la-auth-page">
      <div className="la-auth-card">
        <button className="la-back-btn" onClick={onBack}>← Back</button>
        <div className="la-auth-logo"><Logo size={40} /><strong>Ulahia</strong></div>
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
            <p className="la-note">
              ⚠️ Cloud login requires internet. Make sure you are connected and try again.
            </p>
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
// Root component — manages the phase
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingAuth() {
  const { dispatch } = useStore()
  const [phase, setPhase] = useState('landing') // 'landing' | 'signup' | 'code' | 'login'
  const [pendingShop, setPendingShop] = useState(null)
  const [recoveryCode, setRecoveryCode] = useState('')

  function handleSignupDone({ name, shopName, phone }) {
    const meta = getOrCreateCloudMeta()
    setRecoveryCode(meta.recoveryCode)
    setPendingShop({ name: shopName, owner: name, phone })
    setPhase('code')
  }

  function handleCodeConfirmed() {
    // Now dispatch setup — this sets setupDone: true, onboardingDone: false
    // App.jsx will then render the main app + Onboarding overlay
    dispatch({ type: 'COMPLETE_SETUP', payload: pendingShop })
  }

  if (phase === 'landing') return <Landing onSignup={() => setPhase('signup')} onLogin={() => setPhase('login')} />
  if (phase === 'signup') return <SignupForm onBack={() => setPhase('landing')} onDone={handleSignupDone} />
  if (phase === 'code') return <CodeDisplay code={recoveryCode} onContinue={handleCodeConfirmed} />
  if (phase === 'login') return <LoginForm onBack={() => setPhase('landing')} />

  return null
}

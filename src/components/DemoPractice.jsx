import { useState, useEffect } from 'react'
import { useStore } from '../store.jsx'

// ── Spotlight helpers (mirrors Onboarding geometry) ──────────────────────────
const PAD = 14
const BOTTOM_NAV_H = 76
const TIP_H_EST = 290
const ARROW_H = 14
const SAFE_TOP = 56

function useTargetRect(selector) {
  const [result, setResult] = useState(null)
  useEffect(() => {
    setResult(null)
    if (!selector) { setResult({ found: false }); return }
    const t = setTimeout(() => {
      const el = document.querySelector(selector)
      setResult(el ? { found: true, rect: el.getBoundingClientRect() } : { found: false })
    }, 300)
    return () => clearTimeout(t)
  }, [selector])
  return result
}

function computePos(rect, tipW) {
  const vh = window.innerHeight
  const vw = window.innerWidth
  const safeBottom = vh - BOTTOM_NAV_H - PAD
  const spaceBelow = safeBottom - rect.bottom - PAD
  const spaceAbove = rect.top - SAFE_TOP - PAD
  const goAbove = spaceBelow < TIP_H_EST && spaceAbove > spaceBelow
  let top, arrowDir
  if (goAbove) {
    top = Math.max(SAFE_TOP, rect.top - TIP_H_EST - ARROW_H)
    arrowDir = 'down'
  } else {
    top = Math.min(safeBottom - TIP_H_EST, rect.bottom + ARROW_H)
    arrowDir = 'up'
  }
  top = Math.max(SAFE_TOP, Math.min(top, safeBottom - TIP_H_EST))
  let left = rect.left + rect.width / 2 - tipW / 2
  left = Math.max(PAD, Math.min(left, vw - tipW - PAD))
  const arrowLeft = Math.max(18, Math.min(rect.left + rect.width / 2 - left - ARROW_H, tipW - 40))
  return { top, left, arrowDir, arrowLeft }
}

// ── Confetti data (generated once at module load) ────────────────────────────
const COLORS = ['#087f5b', '#1864ab', '#e67700', '#c92a2a', '#862e9c', '#ffd43b', '#2f9e44', '#f06595']
const CONFETTI = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  left: (i / 32) * 96 + Math.random() * 4,
  delay: (i * 0.07) % 1.4,
  size: 8 + (i % 5) * 2,
  rotate: (i * 47) % 360,
  circle: i % 3 === 0,
}))

// ── Step 0 — Intro card ──────────────────────────────────────────────────────
function PracticeIntroCard({ onStart, onSkip }) {
  return (
    <div className="ob-card" style={{ '--ob-color': '#e67700' }}>
      <div className="ob-card-inner">
        <div className="ob-card-icon">🛍️</div>
        <h2 className="ob-card-title">Now Let's Make a Sale!</h2>
        <p className="ob-card-body">
          {'Let\'s do ONE real sale together so it clicks.\n\n'}
          {'📋 Scenario:\n'}
          {'A customer named Chidi walks in and says:\n'}
          {'"Give me 2 Indomie Onion."\n\n'}
          {'You will find the product, add it to the cart, pick the payment method, and complete the sale — just like real life!'}
        </p>
        <button className="ob-card-btn" onClick={onStart}>
          💰 Let's Do It! →
        </button>
        <button className="dp-skip-link" onClick={onSkip}>
          Skip — take me to my shop
        </button>
      </div>
    </div>
  )
}

// ── Tap overlay (user must tap the highlighted element) ──────────────────────
function TapGuide({ selector, icon, title, body, onTap }) {
  const tipW = Math.min(320, window.innerWidth - PAD * 2)
  const result = useTargetRect(selector)
  if (!result) return <div className="ob-shade" />

  let captureStyle = null, tipStyle
  let arrowDir = null, arrowLeft = tipW / 2 - ARROW_H

  if (result.found) {
    const r = result.rect
    captureStyle = { top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 }
    const p = computePos(r, tipW)
    tipStyle = { top: p.top, left: p.left, width: tipW }
    arrowDir = p.arrowDir
    arrowLeft = p.arrowLeft
  } else {
    tipStyle = { bottom: BOTTOM_NAV_H + 16, left: Math.max(PAD, window.innerWidth / 2 - tipW / 2), width: tipW }
  }

  return (
    <>
      <div className="ob-shade" />
      {result.found && (
        <div className="ob-tap-capture" style={captureStyle} onClick={onTap} />
      )}
      <div className="ob-tooltip" style={tipStyle}>
        {arrowDir && <div className={`ob-arrow ob-arrow--${arrowDir}`} style={{ left: arrowLeft }} />}
        <div className="ob-tip-scroll">
          <div className="ob-tip-icon">{icon}</div>
          <h3 className="ob-tip-title">{title}</h3>
          <p className="ob-tip-body">{body}</p>
        </div>
        <button className="ob-tip-next" onClick={onTap}>
          {result.found ? '👆 Tap it!' : 'Next →'}
        </button>
      </div>
    </>
  )
}

// ── Spotlight with "Next" button ─────────────────────────────────────────────
function SpotGuide({ selector, icon, title, body, btnLabel, onNext }) {
  const tipW = Math.min(320, window.innerWidth - PAD * 2)
  const result = useTargetRect(selector)
  if (!result) return <div className="ob-shade" />

  let spotStyle = null, tipStyle
  let arrowDir = null, arrowLeft = tipW / 2 - ARROW_H

  if (result.found) {
    const r = result.rect
    spotStyle = { top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 }
    const p = computePos(r, tipW)
    tipStyle = { top: p.top, left: p.left, width: tipW }
    arrowDir = p.arrowDir
    arrowLeft = p.arrowLeft
  } else {
    tipStyle = { bottom: BOTTOM_NAV_H + 16, left: Math.max(PAD, window.innerWidth / 2 - tipW / 2), width: tipW }
  }

  return (
    <>
      {result.found
        ? <div className="ob-spotlight" style={spotStyle} />
        : <div className="ob-shade" />
      }
      <div className="ob-tooltip" style={tipStyle}>
        {arrowDir && <div className={`ob-arrow ob-arrow--${arrowDir}`} style={{ left: arrowLeft }} />}
        <div className="ob-tip-scroll">
          <div className="ob-tip-icon">{icon}</div>
          <h3 className="ob-tip-title">{title}</h3>
          <p className="ob-tip-body">{body}</p>
        </div>
        <button className="ob-tip-next" onClick={onNext}>{btnLabel}</button>
      </div>
    </>
  )
}

// ── Step 3 — Small floating HUD while user completes checkout ────────────────
function WatchHUD() {
  return (
    <div className="dp-watch-hud">
      <span className="dp-watch-icon">⏳</span>
      <div>
        <strong>Almost there!</strong>
        <span>Complete the checkout to finish the sale</span>
      </div>
    </div>
  )
}

// ── Step 4 — Celebration with confetti ───────────────────────────────────────
function Celebration({ onMain, onStay }) {
  return (
    <div className="dp-celebrate">
      <div className="dp-confetti-wrap" aria-hidden>
        {CONFETTI.map(p => (
          <div
            key={p.id}
            className="dp-confetti-piece"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              width: p.circle ? p.size : p.size * 0.7,
              height: p.circle ? p.size : p.size * 1.8,
              borderRadius: p.circle ? '50%' : '3px',
              background: p.color,
              '--rotate': `${p.rotate}deg`,
            }}
          />
        ))}
      </div>

      <div className="dp-celebrate-box">
        <div className="dp-celebrate-icon">🎉</div>
        <h2 className="dp-celebrate-title">Sale Complete!</h2>
        <p className="dp-celebrate-body">
          {'You just completed your first sale!\n\n'}
          {'You searched for a product, added it to the cart, chose a payment method, and the transaction was recorded — automatically.\n\n'}
          {'That\'s exactly how it works every day in your real shop.'}
        </p>
        <button className="dp-celebrate-main-btn" onClick={onMain}>
          🚀 Switch to My Shop
        </button>
        <button className="dp-celebrate-stay-btn" onClick={onStay}>
          Stay in Demo to Practice More
        </button>
      </div>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────
export default function DemoPractice() {
  const { state, dispatch, activeProfile, switchProfile } = useStore()

  // Record transaction count at mount so we detect new sales, not the demo baseline
  const [baseTxCount] = useState(() => state.transactions.length)
  const [step, setStep] = useState(0)

  // Watch for a completed transaction while on the "watch" step
  useEffect(() => {
    if (step === 3 && state.transactions.length > baseTxCount) {
      // Brief delay so the receipt modal has time to show first
      const t = setTimeout(() => setStep(4), 1100)
      return () => clearTimeout(t)
    }
  }, [state.transactions.length, step, baseTxCount])

  if (activeProfile !== 'demo') return null
  if (step === 5) return null // dismissed

  function handleStart() {
    dispatch({ type: 'SET_VIEW', payload: 'home' })
    setStep(1)
  }

  function handleTapSell() {
    dispatch({ type: 'SET_VIEW', payload: 'sell' })
    setStep(2)
  }

  function handleDoneAdding() {
    setStep(3) // remove overlay, let user interact with checkout freely
  }

  return (
    <>
      {step === 0 && (
        <PracticeIntroCard
          onStart={handleStart}
          onSkip={() => switchProfile('main')}
        />
      )}

      {step === 1 && (
        <TapGuide
          selector=".home-sell-btn"
          icon="💰"
          title="Step 1 — Open the Sell Screen"
          body={'Tap the big green SELL button to open the cashier where you enter what Chidi is buying.'}
          onTap={handleTapSell}
        />
      )}

      {step === 2 && (
        <SpotGuide
          selector=".pos-search"
          icon="🔍"
          title="Step 2 — Find & Add the Product"
          body={'Type "indomie" in the search box to filter the list.\n\nThen tap "+ Add" twice on Indomie Onion to get a quantity of 2.\n\nYou\'ll see the cart count update at the bottom. When ready, tap the button below!'}
          btnLabel="I added 2 × Indomie Onion →"
          onNext={handleDoneAdding}
        />
      )}

      {step === 3 && <WatchHUD />}

      {step === 4 && (
        <Celebration
          onMain={() => switchProfile('main')}
          onStay={() => setStep(5)}
        />
      )}
    </>
  )
}

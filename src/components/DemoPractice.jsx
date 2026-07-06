import { useState, useEffect } from 'react'
import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'

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
const COLORS = ['#0F6B63', '#1864ab', '#e67700', '#c92a2a', '#862e9c', '#ffd43b', '#2f9e44', '#f06595']
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
  const t = useLang()
  return (
    <div className="ob-card" style={{ '--ob-color': '#e67700' }}>
      <div className="ob-card-inner">
        <div className="ob-card-icon">🛍️</div>
        <h2 className="ob-card-title">{t('dpNowMakeSaleTitle')}</h2>
        <p className="ob-card-body">{t('dpScenarioBody')}</p>
        <button className="ob-card-btn" onClick={onStart}>
          {t('dpLetsDoItBtn')}
        </button>
        <button className="dp-skip-link" onClick={onSkip}>
          {t('dpSkipLink')}
        </button>
      </div>
    </div>
  )
}

// ── Tap overlay (user must tap the highlighted element) ──────────────────────
function TapGuide({ selector, icon, title, body, onTap }) {
  const t = useLang()
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
          {result.found ? t('obTapItBtn') : t('obNextBtn')}
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
  const t = useLang()
  return (
    <div className="dp-watch-hud">
      <span className="dp-watch-icon">⏳</span>
      <div>
        <strong>{t('dpWatchAlmostThere')}</strong>
        <span>{t('dpWatchCompleteCheckout')}</span>
      </div>
    </div>
  )
}

// ── Step 4 — Celebration with confetti ───────────────────────────────────────
function Celebration({ onMain, onStay }) {
  const t = useLang()
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
        <h2 className="dp-celebrate-title">{t('dpSaleCompleteTitle')}</h2>
        <p className="dp-celebrate-body">{t('dpSaleCompleteBody')}</p>
        <button className="dp-celebrate-main-btn" onClick={onMain}>
          {t('dpSwitchToMyShopBtn')}
        </button>
        <button className="dp-celebrate-stay-btn" onClick={onStay}>
          {t('dpStayDemoBtn')}
        </button>
      </div>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────
export default function DemoPractice() {
  const { state, dispatch, activeProfile, switchProfile } = useStore()
  const t = useLang()

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

  function finish(andSwitchToMain) {
    dispatch({ type: 'COMPLETE_DEMO_PRACTICE' })
    if (andSwitchToMain) switchProfile('main')
    else setStep(5)
  }

  return (
    <>
      {step === 0 && (
        <PracticeIntroCard
          onStart={handleStart}
          onSkip={() => finish(false)}
        />
      )}

      {step === 1 && (
        <TapGuide
          selector=".home-sell-circle"
          icon="💰"
          title={t('dpStep1Title')}
          body={t('dpStep1Body')}
          onTap={handleTapSell}
        />
      )}

      {step === 2 && (
        <SpotGuide
          selector=".pos-search-input"
          icon="🔍"
          title={t('dpStep2Title')}
          body={t('dpStep2Body')}
          btnLabel={t('dpStep2Btn')}
          onNext={handleDoneAdding}
        />
      )}

      {step === 3 && <WatchHUD />}

      {step === 4 && (
        <Celebration
          onMain={() => finish(true)}
          onStay={() => finish(false)}
        />
      )}
    </>
  )
}

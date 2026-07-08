import { useState, useEffect } from 'react'
import { useStore } from '../store.jsx'
import { TOUR_SEEN_KEY } from '../utils.js'
import { useLang } from '../useLang.js'

const OB_STEP_KEY = 'ulahia-ob-step'
const OB_DONE_KEY = TOUR_SEEN_KEY

// ─────────────────────────────────────────────────────────────────────────────
// Step definitions
//
//  type 'card'     – full-screen coloured slide, no spotlight
//  type 'spot'     – spotlight on target + tooltip + "Next" button
//                    auto-navigates to `view` when step loads
//  type 'tap'      – spotlight on target + tooltip saying "tap it"
//                    user taps the highlighted element to advance (and navigate)
//                    optional `view` auto-navigates first so target is visible
// ─────────────────────────────────────────────────────────────────────────────
// Language is chosen during account creation (LandingAuth), so the tour
// starts straight at the welcome card in the user's language.
const STEPS = [
  // 0 — Welcome card
  {
    type: 'card',
    color: '#0F6B63',
    icon: '👋',
    titleKey: 'ob1WelcomeTitle',
    bodyKey: 'ob1WelcomeBody',
    btnKey: 'ob1WelcomeBtn',
  },

  // Home: Today's summary cards (auto-nav to home)
  {
    type: 'spot',
    view: 'home',
    target: '.home-summary',
    icon: '📋',
    titleKey: 'ob2TodaySummaryTitle',
    bodyKey: 'ob2TodaySummaryBody',
  },

  // Bottom navigation bar
  {
    type: 'spot',
    view: 'home',
    target: '.tabs-mobile',
    icon: '🧭',
    titleKey: 'obV2NavTitle',
    bodyKey: 'obV2NavBody',
  },

  // TAP: Sell button → user taps it to go to sell screen
  {
    type: 'tap',
    view: 'home',
    target: '.home-sell-circle',
    tapView: 'sell',
    icon: '💰',
    titleKey: 'ob6SellBtnTitle',
    bodyKey: 'ob6SellBtnBody',
  },

  // Sell: Search bar
  {
    type: 'spot',
    view: 'sell',
    target: '.pos-search-field',
    icon: '🔍',
    titleKey: 'ob7SearchTitle',
    bodyKey: 'ob7SearchBody',
  },

  // Sell: Category chips
  {
    type: 'spot',
    view: 'sell',
    target: '.pos-chips',
    fallback: true,
    icon: '🏷️',
    titleKey: 'obV2ChipsTitle',
    bodyKey: 'obV2ChipsBody',
  },

  // 8 — Sell: Product rows
  {
    type: 'spot',
    view: 'sell',
    target: '.pos-product-row',
    fallback: true,
    icon: '📦',
    titleKey: 'ob8ProductRowsTitle',
    bodyKey: 'ob8ProductRowsBody',
  },

  // 9 — Sell: Pin button
  {
    type: 'spot',
    view: 'sell',
    target: '.pos-pin-btn',
    fallback: true,
    icon: '⭐',
    titleKey: 'ob9PinTitle',
    bodyKey: 'ob9PinBody',
  },

  // Card: Review Sale flow
  {
    type: 'card',
    color: '#0F6B63',
    icon: '🧾',
    titleKey: 'obV2ReviewTitle',
    bodyKey: 'obV2ReviewBody',
    btnKey: 'obContinueBtn',
  },

  // Card: Payment methods
  {
    type: 'card',
    color: '#1864ab',
    icon: '💳',
    titleKey: 'ob10PaymentTitle',
    bodyKey: 'ob10PaymentBody',
    btnKey: 'ob10PaymentBtn',
  },

  // 11 — Card: Discounts and receipts
  {
    type: 'card',
    color: '#6741d9',
    icon: '🏷️',
    titleKey: 'ob11DiscountsTitle',
    bodyKey: 'ob11DiscountsBody',
    btnKey: 'ob11DiscountsBtn',
  },

  // 12 — TAP: Products tab in bottom nav
  {
    type: 'tap',
    target: '.tabs-mobile button:nth-child(2)',
    tapView: 'products',
    icon: '📦',
    titleKey: 'ob12GoProductsTitle',
    bodyKey: 'ob12GoProductsBody',
  },

  // Products: Add button
  {
    type: 'spot',
    view: 'products',
    target: '.topbar-action--primary',
    icon: '➕',
    titleKey: 'ob13AddProductTitle',
    bodyKey: 'ob13AddProductBody',
  },

  // Products: Summary footer (totals + low stock → bulk restock)
  {
    type: 'spot',
    view: 'products',
    target: '.prod-summary',
    fallback: true,
    icon: '📊',
    titleKey: 'obV2ProdSummaryTitle',
    bodyKey: 'obV2ProdSummaryBody',
  },

  // 15 — TAP: Customers tab in bottom nav
  {
    type: 'tap',
    target: '.tabs-mobile button:nth-child(4)',
    tapView: 'customers',
    icon: '👥',
    titleKey: 'ob15GoCustomersTitle',
    bodyKey: 'ob15GoCustomersBody',
  },

  // 16 — Customers: Cards
  {
    type: 'spot',
    view: 'customers',
    target: '.cust-card',
    fallback: true,
    icon: '👥',
    titleKey: 'ob16CustomerCardsTitle',
    bodyKey: 'ob16CustomerCardsBody',
  },

  // 17 — TAP: Reports tab in bottom nav
  {
    type: 'tap',
    target: '.tabs-mobile button:nth-child(5)',
    tapView: 'more',
    icon: '📊',
    titleKey: 'ob17GoReportsTitle',
    bodyKey: 'ob17GoReportsBody',
  },

  // 18 — Reports: Period tabs
  {
    type: 'tap',
    view: 'more',
    target: '.more-row[data-tour="more-reports"]',
    tapView: 'reports',
    icon: '📊',
    titleKey: 'ob18ReportPeriodsTitle',
    bodyKey: 'ob18ReportPeriodsBody',
  },

  // 19 — TAP: Settings tab in bottom nav
  {
    type: 'tap',
    view: 'more',
    target: '.more-row[data-tour="more-settings"]',
    tapView: 'settings',
    icon: '⚙️',
    titleKey: 'ob19GoSettingsTitle',
    bodyKey: 'ob19GoSettingsBody',
  },

  // 20 — Settings: Recovery code
  {
    type: 'spot',
    view: 'settings',
    target: '[data-tour="cloud-section"]',
    fallback: true,
    icon: '🔑',
    titleKey: 'ob20RecoveryCodeTitle',
    bodyKey: 'ob20RecoveryCodeBody',
  },

  // 21 — Card: Going back
  {
    type: 'card',
    color: '#37474F',
    icon: '←',
    titleKey: 'ob21GoBackTitle',
    bodyKey: 'ob21GoBackBody',
    btnKey: 'ob21GoBackBtn',
  },

  // 22 — Done
  {
    type: 'card',
    color: '#0F6B63',
    icon: '🎉',
    titleKey: 'ob22DoneTitle',
    bodyKey: 'ob22DoneBody',
    btnKey: 'ob22DoneBtn',
    isLast: true,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hook: find and measure a DOM element (with delay for render to settle)
// ─────────────────────────────────────────────────────────────────────────────
function useTargetRect(selector) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    setResult(null)
    if (!selector) { setResult({ found: false }); return }
    const t = setTimeout(() => {
      const el = document.querySelector(selector)
      setResult(el
        ? { found: true, rect: el.getBoundingClientRect() }
        : { found: false }
      )
    }, 260)
    return () => clearTimeout(t)
  }, [selector])

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Compute tooltip position so it never overlaps bottom nav or goes off-screen
// ─────────────────────────────────────────────────────────────────────────────
const BOTTOM_NAV_H = 76   // px
const TIP_H_EST   = 300   // estimated tooltip height
const ARROW_H     = 14
const PAD         = 14
const SAFE_TOP    = 56    // below the skip button

function computeTooltipPos(rect, tipW) {
  const vh = window.innerHeight
  const vw = window.innerWidth
  const safeBottom = vh - BOTTOM_NAV_H - PAD

  const spaceBelow = safeBottom - rect.bottom - PAD
  const spaceAbove = rect.top - SAFE_TOP - PAD
  const goAbove    = spaceBelow < TIP_H_EST && spaceAbove > spaceBelow

  let top, arrowDir
  if (goAbove) {
    top      = Math.max(SAFE_TOP, rect.top - TIP_H_EST - ARROW_H)
    arrowDir = 'down'
  } else {
    top      = Math.min(safeBottom - TIP_H_EST, rect.bottom + ARROW_H)
    arrowDir = 'up'
  }
  // Hard clamp so tooltip is always fully inside safe zone
  top = Math.max(SAFE_TOP, Math.min(top, safeBottom - TIP_H_EST))

  let left = rect.left + rect.width / 2 - tipW / 2
  left = Math.max(PAD, Math.min(left, vw - tipW - PAD))

  const arrowLeft = Math.max(18, Math.min(
    rect.left + rect.width / 2 - left - ARROW_H,
    tipW - 40
  ))

  return { top, left, arrowDir, arrowLeft }
}

// Fallback tooltip position: centred above the bottom nav
function fallbackTipStyle(tipW) {
  const vh = window.innerHeight
  const vw = window.innerWidth
  return {
    bottom: BOTTOM_NAV_H + 16,
    left: Math.max(PAD, vw / 2 - tipW / 2),
    width: tipW,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-screen card slide
// ─────────────────────────────────────────────────────────────────────────────
function CardStep({ step, stepNum, total, onNext, btnOverride }) {
  const t = useLang()
  return (
    <div className="ob-card" style={{ '--ob-color': step.color }}>
      <div className="ob-card-inner">
        <span className="ob-counter ob-counter--card">{stepNum + 1} / {total}</span>
        <div className="ob-card-icon">{step.icon}</div>
        <h2 className="ob-card-title">{t(step.titleKey)}</h2>
        <p className="ob-card-body">{t(step.bodyKey)}</p>
        <button className="ob-card-btn" onClick={onNext}>
          {btnOverride || (step.btnKey ? t(step.btnKey) : t('obNextBtn'))}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip inner content (shared between spot and tap steps)
// ─────────────────────────────────────────────────────────────────────────────
function TooltipContent({ step, stepNum, total, btnLabel, onBtn, arrowDir, arrowLeft }) {
  const t = useLang()
  return (
    <>
      {arrowDir && (
        <div className={`ob-arrow ob-arrow--${arrowDir}`} style={{ left: arrowLeft }} />
      )}
      <div className="ob-tip-scroll">
        <span className="ob-counter">{stepNum + 1} / {total}</span>
        <div className="ob-tip-icon">{step.icon}</div>
        <h3 className="ob-tip-title">{t(step.titleKey)}</h3>
        <p className="ob-tip-body">{t(step.bodyKey)}</p>
      </div>
      <button className="ob-tip-next" onClick={onBtn}>{btnLabel}</button>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Spot step — dimmed backdrop + tooltip with arrow + "Got it! Next →"
// ─────────────────────────────────────────────────────────────────────────────
function SpotStep({ step, stepNum, total, onNext }) {
  const t = useLang()
  const tipW = Math.min(320, window.innerWidth - PAD * 2)
  const result = useTargetRect(step.target)

  if (!result) return <div className="ob-shade" /> // still measuring

  let spotStyle = null, tipStyle, arrowDir = null, arrowLeft = tipW / 2 - ARROW_H

  if (result.found) {
    const r = result.rect
    spotStyle = { top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 }
    const p = computeTooltipPos(r, tipW)
    tipStyle  = { top: p.top, left: p.left, width: tipW }
    arrowDir  = p.arrowDir
    arrowLeft = p.arrowLeft
  } else {
    tipStyle = fallbackTipStyle(tipW)
  }

  return (
    <>
      {result.found
        ? <div className="ob-spotlight" style={spotStyle} />
        : <div className="ob-shade" />
      }
      <div className="ob-tooltip" style={tipStyle}>
        <TooltipContent
          step={step} stepNum={stepNum} total={total}
          btnLabel={t('obGotItNextBtn')}
          onBtn={onNext}
          arrowDir={arrowDir} arrowLeft={arrowLeft}
        />
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tap step — pulsing spotlight + tooltip prompting user to tap the element
// The transparent ob-tap-capture overlay sits on the element and captures tap
// ─────────────────────────────────────────────────────────────────────────────
function TapStep({ step, stepNum, total, onNext }) {
  const { dispatch } = useStore()
  const t = useLang()
  const tipW = Math.min(320, window.innerWidth - PAD * 2)
  const result = useTargetRect(step.target)

  if (!result) return <div className="ob-shade" />

  function handleTap() {
    if (step.tapView) dispatch({ type: 'SET_VIEW', payload: step.tapView })
    onNext()
  }

  let captureStyle = null, tipStyle, arrowDir = null, arrowLeft = tipW / 2 - ARROW_H

  if (result.found) {
    const r = result.rect
    captureStyle = { top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 }
    const p = computeTooltipPos(r, tipW)
    tipStyle  = { top: p.top, left: p.left, width: tipW }
    arrowDir  = p.arrowDir
    arrowLeft = p.arrowLeft
  } else {
    tipStyle = fallbackTipStyle(tipW)
  }

  return (
    <>
      {/* When target found, ob-tap-capture's box-shadow darkens outside the highlight.
          Only fall back to the plain shade when target can't be located. */}
      {!result.found && <div className="ob-shade" />}
      {result.found && (
        <div className="ob-tap-capture" style={captureStyle} onClick={handleTap} />
      )}
      <div className="ob-tooltip" style={tipStyle}>
        <TooltipContent
          step={step} stepNum={stepNum} total={total}
          btnLabel={result.found ? t('obTapItBtn') : t('obNextBtn')}
          onBtn={handleTap}
          arrowDir={arrowDir} arrowLeft={arrowLeft}
        />
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — manages step index with localStorage persistence
// ─────────────────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const { dispatch, activeProfile } = useStore()
  const t = useLang()

  const [idx, setIdx] = useState(() => {
    const s = parseInt(localStorage.getItem(OB_STEP_KEY) || '0', 10)
    return isNaN(s) ? 0 : Math.min(s, STEPS.length - 1)
  })

  const step  = STEPS[idx]
  const total = STEPS.length

  // For spot/card steps that specify a view: auto-navigate
  // (tap steps navigate themselves when the user taps)
  useEffect(() => {
    if ((step.type === 'spot' || step.type === 'card') && step.view) {
      dispatch({ type: 'SET_VIEW', payload: step.view })
    }
    // tap steps: only navigate to `view` (to make target visible), not tapView
    if (step.type === 'tap' && step.view) {
      dispatch({ type: 'SET_VIEW', payload: step.view })
    }
  }, [idx]) // eslint-disable-line react-hooks/exhaustive-deps

  function done() {
    // Skipping or finishing either counts as "seen" — the tour never shows
    // again after this, in demo or in the user's real shop. Either way the
    // user stays exactly where they are (skipping in demo keeps them in the
    // demo shop — never bounce them back to the welcome screen).
    localStorage.removeItem(OB_STEP_KEY)
    localStorage.setItem(OB_DONE_KEY, '1')
    dispatch({ type: 'COMPLETE_ONBOARDING' })
    // Completing the demo tour hands off to DemoPractice for the practice sale
  }

  function next() {
    if (step.isLast || idx >= total - 1) { done(); return }
    const ni = idx + 1
    localStorage.setItem(OB_STEP_KEY, String(ni))
    setIdx(ni)
  }

  return (
    <>
      {/* Blocks all app interactions during the tour; only tour UI sits above this */}
      <div className="ob-blocker" />
      {!step.isLast && (
        <button className="ob-skip-btn" onClick={() => done()}>{t('obSkipTourBtn')}</button>
      )}

      {step.type === 'card' && (
        <CardStep
          step={step} stepNum={idx} total={total} onNext={next}
          btnOverride={step.isLast && activeProfile === 'demo' ? t('obTryPracticeSaleBtn') : null}
        />
      )}
      {step.type === 'spot' && (
        <SpotStep step={step} stepNum={idx} total={total} onNext={next} />
      )}
      {step.type === 'tap' && (
        <TapStep step={step} stepNum={idx} total={total} onNext={next} />
      )}
    </>
  )
}

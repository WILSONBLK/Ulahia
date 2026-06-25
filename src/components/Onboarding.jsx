import { useState, useEffect } from 'react'
import { useStore } from '../store.jsx'

const OB_STEP_KEY = 'ulahia-ob-step'
const OB_DONE_KEY = 'ulahia-ob-done'

const LANGS = [
  { code: 'en',     label: 'English', flag: '🇬🇧' },
  { code: 'pidgin', label: 'Pidgin',  flag: '🇳🇬' },
  { code: 'yo',     label: 'Yoruba',  flag: '🌿' },
  { code: 'ig',     label: 'Igbo',    flag: '🌿' },
  { code: 'ha',     label: 'Hausa',   flag: '🌿' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Step definitions
//
//  type 'language' – language-picker slide (step 0 only)
//  type 'card'     – full-screen coloured slide, no spotlight
//  type 'spot'     – spotlight on target + tooltip + "Next" button
//                    auto-navigates to `view` when step loads
//  type 'tap'      – spotlight on target + tooltip saying "tap it"
//                    user taps the highlighted element to advance (and navigate)
//                    optional `view` auto-navigates first so target is visible
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  // 0 — Language choice (always first)
  { type: 'language' },

  // 1 — Welcome card
  {
    type: 'card',
    color: '#087f5b',
    icon: '👋',
    title: 'Welcome to Ulahia!',
    body: "Let me walk you through every button and screen, one at a time.\n\nThis takes about 2 minutes. After that you will know exactly how to use the app.",
    btn: 'Show Me Around →',
  },

  // 2 — Home: Today's summary (auto-nav to home)
  {
    type: 'spot',
    view: 'home',
    target: '.home-today',
    icon: '📋',
    title: "Today's Summary",
    body: "This bar shows your total sales and profit for today.\n\nTap anywhere on it to see a full report — cash received, bank transfers, and how much was given on credit.",
  },

  // 3 — Home: 4 navigation tiles
  {
    type: 'spot',
    view: 'home',
    target: '.home-grid',
    icon: '🗂️',
    title: '4 Quick Tiles',
    body: "These 4 boxes are shortcuts:\n\n👥 Customers — who bought from you\n📋 Debts — who owes you money\n📦 Products — your goods and stock\n📊 Reports — your profit history\n\nTap any tile to go straight there.",
  },

  // 4 — Home: Settings row
  {
    type: 'spot',
    view: 'home',
    target: '.home-settings-row',
    icon: '⚙️',
    title: 'Settings Button',
    body: "Tap here to open Settings.\n\nYou can change your shop name, set a PIN to protect your data, find your Recovery Code, or download a backup of all your records.",
  },

  // 5 — Home: Header — language + theme buttons
  {
    type: 'spot',
    view: 'home',
    target: '.home-header',
    icon: '🌍',
    title: 'Language & Display',
    body: "The top bar has two useful controls:\n\n🌍 Language — tap the dropdown to switch between English, Pidgin, Yoruba, Igbo, Hausa.\n\n🔆 High Contrast & 🌙 Dark Mode buttons — tap them to make the screen easier to read.",
  },

  // 6 — TAP: Sell button → user taps it to go to sell screen
  {
    type: 'tap',
    view: 'home',
    target: '.home-sell-btn',
    tapView: 'sell',
    icon: '💰',
    title: 'The Sell Button',
    body: "Tap this when a customer is actively buying from you.\n\nYou gather their order, add the items one by one, then complete the sale. Think of it as your cashier screen.\n\n👆 Tap the button above to go to the Sell screen!",
  },

  // 7 — Sell: Search bar
  {
    type: 'spot',
    view: 'sell',
    target: '.pos-search',
    icon: '🔍',
    title: 'Search for a Product',
    body: "Type a product name here and the list filters immediately.\n\nFor example, type 'rice' and only rice products show. Very useful when you have many different goods.",
  },

  // 8 — Sell: Product rows
  {
    type: 'spot',
    view: 'sell',
    target: '.pos-product-row',
    fallback: true,
    icon: '📦',
    title: 'Product Rows',
    body: "Each row shows one product.\n\n• Tap '+ Add' to add it to your cart\n• Tap '−' and '+' to adjust quantity\n• Tap the number itself to type an exact amount\n• The green +₦ number shows your profit per unit",
  },

  // 9 — Sell: Pin button
  {
    type: 'spot',
    view: 'sell',
    target: '.pos-pin-btn',
    fallback: true,
    icon: '⭐',
    title: 'Pin Your Best Sellers',
    body: "See the ☆ star on the left of each product?\n\nTap it to PIN that product to the top of the list. Pin your most-sold items so you reach them instantly — no scrolling needed.",
  },

  // 10 — Card: Payment methods
  {
    type: 'card',
    color: '#1864ab',
    icon: '💳',
    title: 'How Did They Pay?',
    body: "When you tap SELL, a checkout window opens. You choose how the customer paid:\n\n💵 Cash — they paid with cash\n📲 Transfer — they sent to your bank\n📋 Credit — they will pay later (goes into Debts)\n\nYou can also split: part cash, part credit.",
    btn: 'Got it! Continue →',
  },

  // 11 — Card: Discounts and receipts
  {
    type: 'card',
    color: '#6741d9',
    icon: '🏷️',
    title: 'Discounts & Receipts',
    body: "In the checkout window there is a Discount section:\n\n• % Off — reduce by a percentage (e.g. 10% off)\n• ₦ Off — remove a fixed amount (e.g. ₦500 off)\n\nAfter every sale a receipt appears automatically. Send it to the customer on WhatsApp or download it as an image.",
    btn: 'Got it! Continue →',
  },

  // 12 — TAP: Products tab in bottom nav
  {
    type: 'tap',
    target: '.tabs-mobile button:nth-child(3)',
    tapView: 'products',
    icon: '📦',
    title: 'Go to Products',
    body: "Now let's explore your Products screen.\n\n👆 Tap the 📦 Products button above to go there!",
  },

  // 13 — Products: Add button
  {
    type: 'spot',
    view: 'products',
    target: '.screen-top-actions .button',
    icon: '➕',
    title: 'Add Product Button',
    body: "Tap here to add a new product.\n\nYou fill in:\n• Product name\n• Selling price (what you charge)\n• Cost price (what you paid)\n• Stock quantity\n• Low-stock alert level",
  },

  // 14 — Products: Stock bar
  {
    type: 'spot',
    view: 'products',
    target: '.prod-bar-wrap',
    fallback: true,
    icon: '📊',
    title: 'Stock Level Bars',
    body: "The coloured bar under each product shows stock level:\n\n🟢 Green — you have plenty\n🟡 Yellow — running low, restock soon!\n🔴 Red — out of stock\n\nWhen stock goes low, a warning banner also shows on your Home screen.",
  },

  // 15 — TAP: Customers tab in bottom nav
  {
    type: 'tap',
    target: '.tabs-mobile button:nth-child(4)',
    tapView: 'customers',
    icon: '👥',
    title: 'Go to Customers',
    body: "Now let's see who owes you money.\n\n👆 Tap the 👥 Customers button above!",
  },

  // 16 — Customers: Cards
  {
    type: 'spot',
    view: 'customers',
    target: '.cust-card',
    fallback: true,
    icon: '👥',
    title: 'Customer Cards',
    body: "Anyone who buys on Credit appears here automatically.\n\nEach card shows:\n• Name and amount owed\n• 'Paid' button — when they pay you back\n• 💬 WhatsApp button — sends an automatic reminder:\n\n'Hello [Name], you owe ₦[amount]. Kindly pay when you can.'",
  },

  // 17 — TAP: Reports tab in bottom nav
  {
    type: 'tap',
    target: '.tabs-mobile button:nth-child(5)',
    tapView: 'reports',
    icon: '📊',
    title: 'Go to Reports',
    body: "See your full profit history here.\n\n👆 Tap the 📊 Reports button above!",
  },

  // 18 — Reports: Period tabs
  {
    type: 'spot',
    view: 'reports',
    target: '.report-periods',
    icon: '📊',
    title: 'Report Period Buttons',
    body: "Tap these to change the time period:\n\n• Today — just today\n• This Week — last 7 days\n• This Month — the whole month\n• All Time — your complete history\n\nBelow you see totals, cash vs transfer vs credit, and your best-selling products.",
  },

  // 19 — TAP: Settings tab in bottom nav
  {
    type: 'tap',
    target: '.tabs-mobile button:nth-child(6)',
    tapView: 'settings',
    icon: '⚙️',
    title: 'Go to Settings',
    body: "Last stop — Settings!\n\n👆 Tap the ⚙️ Settings button above!",
  },

  // 20 — Settings: Recovery code
  {
    type: 'spot',
    view: 'settings',
    target: '[data-tour="cloud-section"]',
    fallback: true,
    icon: '🔑',
    title: 'Your Recovery Code',
    body: "Scroll down in Settings to find Cloud Backup. Your Recovery Code is shown there — a 6-letter code like 'AB3X9Z'.\n\n⚠️ WRITE IT DOWN or take a photo of it right now.\n\nIf you ever get a new phone, your phone number + this code is how you get ALL your data back.",
  },

  // 21 — Card: Going back
  {
    type: 'card',
    color: '#37474F',
    icon: '←',
    title: 'How to Go Back',
    body: "Whenever you open a form or detail page — like editing a product or viewing a customer — you will see a ← Back button at the top left of the screen.\n\nTap it to return without saving.\n\nOr tap 🏠 Home at the bottom to jump straight to your Home screen.",
    btn: 'Almost done! →',
  },

  // 22 — Done
  {
    type: 'card',
    color: '#087f5b',
    icon: '🎉',
    title: "You're Ready!",
    body: "You now know every button in Ulahia!\n\nTo get started:\n1️⃣ Tap Products → '+ Add Product'\n2️⃣ Add your goods with prices and stock\n3️⃣ Tap Sell when a customer buys\n\nUlahia tracks everything from there. Good luck! 🚀",
    btn: '🚀 Start Using Ulahia!',
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
// Language picker slide
// ─────────────────────────────────────────────────────────────────────────────
function LanguageStep({ stepNum, total, onNext }) {
  const { state, dispatch } = useStore()
  return (
    <div className="ob-card" style={{ '--ob-color': '#087f5b' }}>
      <div className="ob-lang-wrap">
        <span className="ob-counter ob-counter--card">{stepNum + 1} / {total}</span>
        <div className="ob-card-icon">🌍</div>
        <h2 className="ob-card-title">Choose Your Language</h2>
        <p className="ob-lang-sub">Pick the language you are most comfortable with. You can change it any time.</p>
        <div className="ob-lang-list">
          {LANGS.map(l => (
            <button
              key={l.code}
              className={`ob-lang-btn${state.language === l.code ? ' ob-lang-btn--active' : ''}`}
              onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: l.code })}
            >
              <span className="ob-lang-flag">{l.flag}</span>
              <span className="ob-lang-name">{l.label}</span>
              {state.language === l.code && <span className="ob-lang-check">✓</span>}
            </button>
          ))}
        </div>
        <button className="ob-card-btn" onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-screen card slide
// ─────────────────────────────────────────────────────────────────────────────
function CardStep({ step, stepNum, total, onNext }) {
  return (
    <div className="ob-card" style={{ '--ob-color': step.color }}>
      <div className="ob-card-inner">
        <span className="ob-counter ob-counter--card">{stepNum + 1} / {total}</span>
        <div className="ob-card-icon">{step.icon}</div>
        <h2 className="ob-card-title">{step.title}</h2>
        <p className="ob-card-body">{step.body}</p>
        <button className="ob-card-btn" onClick={onNext}>
          {step.btn || 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip inner content (shared between spot and tap steps)
// ─────────────────────────────────────────────────────────────────────────────
function TooltipContent({ step, stepNum, total, btnLabel, onBtn, arrowDir, arrowLeft }) {
  return (
    <>
      {arrowDir && (
        <div className={`ob-arrow ob-arrow--${arrowDir}`} style={{ left: arrowLeft }} />
      )}
      <div className="ob-tip-scroll">
        <span className="ob-counter">{stepNum + 1} / {total}</span>
        <div className="ob-tip-icon">{step.icon}</div>
        <h3 className="ob-tip-title">{step.title}</h3>
        <p className="ob-tip-body">{step.body}</p>
      </div>
      <button className="ob-tip-next" onClick={onBtn}>{btnLabel}</button>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Spot step — dimmed backdrop + tooltip with arrow + "Got it! Next →"
// ─────────────────────────────────────────────────────────────────────────────
function SpotStep({ step, stepNum, total, onNext }) {
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
          btnLabel="Got it! Next →"
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
      {/* Shade everything then let the capture div punch the spotlight hole */}
      <div className="ob-shade" />
      {result.found && (
        <div className="ob-tap-capture" style={captureStyle} onClick={handleTap} />
      )}
      <div className="ob-tooltip" style={tipStyle}>
        <TooltipContent
          step={step} stepNum={stepNum} total={total}
          btnLabel={result.found ? '👆 Tap it to continue' : 'Next →'}
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
  const { dispatch } = useStore()

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
    localStorage.removeItem(OB_STEP_KEY)
    localStorage.setItem(OB_DONE_KEY, '1')
    dispatch({ type: 'COMPLETE_ONBOARDING' })
  }

  function next() {
    if (step.isLast || idx >= total - 1) { done(); return }
    const ni = idx + 1
    localStorage.setItem(OB_STEP_KEY, String(ni))
    setIdx(ni)
  }

  return (
    <>
      {!step.isLast && (
        <button className="ob-skip-btn" onClick={done}>Skip tour</button>
      )}

      {step.type === 'language' && (
        <LanguageStep stepNum={idx} total={total} onNext={next} />
      )}
      {step.type === 'card' && (
        <CardStep step={step} stepNum={idx} total={total} onNext={next} />
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

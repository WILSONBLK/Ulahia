import { useState, useEffect } from 'react'
import { useStore } from '../store.jsx'

const OB_STEP_KEY = 'ulahia-ob-step'
const OB_DONE_KEY = 'ulahia-ob-done'

// ─────────────────────────────────────────────────────────────────────────────
// Step definitions
// type 'card'  → full-screen coloured slide
// type 'spot'  → spotlight on a DOM element + tooltip with arrow
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  // 0 ─ Welcome
  {
    type: 'card',
    color: '#087f5b',
    icon: '👋',
    title: 'Welcome to Ulahia!',
    body: 'Let me show you every button and screen, one at a time.\n\nThis takes about 2 minutes. After that you will know exactly how to use the app.',
    btn: 'Show Me Around →',
  },

  // 1 ─ Home: Big Sell button
  {
    type: 'spot',
    view: 'home',
    target: '.home-sell-btn',
    icon: '💰',
    title: 'The Sell Button',
    body: 'This is your most important button.\n\nEvery time a customer buys something — tap this. It takes you to the sell screen where you record what they bought and how they paid.',
  },

  // 2 ─ Home: Today summary bar
  {
    type: 'spot',
    view: 'home',
    target: '.home-today',
    icon: '📋',
    title: "Today's Summary",
    body: 'This bar shows your total sales and profit for today.\n\nTap anywhere on it to see a full close-of-day report — cash received, bank transfers, and how much was given on credit.',
  },

  // 3 ─ Home: 4 navigation tiles
  {
    type: 'spot',
    view: 'home',
    target: '.home-grid',
    icon: '🗂️',
    title: '4 Quick Tiles',
    body: 'These tiles are shortcuts:\n\n👥 Customers — who bought from you\n📋 Debts — who owes you money\n📦 Products — your goods and stock\n📊 Reports — your profit history\n\nTap any tile to go straight there.',
  },

  // 4 ─ Home: Settings row
  {
    type: 'spot',
    view: 'home',
    target: '.home-settings-row',
    icon: '⚙️',
    title: 'Settings Button',
    body: 'Tap here to open Settings where you can:\n\n• Change your shop name or phone number\n• Set a PIN to protect your data\n• Find your Recovery Code\n• Download a backup of all your data',
  },

  // 5 ─ Home: Language selector
  {
    type: 'spot',
    view: 'home',
    target: '.home-lang',
    icon: '🌍',
    title: 'Language Selector',
    body: 'Tap this to switch Ulahia to your language:\n\nPidgin · English · Yoruba · Igbo · Hausa\n\nThe entire app switches to that language immediately.',
  },

  // 6 ─ Home: Theme toggles
  {
    type: 'spot',
    view: 'home',
    target: '.theme-toggles',
    icon: '🌙',
    title: 'Display Modes',
    body: '🔆 High Contrast — makes text much bigger and bolder. Great for reading in bright sunlight or if small text is hard to see.\n\n🌙 Dark Mode — turns the screen dark. Easier on your eyes at night or in dim places.',
  },

  // 7 ─ Bottom nav
  {
    type: 'spot',
    view: 'home',
    target: '.tabs-mobile',
    icon: '📱',
    title: 'Bottom Navigation Bar',
    body: 'These 6 buttons are ALWAYS at the bottom, no matter which screen you are on:\n\n🏠 Home  💰 Sell  📦 Products\n👥 Customers  📊 Reports  ⚙️ Settings\n\nTap any one to jump there instantly.',
  },

  // 8 ─ POS: Search bar
  {
    type: 'spot',
    view: 'sell',
    target: '.pos-search',
    icon: '🔍',
    title: 'Search Bar',
    body: 'Type a product name here and the list filters immediately.\n\nFor example, type "rice" and only rice products show. Very useful when you have many different goods.',
  },

  // 9 ─ POS: Product row
  {
    type: 'spot',
    view: 'sell',
    target: '.pos-product-row',
    fallback: true,
    icon: '📦',
    title: 'Product Rows',
    body: 'Each row shows one product you sell.\n\n• Tap "+ Add" to put it in your cart\n• Tap "−" or "+" to adjust the quantity\n• Tap the number itself to type an exact quantity\n• The green +₦ shows your profit per item sold',
  },

  // 10 ─ POS: Pin button
  {
    type: 'spot',
    view: 'sell',
    target: '.pos-pin-btn',
    fallback: true,
    icon: '⭐',
    title: 'Pin Your Best Sellers',
    body: 'See the ☆ star on each product?\n\nTap it to PIN that product to the very top of the list.\n\nPin the items you sell most often so you can reach them with one tap — no scrolling needed.',
  },

  // 11 ─ Payment methods card
  {
    type: 'card',
    color: '#1864ab',
    icon: '💳',
    title: 'How Did They Pay?',
    body: 'When you tap SELL, a checkout window opens. You choose how the customer paid:\n\n💵 Cash — they paid with cash\n📲 Transfer — they sent money to your bank\n📋 Credit — they will pay later (goes into Debts)\n\nYou can also split the payment — part cash, part credit.',
    btn: 'Got it! Continue →',
  },

  // 12 ─ Discounts and receipts card
  {
    type: 'card',
    color: '#6741d9',
    icon: '🏷️',
    title: 'Discounts & Receipts',
    body: 'Inside the checkout window, there is a Discount section:\n\n• % Off — reduce by a percentage (e.g. 10% off)\n• ₦ Off — remove a fixed amount (e.g. ₦500 off)\n\nAfter every sale, a receipt appears automatically. You can send it to the customer on WhatsApp or download it as an image.',
    btn: 'Got it! Continue →',
  },

  // 13 ─ Products: Add button
  {
    type: 'spot',
    view: 'products',
    target: '.screen-top-actions .button',
    icon: '➕',
    title: 'Add Product Button',
    body: 'Tap here to add a new product to your shop.\n\nYou will fill in:\n• Product name (e.g. Rice 50kg)\n• Selling price — what you charge customers\n• Cost price — what you paid for it\n• Current stock quantity\n• Low-stock alert level',
  },

  // 14 ─ Products: Stock bar
  {
    type: 'spot',
    view: 'products',
    target: '.prod-bar-wrap',
    fallback: true,
    icon: '📊',
    title: 'Stock Level Bars',
    body: 'The coloured bar under each product shows how much stock is left:\n\n🟢 Green — you have plenty\n🟡 Yellow — running low, time to restock!\n🔴 Red — out of stock\n\nWhen a product goes yellow or red, a warning banner also appears on your Home screen.',
  },

  // 15 ─ Customers
  {
    type: 'spot',
    view: 'customers',
    target: '.cust-card',
    fallback: true,
    icon: '👥',
    title: 'Customer Cards',
    body: 'Everyone who buys on Credit appears here automatically.\n\nEach card shows:\n• Name and amount owed\n• "Paid" button — tap when they pay you back\n• 💬 WhatsApp button — sends them an automatic payment reminder\n\n"Hello [Name], you owe ₦[amount]. Please pay when you can."',
  },

  // 16 ─ Reports
  {
    type: 'spot',
    view: 'reports',
    target: '.report-periods',
    icon: '📊',
    title: 'Report Period Buttons',
    body: 'Tap these to change the time period:\n\n• Today — just today\n• This Week — last 7 days\n• This Month — the whole month\n• All Time — your full history\n\nBelow you see totals, cash vs transfer vs credit breakdown, and your best-selling products.',
  },

  // 17 ─ Settings: Recovery code
  {
    type: 'spot',
    view: 'settings',
    target: '[data-tour="cloud-section"]',
    fallback: true,
    icon: '🔑',
    title: 'Your Recovery Code',
    body: 'Scroll down in Settings to find Cloud Backup. Your Recovery Code is shown there — a 6-letter code like "AB3X9Z".\n\n⚠️ WRITE IT DOWN or take a photo of it.\n\nIf you ever get a new phone, you use your phone number + this code to get ALL your data back. Without it, your data cannot be recovered.',
  },

  // 18 ─ Going back card
  {
    type: 'card',
    color: '#37474F',
    icon: '←',
    title: 'How to Go Back',
    body: 'Whenever you open a form or detail page — like editing a product or viewing a customer — you will see a ← Back button at the top left.\n\nTap it to return without saving.\n\nOr just tap the 🏠 Home button at the bottom to go straight back to your Home screen.',
    btn: 'Almost done! →',
  },

  // 19 ─ Done
  {
    type: 'card',
    color: '#087f5b',
    icon: '🎉',
    title: "You're Ready!",
    body: 'You now know every button in Ulahia!\n\nTo get started:\n1️⃣ Tap Products → "+ Add Product"\n2️⃣ Add all your goods with prices and stock\n3️⃣ Tap Sell whenever a customer buys\n\nUlahia tracks everything from there. Good luck!',
    btn: '🚀 Start Using Ulahia!',
    isLast: true,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hook: measures a DOM element's bounding rect after a short delay
// ─────────────────────────────────────────────────────────────────────────────
function useTargetRect(selector) {
  const [result, setResult] = useState(null) // null = measuring

  useEffect(() => {
    setResult(null)
    const t = setTimeout(() => {
      const el = selector ? document.querySelector(selector) : null
      if (el) {
        setResult({ found: true, rect: el.getBoundingClientRect() })
      } else {
        setResult({ found: false })
      }
    }, 260)
    return () => clearTimeout(t)
  }, [selector])

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Compute tooltip position relative to target rect
// ─────────────────────────────────────────────────────────────────────────────
function computeTooltipPos(rect, tipW) {
  const vh = window.innerHeight
  const vw = window.innerWidth
  const PAD = 14
  const ARROW_H = 13
  const TIP_H_EST = 290

  const spaceBelow = vh - rect.bottom - PAD
  const spaceAbove = rect.top - PAD
  const goAbove = spaceBelow < TIP_H_EST && spaceAbove > spaceBelow

  let top, arrowDir
  if (goAbove) {
    top = Math.max(PAD, rect.top - TIP_H_EST - ARROW_H)
    arrowDir = 'down'
  } else {
    top = Math.min(vh - TIP_H_EST - PAD, rect.bottom + ARROW_H)
    arrowDir = 'up'
  }

  let left = rect.left + rect.width / 2 - tipW / 2
  left = Math.max(PAD, Math.min(left, vw - tipW - PAD))

  const arrowLeft = Math.max(18, Math.min(
    rect.left + rect.width / 2 - left - 13,
    tipW - 44
  ))

  return { top, left, arrowDir, arrowLeft }
}

// ─────────────────────────────────────────────────────────────────────────────
// Spot step — spotlight + arrow tooltip
// ─────────────────────────────────────────────────────────────────────────────
function SpotStep({ step, stepNum, total, onNext }) {
  const result = useTargetRect(step.target)
  const tipW = Math.min(320, window.innerWidth - 28)

  if (!result) {
    // Still measuring — show the shade but no tooltip yet
    return <div className="ob-shade" />
  }

  let spotStyle = null
  let tipStyle, arrowDir = null, arrowLeft = tipW / 2 - 13

  if (result.found) {
    const r = result.rect
    spotStyle = { top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 }
    const p = computeTooltipPos(r, tipW)
    tipStyle = { top: p.top, left: p.left, width: tipW }
    arrowDir = p.arrowDir
    arrowLeft = p.arrowLeft
  } else {
    // Fallback: tooltip above bottom nav, centred
    const vh = window.innerHeight
    const vw = window.innerWidth
    tipStyle = { top: vh - 90 - 300, left: Math.max(14, vw / 2 - tipW / 2), width: tipW }
  }

  return (
    <>
      {result.found
        ? <div className="ob-spotlight" style={spotStyle} />
        : <div className="ob-shade" />
      }

      <div className="ob-tooltip" style={tipStyle}>
        {arrowDir && (
          <div className={`ob-arrow ob-arrow--${arrowDir}`} style={{ left: arrowLeft }} />
        )}
        <span className="ob-counter">{stepNum + 1} / {total}</span>
        <div className="ob-tip-icon">{step.icon}</div>
        <h3 className="ob-tip-title">{step.title}</h3>
        <p className="ob-tip-body">{step.body}</p>
        <button className="ob-tip-next" onClick={onNext}>
          Got it! Next →
        </button>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Card step — full-screen coloured slide
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
// Root — manages step, persists to localStorage so remounts don't restart it
// ─────────────────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const { dispatch } = useStore()

  const [idx, setIdx] = useState(() => {
    const saved = parseInt(localStorage.getItem(OB_STEP_KEY) || '0', 10)
    return isNaN(saved) ? 0 : Math.min(saved, STEPS.length - 1)
  })

  const step = STEPS[idx]
  const total = STEPS.length

  // Navigate the real app to the right screen for each spot step
  useEffect(() => {
    if (step.view) {
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
      {step.type === 'card'
        ? <CardStep step={step} stepNum={idx} total={total} onNext={next} />
        : <SpotStep step={step} stepNum={idx} total={total} onNext={next} />
      }
    </>
  )
}

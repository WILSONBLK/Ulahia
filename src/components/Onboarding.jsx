import { useEffect, useState } from 'react'
import { useStore } from '../store.jsx'

// ─────────────────────────────────────────────────────────────────────────────
// Steps definition
// type 'card'  → full-screen slide (no real app behind it)
// type 'live'  → bottom-sheet overlay over the real app (navigates to `view`)
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  // 1 — Welcome
  {
    type: 'card',
    color: '#087f5b',
    icon: '👋',
    title: 'Welcome to Ulahia!',
    body: 'I am going to teach you everything you need to know, step by step.\n\nThis will take about 2 minutes. Let\'s go!',
    btn: 'Start the Tour →',
  },

  // 2 — Home screen live
  {
    type: 'live',
    view: 'home',
    icon: '🏠',
    title: 'This is Your Home Screen',
    body: 'Every morning, open Ulahia here. You will see how much money you made today, your profit, and how many sales you recorded.\n\nTap the summary bar to see a full close-of-day report.',
  },

  // 3 — Language switcher
  {
    type: 'live',
    view: 'home',
    icon: '🌍',
    title: 'Change Your Language',
    body: 'Do you see the language button at the top right of the Home screen?\n\nTap it to switch between English, Pidgin, Yoruba, Igbo, and Hausa. Ulahia speaks YOUR language!',
  },

  // 4 — Dark mode
  {
    type: 'live',
    view: 'home',
    icon: '🌙',
    title: 'Make It Easier on Your Eyes',
    body: 'Tap the 🌙 button to turn on Dark Mode — it makes the screen darker, which is easier to read in the evening.\n\nTap 🔆 for High Contrast mode — the text becomes very bold and clear.',
  },

  // 5 — Bottom nav card
  {
    type: 'card',
    color: '#0077B6',
    icon: '📱',
    title: 'The Buttons at the Bottom',
    body: 'See the row of buttons at the very bottom?\n\n🏠 Home — your daily summary\n💰 Sell — make a sale\n📦 Products — your goods\n👥 Customers — who owes you\n📊 Reports — your profit history\n⚙️ Settings — your account\n\nTap any one to go there instantly.',
    btn: 'Got it! Continue →',
  },

  // 6 — POS screen live
  {
    type: 'live',
    view: 'sell',
    icon: '💰',
    title: 'Making a Sale',
    body: 'This is where you record every sale.\n\nYou will see all your products listed here. TAP a product to add it to your cart. The number next to it shows how many you are selling.\n\nYou can tap a product many times to add more pieces.',
  },

  // 7 — Search and pin
  {
    type: 'live',
    view: 'sell',
    icon: '🔍',
    title: 'Find Products Fast',
    body: 'Have many products? Type a few letters in the search box at the top and the list will filter immediately.\n\nTap the ☆ star next to a product to PIN it — pinned products always show at the top so you can reach them faster.',
  },

  // 8 — Cart and checkout
  {
    type: 'live',
    view: 'sell',
    icon: '🛒',
    title: 'Your Cart & Checking Out',
    body: 'Once you tap some products, they appear in the cart on the right side (or below on small phones).\n\nTap a quantity number in the cart to type the exact amount.\n\nWhen ready, tap the big green SELL button to complete the sale.',
  },

  // 9 — Payment methods card
  {
    type: 'card',
    color: '#2D6A4F',
    icon: '💳',
    title: 'How Did They Pay?',
    body: 'When you tap SELL, you choose how the customer paid:\n\n💵 Cash — they gave you cash\n📲 Transfer — they sent money to your account\n📋 Credit — they will pay later (goes into Customers)\n\nYou can also split! For example: part cash and part credit.',
    btn: 'Next →',
  },

  // 10 — Discounts
  {
    type: 'card',
    color: '#6D2B8C',
    icon: '🏷️',
    title: 'Giving a Discount',
    body: 'Inside the checkout window, look for the Discount section.\n\nTap % Off to reduce by a percentage (e.g. 10% off).\nTap ₦ Off to remove a fixed amount (e.g. ₦500 off).\n\nUlahia will show the new total and how much the customer is saving.',
    btn: 'Next →',
  },

  // 11 — Receipt
  {
    type: 'card',
    color: '#1A6B4A',
    icon: '🧾',
    title: 'Sending a Receipt',
    body: 'After every sale, a receipt appears automatically.\n\nYou can:\n📤 Share it on WhatsApp — the customer gets a picture of their receipt\n💾 Download it as an image\n\nThe receipt shows all the items, the total, and your shop name.',
    btn: 'Next →',
  },

  // 12 — Products screen
  {
    type: 'live',
    view: 'products',
    icon: '📦',
    title: 'Managing Your Products',
    body: 'Here you add, edit, and delete your products.\n\nTap + Add Product to add a new item. Fill in:\n• Product name\n• Selling price\n• Cost price (what you paid for it)\n• How many you have (quantity)\n• Low-stock alert level\n\nUlahia uses these to track your profit automatically.',
  },

  // 13 — Low stock
  {
    type: 'live',
    view: 'products',
    icon: '⚠️',
    title: 'Low Stock Alerts',
    body: 'See the coloured bars under each product?\n\n🔴 Red bar = out of stock\n🟡 Yellow bar = running low (check this!)\n🟢 Green bar = you have enough\n\nWhen a product goes low, a red banner also appears on your Home screen to remind you to restock.',
  },

  // 14 — Customers screen
  {
    type: 'live',
    view: 'customers',
    icon: '👥',
    title: 'People Who Owe You',
    body: 'Every time you sell on Credit, the customer\'s name and amount appears here automatically.\n\nYou can see:\n• How much each person owes\n• Their total debt\n• A history of all their purchases\n\nWhen they pay, tap Mark as Paid.',
  },

  // 15 — WhatsApp reminder
  {
    type: 'live',
    view: 'customers',
    icon: '📲',
    title: 'Send a WhatsApp Reminder',
    body: 'For each customer who owes you, there is a WhatsApp button.\n\nTap it and a pre-written message will open in WhatsApp:\n\n"Hello [Name], this is a reminder that you owe ₦[amount]. Kindly pay when you can. Thank you!"\n\nYou just tap Send — no typing needed!',
  },

  // 16 — Reports
  {
    type: 'live',
    view: 'reports',
    icon: '📊',
    title: 'Your Business Reports',
    body: 'Reports show you the full picture of your business.\n\n• Today — what you made today\n• This Week — the last 7 days\n• This Month — the full month\n\nYou can see total sales, total profit, how many transactions, and which products sold the most.',
  },

  // 17 — Settings / recovery code
  {
    type: 'live',
    view: 'settings',
    icon: '⚙️',
    title: 'Your Settings & Recovery Code',
    body: 'In Settings, you can change your shop name, PIN code, and see your Recovery Code.\n\n🔑 Your Recovery Code is VERY IMPORTANT. Write it down and keep it safe.\n\nIf you get a new phone, you use your phone number + Recovery Code to get all your data back.',
  },

  // 18 — Going back
  {
    type: 'card',
    color: '#37474F',
    icon: '←',
    title: 'How to Go Back',
    body: 'On any inner page (like when editing a product), you will see a ← Back button at the top left.\n\nTap it to return to the previous screen.\n\nOr just tap the Home button at the bottom to go straight to your Home screen.',
    btn: 'Almost done! →',
  },

  // 19 — Done!
  {
    type: 'card',
    color: '#087f5b',
    icon: '🎉',
    title: 'You Are Ready!',
    body: 'You now know everything about Ulahia.\n\nHere is how to begin:\n1️⃣ Go to Products and add your items\n2️⃣ Go to Sell when a customer buys something\n3️⃣ Check Home every morning to see your progress\n\nWelcome to your new shop book!',
    btn: '🚀 Let\'s Start!',
    isLast: true,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Card step — full screen
// ─────────────────────────────────────────────────────────────────────────────
function CardStep({ step, stepNum, total, onNext }) {
  return (
    <div className="ob-card" style={{ '--ob-color': step.color }}>
      <div className="ob-card-inner">
        <div className="ob-step-dots">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`ob-dot ${i === stepNum ? 'ob-dot--active' : ''}`} />
          ))}
        </div>
        <div className="ob-card-icon">{step.icon}</div>
        <h2 className="ob-card-title">{step.title}</h2>
        <p className="ob-card-body">{step.body}</p>
        <button className="button ob-next-btn" onClick={onNext}>
          {step.btn || 'Next →'}
        </button>
        <div className="ob-step-label">{stepNum + 1} of {total}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Live step — bottom sheet over real app
// ─────────────────────────────────────────────────────────────────────────────
function LiveStep({ step, stepNum, total, onNext }) {
  return (
    <div className="ob-live-overlay">
      <div className="ob-backdrop" />
      <div className="ob-sheet">
        <div className="ob-step-dots ob-sheet-dots">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`ob-dot ${i === stepNum ? 'ob-dot--active' : ''}`} />
          ))}
        </div>
        <div className="ob-sheet-icon">{step.icon}</div>
        <h3 className="ob-sheet-title">{step.title}</h3>
        <p className="ob-sheet-body">{step.body}</p>
        <button className="button ob-next-btn" onClick={onNext}>
          {stepNum === total - 1 ? '🚀 Let\'s Start!' : 'Got it! Next →'}
        </button>
        <div className="ob-step-label">{stepNum + 1} of {total}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — manages step index, navigates real app, renders overlay
// ─────────────────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const { dispatch } = useStore()
  const [idx, setIdx] = useState(0)

  const step = STEPS[idx]
  const total = STEPS.length

  // Navigate the real app whenever a live step becomes active
  useEffect(() => {
    if (step.type === 'live' && step.view) {
      dispatch({ type: 'SET_VIEW', payload: step.view })
    }
  }, [idx])  // eslint-disable-line react-hooks/exhaustive-deps

  function next() {
    if (idx >= total - 1 || STEPS[idx].isLast) {
      dispatch({ type: 'COMPLETE_ONBOARDING' })
      return
    }
    setIdx(i => i + 1)
  }

  function skip() {
    dispatch({ type: 'COMPLETE_ONBOARDING' })
  }

  return (
    <>
      {/* Skip button always visible */}
      {!STEPS[idx].isLast && (
        <button className="ob-skip-btn" onClick={skip}>
          Skip tour
        </button>
      )}

      {step.type === 'card'
        ? <CardStep step={step} stepNum={idx} total={total} onNext={next} />
        : <LiveStep step={step} stepNum={idx} total={total} onNext={next} />
      }
    </>
  )
}

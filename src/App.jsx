import { useState, useEffect } from 'react'
import { useStore } from './store.jsx'
import { useOnline } from './useOnline.js'
import { useLang } from './useLang.js'
import TopBar from './components/TopBar.jsx'
import LandingAuth from './components/LandingAuth.jsx'
import Onboarding from './components/Onboarding.jsx'
import Home from './components/Home.jsx'
import POSScreen from './components/POSScreen.jsx'
import ReviewSale from './components/ReviewSale.jsx'
import Customers from './components/Customers.jsx'
import CustomerProfile from './components/CustomerProfile.jsx'
import Products from './components/Products.jsx'
import Reports from './components/Reports.jsx'
import Expenses from './components/Expenses.jsx'
import Settings from './components/Settings.jsx'
import BulkRestock from './components/BulkRestock.jsx'
import BottomNav from './components/BottomNav.jsx'
import DemoPractice from './components/DemoPractice.jsx'
import Help from './components/Help.jsx'
import More from './components/More.jsx'
import Notifications from './components/Notifications.jsx'
import Logout from './components/Logout.jsx'
import LockScreen from './components/LockScreen.jsx'
import { TOUR_SEEN_KEY } from './utils.js'

const VIEWS = {
  home: Home,
  sell: POSScreen,
  review: ReviewSale,
  customers: Customers,
  customer: CustomerProfile,
  debts: Customers,
  products: Products,
  reports: Reports,
  expenses: Expenses,
  settings: Settings,
  help: Help,
  more: More,
  logout: Logout,
  notifications: Notifications,
  'bulk-restock': BulkRestock,
}

const UNLOCK_KEY = 'ulahia-unlocked'

export default function App() {
  const { state, activeProfile, switchProfile } = useStore()
  const online = useOnline()
  const t = useLang()
  const [, bumpLock] = useState(0)

  // Mirror theme classes onto <body> so portalled UI (modals, toasts, PIN gate)
  // rendered outside the .app div picks up dark / high-contrast tokens too.
  useEffect(() => {
    document.body.classList.toggle('app--dark', !!(state.setupDone && state.darkMode))
    document.body.classList.toggle('app--hc', !!(state.setupDone && state.highContrast))
  }, [state.setupDone, state.darkMode, state.highContrast])

  if (!state.setupDone) return <LandingAuth />
  if (activeProfile === 'main' && state.setupDone && state.loggedOut) return <LandingAuth initialPhase="login" />

  // Password lock on app open (per browser session). Signup/login set the
  // flag themselves, so it only triggers on a genuine cold open. Demo never locks.
  const unlocked = sessionStorage.getItem(UNLOCK_KEY) === '1'
  if (activeProfile === 'main' && state.auth?.passwordHash && !unlocked) {
    return <LockScreen onUnlock={() => { sessionStorage.setItem(UNLOCK_KEY, '1'); bumpLock(n => n + 1) }} />
  }

  const View = VIEWS[state.view] || Home
  const isHome = state.view === 'home'
  const isPOS = state.view === 'sell'
  const isReview = state.view === 'review'

  const appClass = [
    'app',
    state.darkMode ? 'app--dark' : '',
    state.highContrast ? 'app--hc' : '',
  ].filter(Boolean).join(' ')

  const offlineBanner = !online && (
    <div className="offline is-visible">
      {t('offline')}
      <button className="button light" onClick={() => window.location.reload()}>{t('tryAgain')}</button>
    </div>
  )

  // Check both store flag and localStorage so the tour never repeats
  // even if the component tree remounts for any reason
  const showOnboarding =
    !state.onboardingDone &&
    localStorage.getItem(TOUR_SEEN_KEY) !== '1'

  // Single return keeps <Onboarding /> at a stable tree position so React
  // never unmounts/remounts it when the view changes (which would reset step state)
  const demoBanner = activeProfile === 'demo' && !showOnboarding && (
    <div className="demo-banner">
      <span>🎮 {t('demoModeBanner')}</span>
      <button className="demo-banner-exit" onClick={() => switchProfile('main')}>{t('exitDemo')}</button>
    </div>
  )

  return (
    <div className={appClass}>
      {offlineBanner}
      {demoBanner}

      {(isHome || isPOS || isReview)
        ? <View />
        : (
          <>
            <TopBar />
            <div className="layout">
              <main className="main view-enter">
                <View />
              </main>
            </div>
          </>
        )
      }

      <BottomNav />
      {showOnboarding && <Onboarding />}
      {activeProfile === 'demo' && state.onboardingDone && !state.practiceDone && <DemoPractice />}
    </div>
  )
}

import { useStore } from './store.jsx'
import { useOnline } from './useOnline.js'
import { useLang } from './useLang.js'
import TopBar from './components/TopBar.jsx'
import LandingAuth from './components/LandingAuth.jsx'
import Onboarding from './components/Onboarding.jsx'
import Home from './components/Home.jsx'
import POSScreen from './components/POSScreen.jsx'
import Customers from './components/Customers.jsx'
import Products from './components/Products.jsx'
import Reports from './components/Reports.jsx'
import Settings from './components/Settings.jsx'
import BulkRestock from './components/BulkRestock.jsx'
import BottomNav from './components/BottomNav.jsx'

const VIEWS = {
  home: Home,
  sell: POSScreen,
  customers: Customers,
  debts: Customers,
  products: Products,
  reports: Reports,
  settings: Settings,
  'bulk-restock': BulkRestock,
}

export default function App() {
  const { state } = useStore()
  const online = useOnline()
  const t = useLang()

  if (!state.setupDone) return <LandingAuth />

  const View = VIEWS[state.view] || Home
  const isHome = state.view === 'home'
  const isPOS = state.view === 'sell'

  const appClass = [
    'app',
    state.darkMode ? 'app--dark' : '',
    state.highContrast ? 'app--hc' : '',
  ].filter(Boolean).join(' ')

  const offlineBanner = !online && (
    <div className="offline is-visible">
      {t('offline')}
      <button className="button light" onClick={() => window.location.reload()}>Try again</button>
    </div>
  )

  // Check both store flag and localStorage so the tour never repeats
  // even if the component tree remounts for any reason
  const showOnboarding =
    !state.onboardingDone &&
    localStorage.getItem('ulahia-ob-done') !== '1'

  // Single return keeps <Onboarding /> at a stable tree position so React
  // never unmounts/remounts it when the view changes (which would reset step state)
  return (
    <div className={appClass}>
      {offlineBanner}

      {(isHome || isPOS)
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
    </div>
  )
}

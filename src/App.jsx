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

  const onboarding = !state.onboardingDone && <Onboarding />

  // Home and POS handle their own headers
  if (isHome || isPOS) {
    return (
      <div className={appClass}>
        {offlineBanner}
        <View />
        <BottomNav />
        {onboarding}
      </div>
    )
  }

  return (
    <div className={appClass}>
      {offlineBanner}
      <TopBar />
      <div className="layout">
        <main className="main view-enter">
          <View />
        </main>
      </div>
      <BottomNav />
      {onboarding}
    </div>
  )
}

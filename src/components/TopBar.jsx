import { useStore } from '../store.jsx'
import { useLang } from '../useLang.js'

const TITLE_KEYS = {
  customers: 'navCustomers',
  customer: 'navCustomers',
  debts: 'navDebts',
  products: 'navProducts',
  reports: 'navReports',
  expenses: 'navExpenses',
  settings: 'navSettings',
  help: 'navHelp',
  more: 'navMore',
  logout: 'navLogout',
  notifications: 'navNotifications',
}

export default function TopBar() {
  const { state, dispatch } = useStore()
  const t = useLang()

  // Detail views go back to their parent list; everything else to Home.
  const BACK_TO = { customer: 'customers' }
  const title = TITLE_KEYS[state.view] ? t(TITLE_KEYS[state.view]) : ''

  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar-back"
        onClick={() => dispatch({ type: 'SET_VIEW', payload: BACK_TO[state.view] || 'home' })}
        aria-label={t('laBackBtn')}
      >
        ←
      </button>
      <strong className="topbar-title" title={title}>{title}</strong>
      {/* Balances the back button so the title stays centred */}
      <span className="topbar-spacer" aria-hidden="true" />
    </header>
  )
}

import { useStore } from '../store.jsx'
import { useStats } from '../useStats.js'
import { useLang } from '../useLang.js'
import { IconHome, IconCart, IconBox, IconUsers, IconMore } from './icons.jsx'

// Views that live under the "More" tab
const MORE_VIEWS = ['more', 'reports', 'expenses', 'settings', 'help']

const TABS = [
  { view: 'home',      Icon: IconHome,  key: 'dashboard' },
  { view: 'products',  Icon: IconBox,   key: 'navProducts' },
  { view: 'sell',      Icon: IconCart,  key: 'sell', center: true },
  { view: 'customers', Icon: IconUsers, key: 'navCustomers' },
  { view: 'more',      Icon: IconMore,  key: 'navMore' },
]

export default function BottomNav() {
  const { state, dispatch } = useStore()
  const { cartCount } = useStats()
  const t = useLang()

  const active =
    state.view === 'debts' ? 'customers' :
    state.view === 'customer' ? 'customers' :
    state.view === 'bulk-restock' ? 'products' :
    MORE_VIEWS.includes(state.view) ? 'more' :
    state.view

  return (
    <nav className="tabs-mobile">
      {TABS.map(({ view, Icon, key, center }) => (
        <button
          type="button"
          key={view}
          className={[
            center ? 'nav-sell' : '',
            active === view ? 'is-active' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => dispatch({ type: 'SET_VIEW', payload: view })}
          aria-label={t(key)}
          aria-current={active === view ? 'page' : undefined}
        >
          <span className="nav-icon-wrap">
            <Icon size={center ? 26 : 22} />
            {view === 'sell' && cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </span>
          <span className="nav-label">{t(key)}</span>
        </button>
      ))}
    </nav>
  )
}

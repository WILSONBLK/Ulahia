import { useStore } from '../store.jsx'
import { useStats } from '../useStats.js'

const TABS = [
  { view: 'home',      icon: '🏠', label: 'Home' },
  { view: 'sell',      icon: '💰', label: 'Sell' },
  { view: 'products',  icon: '📦', label: 'Products' },
  { view: 'customers', icon: '👥', label: 'Customers' },
  { view: 'reports',   icon: '📊', label: 'Reports' },
]

export default function BottomNav() {
  const { state, dispatch } = useStore()
  const { cartCount } = useStats()

  const active = state.view === 'debts' ? 'customers' : state.view

  return (
    <nav className="tabs-mobile">
      {TABS.map(tab => (
        <button
          key={tab.view}
          className={active === tab.view ? 'is-active' : ''}
          onClick={() => dispatch({ type: 'SET_VIEW', payload: tab.view })}
        >
          <span className="nav-icon-wrap">
            <span className="nav-icon">{tab.icon}</span>
            {tab.view === 'sell' && cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

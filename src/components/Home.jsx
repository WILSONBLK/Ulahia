import { useStore } from '../store.jsx'
import { useStats } from '../useStats.js'
import { money } from '../utils.js'
import Logo from './Logo.jsx'
import { useLang } from '../useLang.js'

export default function Home() {
  const { state, dispatch } = useStore()
  const t = useLang()
  const { todaySales, todayProfit, cartCount, totalDebt, todayCount } = useStats()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('greetMorning') : hour < 17 ? t('greetAfternoon') : t('greetEvening')

  function go(view) {
    dispatch({ type: 'SET_VIEW', payload: view })
  }

  return (
    <div className="home-screen">

      {/* Header row */}
      <div className="home-header">
        <div className="home-brand">
          <Logo size={34} />
          <div>
            <strong className="home-brand-name">Ulahia</strong>
            <span className="home-shop-name">{state.shop.name}</span>
          </div>
        </div>
        <select
          className="select home-lang"
          value={state.language}
          onChange={e => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value })}
        >
          <option value="pidgin">Pidgin</option>
          <option value="en">English</option>
          <option value="yo">Yoruba</option>
          <option value="ig">Igbo</option>
          <option value="ha">Hausa</option>
        </select>
      </div>

      {/* Greeting */}
      <div className="home-greeting">
        <p>{greeting}, <strong>{state.shop.owner || state.shop.name}</strong> 👋</p>
      </div>

      {/* ── BIG SELL BUTTON ── */}
      <button className="home-sell-btn" onClick={() => go('sell')}>
        <span className="home-sell-icon">💰</span>
        <span className="home-sell-label">{t('newSale')}</span>
        {cartCount > 0 && (
          <span className="home-sell-sub">{cartCount} item{cartCount !== 1 ? 's' : ''} in cart — tap to continue</span>
        )}
      </button>

      {/* ── Navigation tiles ── */}
      <div className="home-grid">
        <button className="home-tile" onClick={() => go('customers')}>
          <span className="home-tile-icon">👥</span>
          <span className="home-tile-label">{t('navCustomers')}</span>
          <span className="home-tile-sub">{t('customersSub')}</span>
        </button>
        <button className="home-tile home-tile--debt" onClick={() => go('debts')}>
          <span className="home-tile-icon">📋</span>
          <span className="home-tile-label">{t('navDebts')}</span>
          {totalDebt > 0
            ? <span className="home-tile-sub home-tile-sub--bad">{money(totalDebt)} owed</span>
            : <span className="home-tile-sub">{t('debtsSub')}</span>
          }
        </button>
        <button className="home-tile" onClick={() => go('products')}>
          <span className="home-tile-icon">📦</span>
          <span className="home-tile-label">{t('navProducts')}</span>
          <span className="home-tile-sub">{t('productsSub')}</span>
        </button>
        <button className="home-tile" onClick={() => go('reports')}>
          <span className="home-tile-icon">📊</span>
          <span className="home-tile-label">{t('navReports')}</span>
          <span className="home-tile-sub">{t('reportsSub')}</span>
        </button>
      </div>

      {/* Settings row */}
      <button className="home-settings-row" onClick={() => go('settings')}>
        <span>⚙️</span>
        <span style={{ flex: 1 }}>{t('navSettings')}</span>
        <span className="home-settings-arrow">›</span>
      </button>

      {/* Today summary */}
      <div className="home-today">
        <div className="home-stat">
          <span>{t('todaySales')}</span>
          <strong>{money(todaySales)}</strong>
          {todayCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>{todayCount} {todayCount === 1 ? 'sale' : 'sales'}</span>}
        </div>
        <div className="home-divider" />
        <div className="home-stat">
          <span>{t('todayProfit')}</span>
          <strong style={{ color: 'var(--green)' }}>{money(todayProfit)}</strong>
        </div>
      </div>

    </div>
  )
}
